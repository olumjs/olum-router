---
title: Reading Route Params
group: Routing
order: 190
---

A dynamic segment's value is available in the page component through `params()`, imported from `olum` — no config, no wiring. Hitting `/blog/[slug]` exposes the captured segment, ready to destructure in `<script>` and use in the template:

```html title="src/blog/[slug]/page.html"
<!-- src/blog/[slug]/page.html -->
<script>
  import { params } from "olum";

  const { slug } = params();
</script>

<h1>blog: {slug}</h1>
```
