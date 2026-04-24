# realtime-slide

リアルタイムで写真を共有・スライドショー表示するWebアプリです。結婚式や各種イベントで、参加者がスマホから写真をアップロードすると、会場のスクリーンにリアルタイムで映し出されます。絵文字リアクションの送信にも対応しています。

## 主な機能

- **リアルタイム写真共有**: 参加者がアップロードした写真が即座にスクリーンへ反映
- **スライドショー表示**: 5秒ごとに写真が自動切り替え（フェードトランジション付き）
- **絵文字リアクション**: ❤️ 🎉 👏 😊 👍 をスクリーンに流すことができる
- **画像最適化**: Cloudinary による自動フォーマット・品質最適化

## 画面構成

| URL | 説明 |
|-----|------|
| `/` | トップページ（各ページへのナビゲーション） |
| `/upload` | 写真アップロード・リアクション送信 |
| `/screen` | スライドショー表示（会場スクリーン用） |

## 技術スタック

- **フレームワーク**: Next.js / React / TypeScript
- **スタイリング**: Tailwind CSS
- **リアルタイム通信**: Pusher（WebSocket）
- **画像ストレージ**: Cloudinary
- **フォント**: Noto Sans JP

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` をプロジェクトルートに作成し、以下の値を設定します。

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher (サーバーサイド)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Pusher (クライアントサイド)
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

**Cloudinary**: [cloudinary.com](https://cloudinary.com) でアカウント作成後、ダッシュボードから取得  
**Pusher**: [pusher.com](https://pusher.com) で Channels アプリを作成後、App Keys から取得

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開きます。

## 使い方

1. **スクリーン用PC**: `/screen` を全画面表示で開き、会場のプロジェクターに映す
2. **参加者のスマホ**: `/upload` にアクセスして写真を選択・送信
3. 写真はスライドショーキューに即座に追加され、リアクションはスクリーン上に浮かび上がる

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| `POST` | `/api/upload` | 画像を Cloudinary にアップロードし Pusher でブロードキャスト |
| `GET` | `/api/photos` | アップロード済み写真一覧を取得（最新100件） |
| `POST` | `/api/reaction` | 絵文字リアクションをブロードキャスト |

## ビルド・デプロイ

```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

Vercel へのデプロイが最も簡単です。環境変数をプロジェクト設定に追加するだけで動作します。
