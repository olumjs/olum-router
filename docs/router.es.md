---
title: Router
group: Enrutamiento
order: 10
source: 7b9fd9832754
---

Olum usa **enrutamiento basado en archivos**: cada carpeta de `src/` con un `page.html` es una página de tu sitio. No hay ninguna lista de rutas que mantener. Tus carpetas **son** las rutas.

:::note[Paquete]
El enrutamiento viene del paquete `olum-router` (ya incluido en la plantilla inicial):

```bash
npm i olum-router
```

¿No necesitas enrutamiento? Consulta [Usar tu propio main.js](#opting-out--your-own-mainjs).
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

Cada regla de carpetas se explica en [Convenciones de archivos](/docs/file-conventions).

## El evento `viewLoaded` {#the-viewloaded-event}

Después de que aparece cada página, el router dispara un evento `viewLoaded` en `window`. Útil para analítica o para volver arriba del todo:

```js
window.addEventListener("viewLoaded", () => {
  if (!location.hash) scrollTo(0, 0);   // skip when the URL has an #id: the router already scrolled to it
});
```

## Desactivarlo: tu propio `main.js` {#opting-out--your-own-mainjs}

Normalmente no escribes un archivo de entrada: **sin `src/main.js`, Olum genera uno** con todas tus rutas. Si creas tú mismo `src/main.js`, Olum usa el tuyo y deja de generar rutas.

**Sin ningún enrutamiento** (una sola página, y puedes quitar `olum-router` de `package.json`):

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#olum-app").use(page);
```

**Tu propia lista de rutas** (lo mismo que generaría Olum):

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

- `err: "/404"` le dice al router qué ruta es la página 404. Quita tanto esto como la ruta `/404` si no tienes `not-found.html`.
- `root` es el prefijo de la URL cuando el sitio está en una subcarpeta. Consulta [Compilación y despliegue](/docs/core/build-and-deploy#a-sub-folder-needs-the-router-too).

:::note
Escribes los componentes como `.html`, pero se compilan a `.js`. Por eso importas `src/page.html` como `./page.js`.
:::
