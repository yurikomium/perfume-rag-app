# Perfume RAG Application

このアプリケーションは香水に関する情報を検索・閲覧できる RAG（Retrieval Augmented Generation）システムです。

## 動作
https://github.com/user-attachments/assets/4c228f34-02c1-441d-91b4-1d30b3033029

1. 検索条件を入れて「探す」をクリック
2. おすすめの香水が表示される
3. 「おすすめポイントを知る」を押すと、「香水のコンセプト」と「あなたにおすすめのポイント」が表示される

## RAG とは？

RAG（Retrieval Augmented Generation）は以下の 3 つのコンポーネントから構成されています。このアプリケーションでの実装は次のとおりです：

- **Retrieval（検索）**:

  - 実装: `searchDocs()` 関数（`utils/searchDocs.js`）
  - 機能: ユーザーのクエリをベクトル化し、データベースから類似度の高い香水情報を検索します
  - 処理: ユーザー入力を embedding モデルで変換し、ベクトル検索を実行して関連度の高いドキュメントを取得します

- **Augmentation（拡張）**:

  - 実装: `buildPrompt()` 関数（`utils/buildPrompt.js`）
  - 機能: 検索結果を構造化し、LLM へのプロンプトに統合します
  - 処理: 検索で得られた香水情報をフォーマットし、ユーザークエリと合わせてコンテキスト豊かなプロンプトを生成します

- **Generation（生成）**:
  - 実装: `fetchLLMResponse()` 関数（`utils/fetchLLMResponse.js`）
  - 機能: 拡張されたプロンプトを LLM に送信し、回答を生成します
  - 処理: Ollama API を通じて Llama 3.2 モデルと通信し、検索結果を基にした適切な回答を生成します

このアプリケーションでは、香水に関するデータを Chroma ベクトルデータベースに保存し、ユーザーの質問に対して関連する香水情報を検索・拡張し、LLM を活用して知識に基づいた回答を生成します。

## セットアップ方法

### 前提条件

- Node.js（推奨バージョン: 18.x 以上）
- npm
- LLM への接続環境（作者は Ollama を使用）

### インストール手順

1. リポジトリをクローンします

```bash
git clone <repository-url>
cd <repository-directory>
```

2. 依存関係をインストールします

```bash
npm install
```

3. データの準備
   - 自分で用意したデータを `data` ディレクトリに配置します（例を`example.json`に入れました）
   - scripts ディレクトリに移動し、データ準備スクリプトを実行します

```bash
cd scripts
node prepare-data.js
cd ..
```

4. 開発サーバーを起動します

```bash
npm run dev
```

5. ブラウザで http://localhost:3000/test にアクセスして、LLM との接続をテストします

6. 接続が確認できたら、http://localhost:3000/ にアクセスして香水の検索を開始できます！

## 現状の制限事項

- プロンプトインジェクションの対策は実装されていません
- LLM 接続にはローカルで動作する Llama 3.2 を使用しています（作者は Ollama を使用）
- Llama 3.2 だと現状のプロンプトはハルシネーションを起こす傾向にあります。プロンプトエンジニアリングにチャレンジしてみてください！（動作動画ではAnthropicのAPI Keyを使用しています）
- 接続設定やモデルの変更は `.env` ファイルで行えます

## 使用技術

- Next.js
- Vector Database（Chroma/Pinecone 等）
- LLM

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は LICENSE ファイルをご覧ください。
