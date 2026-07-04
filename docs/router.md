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
```
