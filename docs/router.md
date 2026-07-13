---
title: Router
group: Routing
order: 170
---

Olum uses **file-based routing** — every route is a folder under `src/` and the files inside it declare how that URL renders. There is no route config to maintain: the file tree **is** the route table.

```text title="Project structure"
src/
├── page.html                 → /
├── not-found.html            → Global 404 page
│
├── about/
│   └── page.html             → /about
│
├── blog/
│   ├── page.html             → /blog
│   └── [slug]/
│       └── page.html         → /blog/:slug
│
├── users/
│   ├── page.html             → /users
│   └── [id]/
│       └── page.html         → /users/:id
│
├── (marketing)/              → route group — not part of the URL
│   └── pricing/
│       └── page.html         → /pricing
│
├── 01-guide/                 → numeric ordering prefix — stripped from the URL
│   └── page.html             → /guide
│
├── _drafts/                  → skipped entirely (leading underscore)
│   └── page.html             → (no route)
│
├── components/               → skipped entirely (reserved folder)
│   └── AddTodo.html          → (no route)
│
└── utils/                    → skipped entirely (reserved folder)
    └── helpers.js            → (no route)
```

## Folder conventions

Some folder names change how (or whether) routes are generated:

| Folder | Effect |
|--------|--------|
| `(group)/` | **Route group** — organizes files without affecting the URL. `(marketing)/pricing/page.html` serves `/pricing`, not `/(marketing)/pricing`. |
| `01-name/` | **Ordering prefix** — leading digits followed by a dash are stripped from the URL. `01-guide/page.html` serves `/guide`. Handy for keeping folders sorted on disk. |
| `_name/` | **Skipped entirely** — a folder starting with `_` (and everything inside it) never produces a route. Use it for drafts or work in progress. |
| `components/`, `utils/` | **Skipped entirely** — these reserved folders are excluded from routing at any depth, so shared components and helpers can live next to your pages without becoming routes. |

:::tip
Only the `NN-` prefix is stripped — digits elsewhere in a segment are kept as-is, so a folder like `7guis/` still serves `/7guis`.
:::
