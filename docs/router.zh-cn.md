---
title: 路由器
group: 路由
order: 10
source: 7b9fd9832754
---

Olum 使用**基于文件的路由**：`src/` 中每个包含 `page.html` 的文件夹都是网站的一个页面。没有需要维护的路由列表。你的文件夹**就是**路由。

:::note[包]
路由功能来自 `olum-router` 包（入门模板中已经包含）：

```bash
npm i olum-router
```

不需要路由？参见[使用你自己的 main.js](#opting-out--your-own-mainjs)。
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

每条文件夹规则都在[文件约定](/docs/file-conventions)中有说明。

## `viewLoaded` 事件 {#the-viewloaded-event}

每个页面出现后，路由器都会在 `window` 上触发一个 `viewLoaded` 事件。适合用来做统计分析或滚动到顶部：

```js
window.addEventListener("viewLoaded", () => {
  if (!location.hash) scrollTo(0, 0);   // skip when the URL has an #id: the router already scrolled to it
});
```

## 不使用自动路由：你自己的 `main.js` {#opting-out--your-own-mainjs}

通常你不需要写入口文件：**没有 `src/main.js` 时，Olum 会生成一个**，其中包含你所有的路由。如果你自己创建了 `src/main.js`，Olum 就会改用你的文件，并停止生成路由。

**完全不使用路由**（只有一个页面，并且可以从 `package.json` 中移除 `olum-router`）：

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#olum-app").use(page);
```

**你自己的路由列表**（和 Olum 会生成的内容相同）：

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

- `err: "/404"` 告诉路由器哪个路由是 404 页面。如果你没有 `not-found.html`，就把它和 `/404` 路由一起去掉。
- `root` 是网站位于子文件夹时的 URL 前缀。参见[构建与部署](/docs/core/build-and-deploy#a-sub-folder-needs-the-router-too)。

:::note
你用 `.html` 编写组件，但它们会被编译成 `.js`。所以要把 `src/page.html` 导入为 `./page.js`。
:::
