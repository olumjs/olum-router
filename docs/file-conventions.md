---
title: File Conventions
group: Routing
order: 20
---

How file and folder names in `src/` turn into routes, at a glance:

| Name | What it does |
|------|--------------|
| `page.html` | The page for a route. A folder only becomes a route if it has a `page.html`: `about/page.html` → `/about`. |
| `not-found.html` | The 404 page, shown when no route matches. Put it directly in `src/`. |
| `[param]/` | A **dynamic** part of the URL. `blog/[slug]/page.html` matches `/blog/hello` and gives you `slug = "hello"` ([Reading Route Params](/docs/reading-route-params)). |
| `(group)/` | A **group** folder, left out of the URL. `(marketing)/pricing/page.html` → `/pricing`. Use it to organize files. |
| `01-name/` | A **number prefix** (digits + dash) is removed from the URL: `01-guide/page.html` → `/guide`. Handy to sort folders. Digits elsewhere stay: `7guis/` → `/7guis`. |
| `_name/` | **Skipped.** A folder starting with `_` never creates routes (good for drafts). |
| `components/`, `utils/` | **Skipped**, at any depth. Put shared components and helpers here. |
| `sitemap.js` | **Not a route.** `src/sitemap.js` turns on [prerendering](/docs/core/prerendering) and lists the real URLs for dynamic routes. Build-time only. |

:::warn
Names are **case-sensitive**: exactly `page.html` and `not-found.html`, all lowercase. `Page.html` won't work.
:::

:::tip
Put reusable components in `src/components/` with **PascalCase** names, like `src/components/AddTodo.html`. That keeps them apart from route files.
:::

## Dynamic routes

- A path can have several dynamic parts: `users/[id]/posts/[postId]/page.html` matches `/users/5/posts/10`, and [`params()`](/docs/reading-route-params) gives you both.
- If a URL matches both a normal route and a dynamic one, the **normal route wins**.

:::warn
**No catch-all routes.** `[...slug]` is not supported. Each `[param]` matches exactly **one** part of the URL, and the number of parts must match.
:::
