import { Tool } from "@modelcontextprotocol/sdk/types.js";

// タスクデータを保持する型定義
export interface TaskData {
  projectDir: string;
  taskName: string;
  phases: {
    name: string;
    tasks: { name: string; tool?: string; completed: boolean }[];
  }[];
}

// 初期化ツールのパラメータ型
export interface InitializeProjectParams {
  taskName: string;
  phases?: {
    name: string;
    tasks: { name: string; tool?: string }[];
  }[];
}

// タスク完了通知のパラメータ型
export interface NotifyCompletionParams {
  phaseName: string;
  taskName: string;
}

// 新規タスク追加のパラメータ型
export interface AddNewTasksParams {
  phases: {
    name: string;
    tasks: { name: string; tool?: string }[];
  }[];
}

// ツール定義
export const INITIALIZE_PROJECT_TOOL: Tool = {
  name: "initializeProject",
  description: `新しいリクエスト(プロジェクト）として初期化し、必要なディレクトリ構造とタスク計画を作成します。

# 使用するタイミング:
- プロジェクト作業の最初に必ず呼び出す必要があります
- 他のツールを使用する前に必ず実行してください
- 完全に新しいタスクを開始するときに使用しましょう

# 主な機能:
- ~/Documents/MCPPlanner/${Date.now()}/ ディレクトリを作成します
- data/, app/, docs/ サブディレクトリを作成します
- 初期のToDoリスト（todoリスト.md）を作成します
- プロジェクトの基本構造をセットアップします
- フェーズとタスクを一度に設定します

~/Documents/MCPPlanner/${Date.now()}/ #プロジェクトのルートディレクトリ
│
├── data/  # データファイル用ディレクトリ
│   ├── 設定ファイル
│   ├── JSONデータ
│   ├── CSVデータ
│   └── その他のデータリソース
├── app/  # アプリケーションコード用ディレクトリ(開発プロジェクトの場合)
├── docs/  # ドキュメント用ディレクトリ
│   ├── 仕様書
│   ├── 手順書
│   ├── 調査レポート
│   └── その他の参考資料
└── todoリスト.md  # タスク管理用ファイル

必要に応じてツールを活用してタスクを進めてください。
検索を行う場合には、情報の深みを求める場合にはdeep_researchを、通常はbrave_searchを使いましょう


パラメータ:
- taskName: ユーザーのリクエスト（プロジェクト）の名前（例：「ゲームWebアプリケーションの開発」）
- phases: プロジェクトのフェーズとタスクを階層的に定義する配列（オプション）
  - フェーズ名と、そのフェーズに含まれるタスクを定義できます
  - 各タスクには使用するツール名も指定可能です（オプション。開発タスクなどは複数コマンドを使うのが必要なため指定をしないように）`,
  inputSchema: {
    type: "object",
    properties: {
      taskName: {
        type: "string",
        description: "このプロジェクト/タスクの名前",
      },
      phases: {
        type: "array",
        description: "このプロジェクトのフェーズ（段階）とタスクを定義する配列",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "フェーズの名前（例：'設計'、'開発'、'テスト'など）",
            },
            tasks: {
              type: "array",
              description: "このフェーズに含まれるタスクのリスト",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "タスクの名前",
                  },
                  tool: {
                    type: "string",
                    description: "このタスクで使用するツール名（オプション）",
                  },
                },
                required: ["name"],
              },
            },
          },
          required: ["name", "tasks"],
        },
      },
    },
    required: ["taskName"],
  },
};

export const NOTIFY_COMPLETION_TOOL: Tool = {
  name: "notifyCompletion",
  description: `タスクの完了を通知し、進捗状況を更新します。

使用するタイミング:
- タスクを完了したことを記録したい場合
- 進捗状況を更新したい場合
- 次のタスクに進む前に現在のタスクを閉じたい場合

主な機能:
- 指定されたタスクを完了としてマークします
- todoリスト.mdファイルを更新します
- 進捗状況の統計を返します


パラメータ:
- phaseName: 完了したタスクが属するフェーズの名前
- taskName: 完了したタスクの名前`,
  inputSchema: {
    type: "object",
    properties: {
      phaseName: {
        type: "string",
        description: "フェーズの名前",
      },
      taskName: {
        type: "string",
        description: "完了したタスクの名前",
      },
    },
    required: ["phaseName", "taskName"],
  },
};

export const GET_TODO_LIST_TOOL: Tool = {
  name: "getTodoList",
  description: `現在のToDoリストを表示します。

使用するタイミング:
- 現在の進捗状況を確認したい場合
- 次に何をすべきかを確認したい場合
- タスク全体の概要を把握したい場合

主な機能:
- todoリスト.mdファイルの内容をそのまま返します`,
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const ADD_NEW_TASKS_TOOL: Tool = {
  name: "addNewTasks",
  description: `このプロジェクトでのリクエストされたタスクが100%完了した後に再度リクエストがあった場合に使用されます。

使用するタイミング:
- 全てのタスクが完了した後に新しいタスクが必要な場合
- クライアントから追加リクエストがあった場合
- 進行中に追加の作業が必要になった場合

注意: 初期化されていないプロジェクトでは、まず initializeProject を使用して初期化してください。

主な機能:
- 新しいフェーズやタスクを現在のプロジェクトに追加します
- ToDoリストを更新します
- 進行中のタスクを継続できるようにします`,
  inputSchema: {
    type: "object",
    properties: {
      phases: {
        type: "array",
        description: "追加するフェーズとタスクの配列",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "フェーズの名前",
            },
            tasks: {
              type: "array",
              description: "このフェーズに含まれるタスクのリスト",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "タスクの名前",
                  },
                  tool: {
                    type: "string",
                    description: "このタスクで使用するツール名（オプション）",
                  },
                },
                required: ["name"],
              },
            },
          },
          required: ["name", "tasks"],
        },
      },
    },
    required: ["phases"],
  },
};
