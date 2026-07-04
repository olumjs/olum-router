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

## File conventions

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

## Reading route params

A dynamic segment's value is available in the page component through the `params` object — no config, no wiring. Hitting `/blog/[slug]` exposes the captured segment as `params.slug`, ready to use in `<script>` and the template:

```html title="src/blog/[slug]/page.html"
<!-- src/blog/[slug]/page.html -->
<script>
  const { slug } = params;
</script>

<h1>blog: {slug}</h1>
```

## Rendering the matched route

In your root `index.html` shell, place a `<router-view>` where the active page should appear — put persistent navigation around it and it stays mounted across route changes.

```html title="index.html"
<!-- index.html -->
<!-- The matched route's page renders wherever you place <router-view>. -->
<nav>
  <a href="/" link>Home</a>
  <a href="/about" link>About</a>
</nav>

<router-view></router-view>
```

## Navigating with `link`

Mark an anchor with the `link` attribute and the router handles the click as a client-side transition — no full page reload.

````html title="src/page.html"
<!-- Add the `link` attribute so the router intercepts the click -->
<!-- (no full page reload) instead of letting the browser navigate. -->
<a href="/about" link>About</a>

<!-- Without `link`, this is a normal browser navigation. -->
<a href="/about">About (hard reload)</a>
````

:::warn
Because routes are resolved on the client, the server must fall back to `index.html` for unknown paths — otherwise a hard refresh on a deep route like `/blog/hello` 404s before the app can match it.
:::

## History mode & the 404 page

- The router uses **history mode by default** (clean URLs like `/blog/hello`). If history mode isn't available it **falls back to hash mode** (`/#/blog/hello`).
- Add a `not-found.html` at the **root of your project's `src/` directory** and it becomes the default 404 page, rendered whenever no route matches.

:::danger{icon="🚧"}
**Limitation — deeply nested dynamic segments.** A single dynamic segment like `/blog/[slug]` works. Chaining multiple dynamic segments in one path — e.g. `/user/[id]/[name]` — is **not tested yet** and may not resolve correctly. Stick to one dynamic segment per route for now.
:::
