import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// プロンプト名の定義
export enum PromptName {
  WEB_APP_CREATION = "Next.jsアプリ生成",
  LP_CREATION = "LP分析後生成",
  RESEARCH_REPORT = "リサーチレポート作成",
}

// プロンプト定義
export const PROMPTS = [
  {
    name: PromptName.WEB_APP_CREATION,
    description:
      "Next.jsでのウェブアプリケーションの作成を支援するための実行計画プロンプト",
  },
  {
    name: PromptName.LP_CREATION,
    description:
      "ユーザーが指定した競合あるいは、作ろうとしているLPの競合を分析して、適切なLPを生成するプロンプト",
  },
  {
    name: PromptName.RESEARCH_REPORT,
    description: "ディープリサーチ",
  },
];

const DocumentRule = `ドキュメント生成をする時は以下のルールを守るようにしてください
1. 簡潔さと明確さを優先し、各セクションは要点を絞って記述してください
2. 視覚的表現（ASCII図など）は最小限に留め、必要な場合のみ使用してください
3. コードの例はドキュメントに含まないようにしましょう。最小で含むのは許可します
4. ドキュメントの長さは全体で2000文字以内に収めてください。`;

// MCPサーバーにプロンプト機能を追加する関数
export function setupPrompts(server: Server) {
  // プロンプト一覧をサーバーに登録
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: PROMPTS,
  }));

  // プロンプト取得ハンドラーの登録
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;

    switch (name) {
      case PromptName.WEB_APP_CREATION:
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: DocumentRule,
              },
            },
            {
              role: "assistant",
              content: {
                type: "text",
                text: `あなたはウェブアプリケーション開発のエキスパートです。与えられたプロジェクトコンテキストに基づいて、効率的で明確なタスクリストを作成してください。
ユーザーのリクエストの温度感に応じてタスクリストの内容を調整してください。
**何かわからない場合は、ユーザーに問い合わせましょう。**

また初回に計画を立てた後に、必ずユーザーに確認して必要に応じてタスクリストを調節しましょう

アプリケーションにはNext.jsおよびFirebaseかSupabaseを基本とします。Typescriptで、スタイリングにはtailwindcssを使うようにしましょう。
プロジェクトの初期設定には "BashTool"などターミナル操作のToolを使用してください。
存在しない場合にはユーザーに通知した上で、ファイル生成を進めてください

あなたが最初に作成する一般的なタスクの流れは以下の通りです

# 準備
- ユーザーペルソナとニーズの定義
  - 必要に応じて論文や客観的データなどをsearchツール(brave search)を活用して検索する
  - 出力はmarkdown
- 既存サービスと市場調査
   - deep_researchツールを使用する
      - Perplexity's Deep Research APIのツールが存在すればそれを使うこと
    - サイトレイアウトなども必要に応じて参考にする
- 必要そうであれば技術調査
  - 仕様がシンプルではない場合にはsearchツール(brave search)を活用して行うようにしましょう
   - 調査結果はmarkdownで出力

# 設計
- 機能要件 [必須]
  - 機能要件をmarkdownで出力
- UI/UXデザインの定義
   - 内容を以下の主要セクションに限定してください：
    - デザイン原則（最大3つ）、カラーパレット（主要色のみ）、タイポグラフィ（基本フォントと階層のみ）、主要コンポーネント（カード、ナビゲーション、結果表示の3つのみ）、主要画面（ホーム、カード選択、結果解釈の3つのみ）、ユーザーフロー（占い実行の基本フローのみ）
    - ドキュメントはmarkdownで出力
- アーキテクチャとデータモデルの設計
  - シンプルでない場合には行うようにしましょう
  - 使用する機能要件をもとにデータモデル・アーキテクチャを作成する
  - ドキュメントはmarkdownで出力
    - ドキュメントにmermaid.jsにて図解を加えるのも良い

# 開発
- 環境のセットアップ[必須]
  - スタートテンプレートには　https://github.com/yahyaparvar/nextjs-template.git を使用する
    bashツールなどで、gitコマンドを実行中は処理が終わるまで待ちましょう
  - 初期設定には "BashTool"などターミナル操作のツールを使用するようにしましょう。存在しない場合にはユーザーに通知した上で、ファイル生成を進めてください
  - firebaseやsupabaseの部分は環境変数を入れると動作するようにしましょう
    - スタートする際にディレクトリの構成を確認しましょう。
    - データベースの初期設定は行わないようにします。上記を導入する場合には動作確認ができるようにコメントアウトし、モックデータを導入しましょう
    - モックデータの画像はhttps://placehold.co/600x400を使いましょう
- アプリケーションの実装[必須]
  - MVPの作成を行います
  - Next.jsなのでフロントもバックエンドも一緒に実装すること
    - 動作の実行にはBashツールなどMCPのToolを使うこと。ない場合には動作確認できないことをユーザーに伝える
  - 実装は順次あなたの中の順番にファイル追加をしていき、エラーが生じたら修正するイメージです
- 画面仕様書や操作手順書を追加する
  - 必要に応じて追加しましょうmarkdownで出力

# 最後に
- ロードマップの作成
  - どのようにユーザーが今後このアプリを開発していけばいいかのロードマップを作成しましょう

ドキュメントが細かすぎないように注意して
  `,
              },
            },
          ],
        };

      case PromptName.LP_CREATION:
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: DocumentRule,
              },
            },
            {
              role: "assistant",
              content: {
                type: "text",
                text: `あなたはウェブサイト/LP開発のエキスパートです。与えられたプロジェクトコンテキストに基づいて、効率的で明確なタスクリストを作成してください。
**何かわからない場合は、ユーザーに問い合わせましょう。**

LP（ランディングページ）の作成を基本とします。
技術スタックは**静的なHTML/CSS/JS**で行います
プロジェクトの初期設定やビルドには "BashTool"などターミナル操作のToolを使用してください。存在しない場合にはユーザーに通知した上で、ファイル生成を進めてください。

あなたが最初に作成する一般的なタスクの流れは以下の通りです。

# 準備
- LPの目的とターゲットオーディエンスの定義 [必須]
  - LPで達成したい具体的な目標（例: メールリスト登録、問い合わせ、資料ダウンロード）と、誰に向けたページなのかを明確にします。
  - 必要に応じて、ターゲット層に関する簡単な調査をsearchツール(brave search)で行います。
  - 出力はmarkdown形式とします。
- 競合LP調査
  - 類似の製品やサービスのLPを調査し、デザイン、コピー（文章）、CTA（行動喚起）などを分析します。
  - searchツール(brave search)を行い、playwrightのToolで実際にページを確認します。
    - playwrightのToolは画像を含むことがあり重くなります。そのため、重要だと思われるサイトのみアクセスします。最大3つまで
  - 参考になる点をmarkdown形式でまとめて記録します。
  - キャッチコピーや見せ方に関してはインサイト分析を行いましょう

# 設計
- コンテンツ要件と構成案の定義 [必須]
  - LPに必要なセクション（例: ヒーローセクション, 問題提起, 解決策/特徴, お客様の声, CTA, FAQ, フッター）と、各セクションに含めるテキスト、画像、動画などのコンテンツ要素をリストアップします。
  - 主要なCTA（Call to Action）を明確にします。
  - 簡易にmarkdown形式で出力します。
- ワイヤーフレームまたは簡単なUIデザイン [必須]
  - LPの全体的なレイアウトと要素の配置を視覚化します。（詳細なデザインではなく、構成を理解するためのもの）
  - 意識すべきデザインのポイント（例：シンプルさ、明確なCTA、視線誘導）、カラーパレット（主要色）、タイポグラフィ（基本フォント）を定義します。
  - markdown形式、または簡単な図（テキストベースでも可）で出力します。

# 開発
- 環境のセットアップ [必須]
  - 選択した技術スタック（HTML/CSS/JS）に基づいて、開発環境をセットアップします。
  - HTML/CSS/JSの場合は、基本的なファイル構造を作成します。
  - BashTool などのターミナル操作ツールを使用します。存在しない場合にはユーザーに通知した上で、ファイル生成を進めてください。
- LPの実装 [必須]
  - 設計フェーズで定義したコンテンツ要件と構成案に基づき、HTML, CSS, および必要に応じてJavaScript を用いてLPをコーディングします。
  - レスポンシブデザインに対応させます（スマートフォン表示を優先的に確認）。
  - 画像などのアセットは、ユーザー提供のものを利用するか、プレースホルダー（例: https://placehold.co/600x400）を使用します。
  - 実装は主要セクションごとに進め、表示崩れなどがあれば都度修正します
                `,
              },
            },
          ],
        };

      case PromptName.RESEARCH_REPORT:
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: "",
              },
            },
          ],
        };

      case PromptName.RESEARCH_REPORT:
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: "あなたはプロジェクト管理のエキスパートです。与えられたプロジェクトコンテキストに基づいて、効率的で明確なタスクリストを作成してください。",
              },
            },
            {
              role: "user",
              content: {
                type: "text",
                text: "このプロジェクトについて、タスクリストを作成してください。各タスクには名前、推定所要時間、優先度（高/中/低）を含めてください。",
              },
            },
          ],
        };

      default:
        throw new Error(`未知のプロンプト: ${name}`);
    }
  });
}
