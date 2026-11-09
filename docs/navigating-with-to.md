---
title: Navigating with to
group: Routing
order: 40
---

Use `to` instead of `href` on a link. The router then changes the page **without reloading** the browser:

````html title="src/page.html"
<a to="/about">About</a>                  <!-- fast: no reload -->

<a href="/about">About (full reload)</a>  <!-- normal browser link -->
````

To navigate from code (after a form submit, a login…), use [`push` / `replace` / `back`](/docs/programmatic-navigation).

:::warn
Keep the content of a `to` link **plain text**. If you put an element inside (`<span>`, `<img>`, an icon) and the user clicks it, the navigation is missed.
:::

:::note
Refreshing a page like `/blog/hello` needs a host setting unless you prerender. See [History Mode & the 404 Page](/docs/history-mode-and-404).
:::

## Clicking a link to the current page

If the link's path **and** query are the same as the current URL, nothing happens: the page isn't rendered again, its state is kept, and no history entry is added.

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- nothing happens -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: different query -->
<a to="/Shop/">Shop</a>            <!-- nothing on /shop: case and trailing slash are ignored -->
```

`push()` and `replace()` work the same way. Queries are compared by value, so `?q=a b` and `?q=a%20b` are equal.

## Links to a section (`#id`)

A link can end with `#id` to scroll to the element with that `id`, like on any website:

```html
<a href="#comments">Comments</a>                    <!-- on this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **Same page:** it only scrolls. The page is not rendered again, so its state is kept (also for Back / Forward between `#id`s, and clicking the same `#id` twice).
- **Another page:** the page renders, then scrolls.
- **Opening or refreshing** `/match/chelsea/7#comments`: the page renders, then scrolls.
- The browser does the scrolling, so CSS like `scroll-margin-top` (space for a sticky header) and `scroll-behavior: smooth` works.

:::warn
- Only in history mode (the default). In hash mode the `#` is already used for the route (`/#/about`).
- In a `to` link the `#id` is **lowercased** like the rest of the path, so use lowercase ids (`#comments`, not `#Comments`). A plain `href="#id"` keeps its case.
- `to="/#story"` (an `#id` on the home page) doesn't work: it goes to `/story`. On the home page, use `<a href="#story">`.
:::
