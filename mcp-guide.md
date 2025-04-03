# MCP サーバーとは何か

**Model Context Protocol (MCP)** は、Anthropic が推進するオープンスタンダードで、LLM（大規模言語モデル）に対して外部データやツール、プロンプトを安全かつ効率的に提供するための通信プロトコルです。  
これにより、AI アシスタントは学習済みの知識に加え、リアルタイムのコンテキスト情報を取得したり、外部システム上で実際の処理（例：ファイル操作、API 呼び出し、計算処理）を実行したりすることが可能になります。

---

# MCP サーバーの構造と役割

MCP サーバーは、主に以下の 3 種類の機能を提供します：

- **リソース (Resources):**  
  ファイルの内容、データベースレコード、API レスポンスなど、AI にとって有用な情報を提供します。

- **ツール (Tools):**  
  外部システム上で実行可能な関数やアクションを提供します。これにより、AI は具体的な操作（例：サイコロを振る、ファイルを作成するなど）を外部に委任できます。

- **プロンプト (Prompts):**  
  特定のタスク実行のためのテンプレートやガイドラインを提供します。ユーザーや AI がタスクを標準化された形で実行できるようにします。

### Sequential Thinking サーバーを例にした構造

参考実装である [sequentialthinking](https://uithub.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) は、以下の特徴を持っています：

- **シーケンシャルな実行:**  
  複数のツール呼び出しを連続的に実行することで、AI が逐次的に判断・処理を行えるよう設計されています。

- **公式 SDK の利用:**  
  Anthropic の公式 MCP SDK（TypeScript 用）を用いており、標準化されたツール定義や通信手順に基づいて実装されています。

- **スタンダードなトランスポート:**  
  標準入出力（stdio）トランスポートを利用して、Claude Desktop などの MCP クライアントと簡単に接続できるようになっています。

---

# 公式ライブラリの解説

MCP サーバーの実装には、Anthropic が提供する公式 SDK が利用されます。  
公式 SDK の主な特徴は次の通りです：

- **サーバー初期化:**  
  `McpServer` クラスを用いてサーバー名、バージョン、機能などを設定し、MCP サーバーのインスタンスを作成します。

- **ツールの登録:**  
  `server.tool()` メソッドを使用して、MCP ツール（＝関数）を定義・登録できます。  
  ツールは、名前、説明、入力スキーマ、及び実際の処理関数で構成され、入力検証には [zod](https://github.com/colinhacks/zod) などのライブラリが利用されます。

- **トランスポートのサポート:**  
  標準入出力（stdio）や HTTP（SSE）など、複数の通信手段をサポートしており、MCP クライアント（例：Claude Desktop）との接続を容易にします。

---

# 関数（ツール）の解説

MCP サーバーにおける「ツール」は、実際に AI が呼び出して処理を実行する関数です。ツールの定義は以下の要素から構成されます：

- **名前:**  
  ユニークな識別子。例：`getDiceRoll`

- **説明:**  
  ツールの機能や用途を説明するテキスト。クライアントはこの説明を元に、どのツールを呼び出すか判断します。

- **入力スキーマ:**  
  [zod](https://github.com/colinhacks/zod) などのライブラリを用いて、ツールが受け取るパラメーターの形式（例：整数、文字列など）を定義します。これにより、不正な入力が防止されます。

- **実装関数:**  
  非同期関数として実装し、入力パラメーターに基づく処理を実行、結果をオブジェクト形式で返します。返すオブジェクトは必ず `content` プロパティを持ち、内容は `type`（例：`text`）と `text`（文字列結果）を含みます。

---

# サンプル例：サイコロを振るツールの実装

以下は、MCP サーバー上に「サイコロを振る」ツールを実装するサンプルコードです。  
このツールは、入力としてサイコロの面数（`sides`）を受け取り、1 ～ sides のランダムな整数を返します。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 1. MCPサーバーの初期化
const server = new McpServer({
  name: "DiceRoller",
  version: "0.1.0",
});

// 2. ツール（関数）の定義・登録
server.tool(
  "getDiceRoll", // ツール名
  "指定された面数のサイコロを振り、結果を返します。", // ツールの説明
  {
    sides: z.number().min(1).describe("サイコロの面数"), // 入力スキーマ: 1以上の整数
  },
  async ({ sides }) => {
    // 1からsidesまでのランダムな整数を生成
    const roll = Math.floor(Math.random() * sides) + 1;
    return {
      content: [
        {
          type: "text",
          text: roll.toString(),
        },
      ],
    };
  }
);

// 3. サーバーの起動：標準入出力（stdio）トランスポートを利用
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // ログは標準エラー出力に出力（標準出力はプロトコル通信に使用されるため）
  console.error("MCP Server is running on stdio transport");
}

main().catch((err) => {
  console.error("Error starting MCP Server:", err);
  process.exit(1);
});
```
