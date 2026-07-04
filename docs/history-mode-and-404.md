---
title: History Mode & the 404 Page
group: Routing
order: 220
---

- The router uses **history mode by default** (clean URLs like `/blog/hello`). If history mode isn't available it **falls back to hash mode** (`/#/blog/hello`).
- Add a `not-found.html` at the **root of your project's `src/` directory** and it becomes the default 404 page, rendered whenever no route matches.

:::danger{icon="🚧"}
**Limitation — deeply nested dynamic segments.** A single dynamic segment like `/blog/[slug]` works. Chaining multiple dynamic segments in one path — e.g. `/user/[id]/[name]` — is **not tested yet** and may not resolve correctly. Stick to one dynamic segment per route for now.
:::
