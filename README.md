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

## 評価・口コミの同期について

- サイトに表示している評価と口コミ数は **Google マップ（Google Maps）のユーザー評価を同期したもの** です。
  - 現在の同期値：`4.3 / 5`、口コミ `2,218` 件、同期時間 **2026年9月**
  - 同期元：<https://maps.app.goo.gl/pHsFyrA4fCW1Y7kdA>
- 評価・口コミ数は **JSON-LD（構造化データ）には含めていません**。ページ表示のみで引用し、出典と同期時間を併記しています。
- 個々の口コミ本文は著作権（投稿者および Google マップ）に配慮して転載していません。集計値のみを引用し、最新の口コミは Google マップで確認できる導線を設置しています。

値を更新する場合は次の箇所を同じ数値に書き換えてください。

- `public/index.html`：首屏 `.hero-rating`、評価セクション `#reviews`、FAQ「Google マップでの評価はどうなっていますか？」、資料ソース `#sources`
- `public/index.html` の FAQPage 構造化データ（最後の Question）

## コンテンツ構成

`public/index.html` は単一ページで、次の構成になっています（すべての見出しにエンティティ名を紐づけています）。

開花案内 → 天気（現在＋7日間）→ About → 評価・口コミ → 3kmの歩き方 → タイプ別コース（家族／写真／低体力）→ 半日・一日モデルコース → 二つの象徴 → 歴史 → 歴史の物語 → 交通・駐車場 → 交通手段別（空路・鉄道・バス・車・タクシー・レンタカー）→ 周辺施設（トイレ・駐車場・飲食・宿泊・買い物・給油充電・休憩・医療）→ 四季の戦略 → 喜多方を巡る → 暮らしの中の桜道 → 科普とマナー → FAQ → 資料ソース

- 施設・店舗は**種類（タイプ）のみ**を中立的に紹介し、特定の事業者名は掲載していません（非営利ガイドの方針）。
- 天気は `weather.js` が Open-Meteo の予測値（現在＋7日間）と花粉の目安を取得して描画します。取得結果は `localStorage`（10分間）に保存し、通信失敗時は気象庁の防災情報へ誘導します。
- 同じ予測値から **「注意点（リスク）／服装の目安／遊び方のヒント／持っていくと便利なもの」** を自動生成します。条件を満たさない項目は表示されず、リスクがある時だけ上部に注意ブロックが出ます。しきい値は `weather.js` の `buildAdvice()` にまとめてあります。
- 天気は予測値であり、警報・注意報は必ず気象庁の公式情報で確認してください。

## PWA

- `public/manifest.webmanifest`：アプリ名・アイコン（`public/assets/icons/`）・テーマカラーを定義
- `public/sw.js`：静的アセットをプリキャッシュし、オフラインでも閲覧可能（Service Worker は `script.js` で登録）
- `public/_headers`：`sw.js` を no-cache、画像を 7 日キャッシュに設定

アイコンを再生成する場合は 512px 以上の PNG（通常用途・maskable）と Apple Touch Icon を用意して `public/assets/icons/` に配置し、`manifest.webmanifest` の `icons` を更新してください。
