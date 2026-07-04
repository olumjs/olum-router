---
title: File Conventions
group: Routing
order: 180
---

| File | What it does |
|------|--------------|
| `page.html` | The UI for a route. A folder becomes a navigable route only when it contains a `page.html` — e.g. `about/page.html` serves `/about`. |
| `not-found.html` | Rendered when no route matches the current URL — the global 404 page. |
| `[param]/` | A dynamic segment. `blog/[slug]/page.html` matches `/blog/:slug`, capturing the URL part as the `slug` param (e.g. `/blog/hello` → `slug = "hello"`). |

:::warn
These filenames are **case-sensitive**. It must be exactly `page.html` and `not-found.html` (all lowercase) — variants like `Page.html` or `Not-Found.html` are not recognized.
:::

:::tip
Reusable components live in the `src/components` directory and their filenames are **PascalCase** — e.g. `src/components/AddTodo.html`. This keeps route files (`page.html` / `not-found.html`) separate from the components they render.
:::
