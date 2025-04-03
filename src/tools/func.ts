import fs from "fs/promises";
import path from "path";
import os from "os";
import { 
  InitializeProjectParams, 
  NotifyCompletionParams, 
  AddNewTasksParams,
  TaskData
} from "./interface.js";

// タスクデータを保持する変数
let taskData: TaskData | null = null;

// 現在日時のタイムスタンプを取得する関数
export function getCurrentTimestamp(): string {
  return Date.now().toString();
}

// todoリスト.mdファイルの更新関数
export async function updateTodoFile() {
  if (!taskData) return;

  const todoFilePath = path.join(taskData.projectDir, "todoリスト.md");

  // todoリスト.mdの内容生成
  let content = `# ${taskData.taskName} - ToDo リスト\n\n`;
  content += `最終更新: ${new Date().toLocaleString("ja-JP")}\n\n`;

  // 備考セクションの追加
  content += `## 備考・作業ルール\n\n`;
  content += `- 作業は必ず \`${taskData.projectDir}\` ディレクトリで行ってください\n`;
  content += `- サブディレクトリ構成: \`data/\`（データファイル）、\`app/\`（アプリケーションコード）、\`docs/\`（ドキュメント）\n`;
  content += `- タスクの完了報告には \`notifyCompletion\` ツールを使用してください\n`;
  content += `- 現在のToDoリストを確認するには \`getTodoList\` ツールを使用できます\n`;
  content += `- 各タスクは指定された順序で実行することを推奨します\n`;
  content += `- フェーズ内のすべてのタスクが完了したら次のフェーズに進んでください\n\n`;
  content += `- 調査タスクやテストの実行、タスク報告などの際にはdocs以下にmd形式で必要性が高い場合にはドキュメントを残すようにしましょう\n`;
  content += `- 進捗が100%になったら、タスクは完了してよいです\n\n`;

  // 進捗状況の計算
  let completedTasks = 0;
  let totalTasks = 0;

  taskData.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      totalTasks++;
      if (task.completed) {
        completedTasks++;
      }
    });
  });

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  content += `## 進捗状況\n\n`;
  content += `- 完了タスク: ${completedTasks}/${totalTasks} (${progressPercentage}%)\n\n`;

  // 各フェーズとタスクの記載
  taskData.phases.forEach((phase) => {
    content += `## ${phase.name}\n\n`;

    phase.tasks.forEach((task) => {
      const status = task.completed ? "✅" : "⬜";
      const toolInfo = task.tool ? ` (ツール: ${task.tool})` : "";
      content += `- [${status}] ${task.name}${toolInfo}\n`;
    });

    content += "\n";
  });

  // ToDoリストファイルに書き込み
  await fs.writeFile(todoFilePath, content, "utf-8");
}

// プロジェクトディレクトリの作成処理
export async function initializeProject(params: InitializeProjectParams) {
  console.error(`プロジェクト初期化開始: ${params.taskName}`);
  try {
    const timestamp = getCurrentTimestamp();
    const projectDir = path.join(os.homedir(), "Downloads", timestamp);

    // プロジェクトディレクトリの作成
    await fs.mkdir(projectDir, { recursive: true });
    console.error(`プロジェクトディレクトリを作成しました: ${projectDir}`);

    // サブディレクトリの作成
    await fs.mkdir(path.join(projectDir, "data"), { recursive: true });
    await fs.mkdir(path.join(projectDir, "app"), { recursive: true });
    await fs.mkdir(path.join(projectDir, "docs"), { recursive: true });

    // 初期データの保存
    taskData = {
      projectDir,
      taskName: params.taskName,
      phases: [],
    };

    // 指定されたフェーズとタスクを追加
    if (params.phases && params.phases.length > 0) {
      taskData.phases = params.phases.map((phase) => ({
        name: phase.name,
        tasks: phase.tasks.map((task) => ({
          name: task.name,
          tool: task.tool,
          completed: false,
        })),
      }));
    }

    // todoリスト.mdファイルの作成
    await updateTodoFile();

    // todoリストの内容を取得
    const todoFilePath = path.join(projectDir, "todoリスト.md");
    const todoContent = await fs.readFile(todoFilePath, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `プロジェクトが初期化されました。\nプロジェクトディレクトリ: ${projectDir}\nタスク名: ${params.taskName}`,
        },
        {
          type: "text",
          text: `\n\n# ToDoリスト\n${todoContent}`,
        },
      ],
    };
  } catch (error) {
    console.error("プロジェクト初期化エラー:", error);
    return {
      content: [
        {
          type: "text",
          text: `プロジェクト初期化中にエラーが発生しました: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

// タスク完了の通知処理
export async function notifyCompletion(params: NotifyCompletionParams) {
  try {
    if (!taskData) {
      return {
        content: [
          {
            type: "text",
            text: "プロジェクトが初期化されていません。先にinitializeProjectツールを使用してください。",
          },
        ],
        isError: true,
      };
    }

    // フェーズの検索
    const phaseIndex = taskData.phases.findIndex(
      (phase) => phase.name === params.phaseName
    );

    if (phaseIndex === -1) {
      return {
        content: [
          {
            type: "text",
            text: `フェーズ「${params.phaseName}」が見つかりません。`,
          },
        ],
        isError: true,
      };
    }

    // タスクの検索
    const taskIndex = taskData.phases[phaseIndex].tasks.findIndex(
      (task) => task.name === params.taskName
    );

    if (taskIndex === -1) {
      return {
        content: [
          {
            type: "text",
            text: `タスク「${params.taskName}」が見つかりません。`,
          },
        ],
        isError: true,
      };
    }

    // タスクを完了としてマーク
    taskData.phases[phaseIndex].tasks[taskIndex].completed = true;

    // todoリスト.mdファイルの更新
    await updateTodoFile();

    // 完了したタスク数と全タスク数を計算
    let completedTasks = 0;
    let totalTasks = 0;

    taskData.phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        totalTasks++;
        if (task.completed) {
          completedTasks++;
        }
      });
    });

    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    return {
      content: [
        {
          type: "text",
          text: `タスク「${params.taskName}」が完了しました。\n進捗状況: ${completedTasks}/${totalTasks} タスク完了 (${progressPercentage}%)`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `タスク完了の通知中にエラーが発生しました: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

// ToDoリストの取得処理
export async function getTodoList() {
  try {
    if (!taskData) {
      return {
        content: [
          {
            type: "text",
            text: "プロジェクトが初期化されていません。先にinitializeProjectツールを使用してください。",
          },
        ],
        isError: true,
      };
    }

    const todoFilePath = path.join(taskData.projectDir, "todoリスト.md");

    try {
      const content = await fs.readFile(todoFilePath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "ToDoリストファイルの読み込みに失敗しました。",
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `ToDoリストの取得中にエラーが発生しました: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

// 新しいタスクの追加処理
export async function addNewTasks(params: AddNewTasksParams) {
  try {
    if (!taskData) {
      return {
        content: [
          {
            type: "text",
            text: "プロジェクトが初期化されていません。先にinitializeProjectツールを使用してください。",
          },
        ],
        isError: true,
      };
    }

    // taskDataがnullでないことを型システムに伝えるための一時変数
    const currentData = taskData;

    // 進捗状況を確認
    let completedTasks = 0;
    let totalTasks = 0;

    currentData.phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        totalTasks++;
        if (task.completed) {
          completedTasks++;
        }
      });
    });

    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // フェーズとタスクを追加
    let newTasksAdded = 0;
    params.phases.forEach((newPhase) => {
      // 既存のフェーズを探す
      const existingPhaseIndex = currentData.phases.findIndex(
        (phase) => phase.name === newPhase.name
      );

      if (existingPhaseIndex >= 0) {
        // 既存のフェーズにタスクを追加
        newPhase.tasks.forEach((newTask) => {
          // 同名のタスクがないか確認
          const taskExists = currentData.phases[existingPhaseIndex].tasks.some(
            (task) => task.name === newTask.name
          );

          if (!taskExists) {
            currentData.phases[existingPhaseIndex].tasks.push({
              ...newTask,
              completed: false,
            });
            newTasksAdded++;
          }
        });
      } else {
        // 新しいフェーズを追加
        currentData.phases.push({
          name: newPhase.name,
          tasks: newPhase.tasks.map((task) => ({
            ...task,
            completed: false,
          })),
        });
        newTasksAdded += newPhase.tasks.length;
      }
    });

    // todoリスト.mdファイルの更新
    await updateTodoFile();

    // 更新後のTodoリストを取得
    const todoFilePath = path.join(currentData.projectDir, "todoリスト.md");
    const todoContent = await fs.readFile(todoFilePath, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `新しいタスクが追加されました。\n追加されたタスク数: ${newTasksAdded}\n元の進捗状況: ${progressPercentage}%`,
        },
        {
          type: "text",
          text: `\n\n# 更新されたToDoリスト\n${todoContent}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `新しいタスクの追加中にエラーが発生しました: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}
