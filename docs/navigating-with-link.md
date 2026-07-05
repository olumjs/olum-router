---
title: Navigating with link
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

:::info
When the current URL matches a link's `to` path, the router automatically adds an `active` class to that anchor. Use this to style the current route, e.g.:

```css
a.active {
  color: var(--accent);
  font-weight: 600;
}
```
:::

:::warn
Because routes are resolved on the client, the server must fall back to `index.html` for unknown paths — otherwise a hard refresh on a deep route like `/blog/hello` 404s before the app can match it.
:::

Quick note — I added the `active` class behavior as an `:::info` block right after the code sample, before the existing `:::warn`. If olumjs's active-matching is exact-path-only (vs. prefix matching, e.g. `/blog` staying active on `/blog/hello`), let me know and I'll adjust the wording so it's accurate to the actual behavior.
