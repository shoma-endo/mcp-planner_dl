import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ツール定義とツール関数のインポート
import {
  INITIALIZE_PROJECT_TOOL,
  NOTIFY_COMPLETION_TOOL,
  GET_TODO_LIST_TOOL,
  ADD_NEW_TASKS_TOOL,
} from "./tools/interface.js";

// プロンプト設定関数のインポート
import { setupPrompts } from "./prompts/index.js";

import {
  initializeProject,
  notifyCompletion,
  getTodoList,
  addNewTasks,
} from "./tools/func.js";

// MCP サーバーの作成
const server = new Server(
  {
    name: "mcp-task-planner",
    version: "0.1.0",
    description: "タスク計画と進捗管理のためのMCPサーバー",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// ツール一覧をサーバーに登録
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    INITIALIZE_PROJECT_TOOL,
    NOTIFY_COMPLETION_TOOL,
    GET_TODO_LIST_TOOL,
    ADD_NEW_TASKS_TOOL,
  ],
}));

// プロンプト機能の設定
setupPrompts(server);

// ツール呼び出しハンドラの登録
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`ツール呼び出し: ${request.params.name}`);

  // ツール名に基づいて適切な関数を呼び出す
  switch (request.params.name) {
    case "initializeProject":
      return initializeProject(request.params.arguments as any);

    case "notifyCompletion":
      return notifyCompletion(request.params.arguments as any);

    case "getTodoList":
      return getTodoList();

    case "addNewTasks":
      return addNewTasks(request.params.arguments as any);

    default:
      return {
        content: [
          {
            type: "text",
            text: `未知のツールが呼び出されました: ${request.params.name}`,
          },
        ],
        isError: true,
      };
  }
});

// サーバーの起動関数
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    console.error("MCP Planner サーバーを起動中...");
    await server.connect(transport);
    console.error("MCP Planner サーバーが実行中です (Ctrl+C で終了)");
  } catch (error) {
    console.error("サーバー起動エラー:", error);
    process.exit(1);
  }
}

// エラーハンドリング
process.on("uncaughtException", (error) => {
  console.error("未捕捉の例外:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("未処理のPromise拒否:", reason);
});

// サーバーの実行
export default runServer;
