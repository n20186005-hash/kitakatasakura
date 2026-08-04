# Kitakata Sakura Guide

日中線しだれ桜並木ガイドの静的サイトです。Cloudflare Workers Static Assets で配信します。

## ローカル開発

```sh
npm install
npm run dev
```

Wrangler が表示するローカル URL をブラウザで開いて確認します。

## デプロイ前の検証

```sh
npm run check
```

## Cloudflare Workers へデプロイ

初回のみ Cloudflare アカウントへログインします。

```sh
npx wrangler login
npm run deploy
```

デプロイ後、Wrangler が `workers.dev` の URL を表示します。独自ドメインは Cloudflare ダッシュボードの Worker の「Settings > Domains & Routes」から追加できます。

公開対象は `public/` の中だけです。サイトの HTML、CSS、JavaScript、画像はこのディレクトリに配置してください。
