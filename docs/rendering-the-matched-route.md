---
title: Rendering the Matched Route
group: Routing
order: 200
---

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
