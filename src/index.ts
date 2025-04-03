import runServer from "./mcp-server.js";

/**
 * MCP-Plannerアプリケーション
 *
 * このアプリケーションは、MCPプロトコルを使用してタスク計画と進捗管理を行います。
 * 公式の@modelcontextprotocol/sdkを使用して実装されています。
 *
 * 以下のツールが利用可能です：
 * - initializeProject: プロジェクトを初期化します
 * - addPhase: 新しいフェーズをタスク計画に追加します
 * - notifyCompletion: タスクの完了を通知します
 * - getTodoList: 現在のToDoリストを表示します
 */

// サーバーを起動
runServer().catch((error) => {
  console.error("サーバー起動中にエラーが発生しました:", error);
  process.exit(1);
});
