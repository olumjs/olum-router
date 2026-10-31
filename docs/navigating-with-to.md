---
title: Navigating with to
group: Routing
order: 210
---

Mark an anchor with the `to` attribute and the router handles the click as a client-side transition — no full page reload.

````html title="src/page.html"
<!-- Add the `to` attribute so the router intercepts the click -->
<!-- (no full page reload) instead of letting the browser navigate. -->
<a to="/about">About</a>

<!-- Without `to`, this is a normal browser navigation. -->
<a href="/about">About (hard reload)</a>
````

:::warn
Because routes are resolved on the client, the server must fall back to `index.html` for unknown paths — otherwise a hard refresh on a deep route like `/blog/hello` 404s before the app can match it.
:::

To navigate from code instead of a link — after a form submit or a login redirect — use the `push` / `replace` / `back` helpers from [Programmatic Navigation](/docs/programmatic-navigation).

:::warn
Keep the content of a `to` anchor **plain text**. The click handler reads the `to` attribute from the exact element that was clicked — a nested element (`<span>`, `<img>`, an icon) intercepts the click and the navigation misses.
:::

## Clicking a link to the current page

If the link's path **and** query are the same as the current URL, the click does nothing: the page is not rendered again, its state is kept, and no history entry is added.

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- does nothing -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: the query is different -->
<a to="/Shop/">Shop</a>            <!-- does nothing on /shop: paths compare lowercased, trailing slash ignored -->
```

The same check runs for [`push()` and `replace()`](/docs/programmatic-navigation), so code that navigates to the current page is safe too. A query compares by value, so `?q=a b` and `?q=a%20b` are the same.

## Links to a section (`#id`)

In **history** mode (the default), a link can end with an `#id`, and the browser scrolls to the element with that `id` — the same as on a normal website:

```html
<a href="#comments">Comments</a>                    <!-- this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **This page:** only the scroll happens. The page is **not** rendered again, so its state is kept. This is also true for Back / Forward between `#id`s, and for a second click on the `#id` that is already in the URL.
- **Another page:** the page renders, then scrolls to the `#id`.
- **Open or reload** a URL like `/match/chelsea/7#comments`: the page renders, then scrolls.
- The browser does the scroll, so CSS such as `scroll-margin-top` (room for a sticky header) and `scroll-behavior: smooth` works.

:::warn
- **Hash mode** has no `#id` links: there the `#` already holds the route (`/#/about`).
- In a `to` path the `#id` is **lowercased** like the rest of the path, so use lowercase ids (`#comments`, not `#Comments`). A plain `href="#id"` keeps its case.
- `to="/#story"` (an `#id` on the **root** path) does not work: it goes to `/story`. On the home page itself, use `<a href="#story">`.
:::
