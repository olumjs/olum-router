---
title: ルーター
group: ルーティング
order: 10
source: 7b9fd9832754
---

Olum は**ファイルベースのルーティング**を使います。`src/` 内の `page.html` を持つフォルダが、それぞれサイトのページになります。管理すべきルートの一覧はありません。フォルダ**そのものが**ルートです。

:::note[パッケージ]
ルーティングは `olum-router` パッケージで提供されます（スターターテンプレートにはすでに入っています）：

```bash
npm i olum-router
```

ルーティングが不要な場合は[独自の main.js を使う](#opting-out--your-own-mainjs)を参照してください。
:::

```text title="Project structure"
src/
├── page.html                 → /
├── not-found.html            → 404 page
│
├── about/
│   └── page.html             → /about
│
├── blog/
│   ├── page.html             → /blog
│   └── [slug]/
│       └── page.html         → /blog/:slug  (e.g. /blog/hello)
│
├── (marketing)/              → group: not part of the URL
│   └── pricing/
│       └── page.html         → /pricing
│
├── 01-guide/                 → number prefix: removed from the URL
│   └── page.html             → /guide
│
├── _drafts/                  → skipped (starts with _)
│   └── page.html             → (no route)
│
├── components/               → skipped (reserved name)
│   └── AddTodo.html          → (no route)
│
└── utils/                    → skipped (reserved name)
    └── helpers.js            → (no route)
```

フォルダのルールはすべて[ファイル規約](/docs/file-conventions)で説明しています。

## `viewLoaded` イベント {#the-viewloaded-event}

各ページが表示された後、ルーターは `window` 上で `viewLoaded` イベントを発火します。アクセス解析やページ先頭へのスクロールに便利です：

```js
window.addEventListener("viewLoaded", () => {
  if (!location.hash) scrollTo(0, 0);   // skip when the URL has an #id: the router already scrolled to it
});
```

## 自動ルーティングを使わない：独自の `main.js` {#opting-out--your-own-mainjs}

通常、エントリーファイルを書く必要はありません。**`src/main.js` がなければ、Olum がすべてのルートを含むものを生成します**。自分で `src/main.js` を作ると、Olum は代わりにそれを使い、ルートの生成をやめます。

**ルーティングをまったく使わない場合**（ページは 1 つで、`package.json` から `olum-router` を削除できます）：

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#olum-app").use(page);
```

**独自のルート一覧**（Olum が生成するものと同じです）：

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";
import NotFound from "./not-found.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About },
  { path: "/404", comp: NotFound }
];

const router = new Router({ mode: "history", root: "/", err: "/404", routes: routes });
new Olum().$("#olum-app").use(router);
```

- `err: "/404"` は、どのルートが 404 ページなのかをルーターに伝えます。`not-found.html` がない場合は、これと `/404` ルートの両方を省いてください。
- `root` は、サイトがサブフォルダにあるときの URL のプレフィックスです。[ビルドとデプロイ](/docs/core/build-and-deploy#a-sub-folder-needs-the-router-too)を参照してください。

:::note
コンポーネントは `.html` で書きますが、`.js` にコンパイルされます。そのため `src/page.html` は `./page.js` としてインポートします。
:::
