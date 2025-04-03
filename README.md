# MCP Planner

**タスク計画のための Multi-modal Control Protocol (MCP) サーバー**

## 概要

MCP Planner は、開発プロジェクトなどのタスク計画・管理を支援するために設計された MCP サーバーです。
[Model Context Protocol (MCP)](https://windsurf.codeium.com/docs/mcp) に準拠し、ホストシステム (例: IDE) と連携して動作します。
ユーザーからの指示に基づき、タスクの分解、リスト化、進捗管理などを行う機能を提供します。

## プロジェクト構成

```
mcp-planner/
├── .git/
├── dist/             # コンパイルされた JavaScript ファイル
├── node_modules/
├── src/              # TypeScript ソースコード
│   ├── index.ts      # エントリーポイント
│   ├── mcp-server.ts # MCP サーバーのコアロジック
│   ├── prompts/
│   │   └── index.ts  # LLM へのプロンプト定義
│   └── tools/
│       ├── func.ts   # MCP ツールの実装
│       └── interface.ts # MCP ツールのインターフェース定義 (Zod スキーマ)
├── .gitignore
├── jest.config.js    # Jest 設定ファイル
├── mcp-guide.md      # (MCP に関するガイド - 既存ファイル)
├── package.json      # プロジェクト設定、依存関係
├── package-lock.json
├── README.md         # このファイル
├── this_app.md       # (アプリケーションに関するメモ - 既存ファイル)
├── todo.md           # (ToDo メモ - 既存ファイル)
├── tsconfig.json     # TypeScript 設定ファイル
└── yarn.lock
```

## 技術スタック

- **言語:** TypeScript
- **ランタイム:** Node.js
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **スキーマ定義/バリデーション:** `zod`
- **テストフレームワーク:** Jest (`ts-jest`)
- **パッケージマネージャー:** Yarn (または npm)

## インストール

```bash
cd mcp-planner
yarn install # または npm install
```

## ビルド

TypeScript コードを JavaScript にコンパイルします。

```bash
yarn build # または npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## 実行

### 開発モード

TypeScript ファイルを直接実行して開発する場合：

```bash
yarn dev # または npm run dev
```

### 本番モード (MCP サーバーとして)

ビルド済みの JavaScript を実行します。

```bash
yarn start # または npm start
```

**ホストシステムとの連携:**

MCP Planner をホストシステム (例: Windsurf IDE) から MCP サーバーとして利用するには、ホストシステム側で以下の設定が必要です。

1.  ホストシステムの設定で新しい MCP サーバーを追加します。
2.  サーバー名として「MCP Planner」（または任意）を指定します。
3.  実行コマンドとして `node /path/to/mcp-planner/dist/index.js` を指定します (`/path/to/` は実際のプロジェクトパスに置き換えてください)。

## 主な機能 (MCP ツール)

MCP Planner は、ホストシステムから呼び出される以下の主要なツール (関数) を提供します。
これらのツールの詳細なインターフェース (入力/出力) は `src/tools/interface.ts` で Zod スキーマとして定義されており、具体的な処理ロジックは `src/tools/func.ts` に実装されています。

- **`initializeProject`**:
  - 説明: 新しいリクエスト(プロジェクト）として初期化し、必要なディレクトリ構造とタスク計画を作成します。プロジェクト作業の最初に必ず呼び出す必要があります。
- **`notifyCompletion`**:
  - 説明: 特定のタスクが完了したことを MCP Planner に通知し、進捗状況を更新します。内部のタスク状態（todo リスト.md）を更新します。
- **`getTodoList`**:
  - 説明: 現在管理している ToDo リスト (todo リスト.md ファイルの内容) を表示します。
- **`addNewTasks`**:
  - 説明: 現在のプロジェクトに新しいフェーズやタスクを追加します。全てのタスク完了後に新しいタスクが必要になった場合などに使用します。

_(注意: `src/tools/func.ts` には上記以外にもツールが実装されている可能性があります。)_

## テスト

```bash
yarn test # または npm test
```

## トラブルシューティング

### MCP サーバーが認識されない場合

1.  ホストシステムで設定した MCP サーバーの実行コマンドパス (`node /path/to/mcp-planner/dist/index.js`) が正しいか確認してください。
2.  `dist/index.js` ファイルが存在するか確認してください。存在しない場合は、`yarn build` を実行してプロジェクトをビルドしてください。
3.  ホストシステムを再起動してみてください。

### その他の問題

問題が解決しない場合は、以下の情報を含めて Issue を作成してください。

- OS の種類とバージョン
- Node.js のバージョン (`node -v`)
- Yarn または npm のバージョン (`yarn -v` / `npm -v`)
- エラーメッセージやログ
- 問題が発生した際の操作手順

## ライセンス

MIT
