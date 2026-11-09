---
title: History モードと 404 ページ
group: ルーティング
order: 70
source: 6101fd8ae15f
---

## きれいな URL（history モード） {#clean-urls-history-mode}

ルーターはデフォルトで `/blog/hello` のようなきれいな URL を使います（「history モード」）。History API のない古いブラウザでは、`/#/blog/hello` のようなハッシュ URL にフォールバックします。

きれいな URL には、ホスティング側で 1 つだけ設定が必要です：ファイルではないすべてのパスに対して `index.html` を返すことです。そうしないと `/blog/hello` をリロードしたときに 404 になります。設定方法は[ビルドとデプロイ](/docs/core/build-and-deploy#deploying)を参照してください。

[プリレンダリング](/docs/core/prerendering)されたページにはこの設定は不要です。各ページは `dist/<route>/index.html` にある本物のファイルなので、どのホスティングでも配信されます。

## 404 ページ {#the-404-page}

`src/` の直下に `not-found.html` を追加します。どのルートにもマッチしないときに表示されます。これがない場合、不明な URL ではプレーンテキストの「Page Not Found!」が表示されます。

`not-found.html` は他のページと同じページなので、独自の [`<head>`](/docs/core/metadata)（title、`robots` など）を持てます。

動的ルート、複数のパラメータ、「キャッチオールなし」のルールについては[ファイル規約](/docs/file-conventions#dynamic-routes)を参照してください。
