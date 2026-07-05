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
