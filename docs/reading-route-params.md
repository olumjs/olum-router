---
title: Reading Route Params
group: Routing
order: 190
---

A dynamic segment's value is available in the page component through the `params` object — no config, no wiring. Hitting `/blog/[slug]` exposes the captured segment as `params.slug`, ready to use in `<script>` and the template:

```html title="src/blog/[slug]/page.html"
<!-- src/blog/[slug]/page.html -->
<script>
  const { slug } = params;
</script>

<h1>blog: {slug}</h1>
```
