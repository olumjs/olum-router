---
title: Router
group: Roteamento
order: 10
source: 7b9fd9832754
---

O Olum usa **roteamento baseado em arquivos**: cada pasta em `src/` com um `page.html` é uma página do seu site. Não há lista de rotas para manter. As suas pastas **são** as rotas.

:::note[Pacote]
O roteamento vem do pacote `olum-router` (já incluído no template inicial):

```bash
npm i olum-router
```

Não precisa de roteamento? Veja [Usando o seu próprio main.js](#opting-out--your-own-mainjs).
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

Cada regra de pastas é explicada em [Convenções de arquivos](/docs/file-conventions).

## O evento `viewLoaded` {#the-viewloaded-event}

Depois que cada página aparece, o router dispara um evento `viewLoaded` no `window`. Útil para analytics ou para rolar até o topo:

```js
window.addEventListener("viewLoaded", () => {
  if (!location.hash) scrollTo(0, 0);   // skip when the URL has an #id: the router already scrolled to it
});
```

## Desativando: o seu próprio `main.js` {#opting-out--your-own-mainjs}

Normalmente você não escreve um arquivo de entrada: **sem `src/main.js`, o Olum gera um** com todas as suas rotas. Se você criar `src/main.js`, o Olum usa o seu e para de gerar rotas.

**Sem nenhum roteamento** (uma página só, e você pode remover `olum-router` do `package.json`):

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#olum-app").use(page);
```

**A sua própria lista de rotas** (a mesma coisa que o Olum geraria):

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

- `err: "/404"` diz ao router qual rota é a página 404. Tire tanto isso quanto a rota `/404` se você não tiver `not-found.html`.
- `root` é o prefixo da URL quando o site fica em uma subpasta. Veja [Build e deploy](/docs/core/build-and-deploy#a-sub-folder-needs-the-router-too).

:::note
Você escreve componentes como `.html`, mas eles são compilados para `.js`. Por isso importe `src/page.html` como `./page.js`.
:::
