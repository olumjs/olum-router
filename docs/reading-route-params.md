---
title: Reading Route Params
group: Routing
order: 30
---

In a dynamic route like `src/blog/[slug]/page.html`, get the value from the URL with `params()`:

```html title="src/blog/[slug]/page.html"
<script>
  import { params } from "olum";

  const { slug } = params();   // on /blog/hello → "hello"
</script>

<h1>blog: {slug}</h1>
```

## Good to know

- **Call `params()` at the top of `<script>`** and take everything you need from it: `const { id, postId } = params();`.
- **Values are lowercase.** URLs match without caring about case (`/Blog/Hello` matches), and the value comes back lowercased: `slug === "hello"`.
- **Values are decoded** for you: `/blog/caf%C3%A9` → `café`.
- For the query string (`?page=2`), use [`searchParams()`](/docs/programmatic-navigation#reading-the-query-string).
