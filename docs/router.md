---
title: Router
group: Routing
order: 10
---

Olum uses **file-based routing**: each folder in `src/` with a `page.html` is a page of your site. There's no route list to maintain. Your folders **are** the routes.

:::note[Package]
Routing comes from the `olum-router` package (already in the starter template):

```bash
npm i olum-router
```

Don't need routing? See [Using your own main.js](#opting-out--your-own-mainjs).
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

Every folder rule is explained in [File Conventions](/docs/file-conventions).

## The `viewLoaded` event

After each page appears, the router fires a `viewLoaded` event on `window`. Handy for analytics or scrolling to the top:

```js
window.addEventListener("viewLoaded", () => {
  if (!location.hash) scrollTo(0, 0);   // skip when the URL has an #id: the router already scrolled to it
});
```

## Opting out — your own `main.js`

Normally you don't write an entry file: **without `src/main.js`, Olum generates one** with all your routes. If you create `src/main.js` yourself, Olum uses yours instead and stops generating routes.

**No routing at all** (one page, and you can remove `olum-router` from `package.json`):

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#olum-app").use(page);
```

**Your own route list** (the same thing Olum would generate):

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

- `err: "/404"` tells the router which route is the 404 page. Leave out both it and the `/404` route if you have no `not-found.html`.
- `root` is the URL prefix when the site lives in a sub-folder. See [Build & Deploy](/docs/core/build-and-deploy#a-sub-folder-needs-the-router-too).

:::note
You write components as `.html`, but they're compiled to `.js`. So import `src/page.html` as `./page.js`.
:::
