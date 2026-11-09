---
title: 读取路由参数
group: 路由
order: 30
source: 139a59f5c680
---

在 `src/blog/[slug]/page.html` 这样的动态路由中，用 `params()` 从 URL 中取值：

```html title="src/blog/[slug]/page.html"
<script>
  import { params } from "olum";

  const { slug } = params();   // on /blog/hello → "hello"
</script>

<h1>blog: {slug}</h1>
```

## 须知 {#good-to-know}

- **在 `<script>` 顶部调用 `params()`**，并一次取出你需要的所有值：`const { id, postId } = params();`。
- **值是小写的。** URL 匹配时不区分大小写（`/Blog/Hello` 也能匹配），返回的值会被转成小写：`slug === "hello"`。
- **值已经为你解码**：`/blog/caf%C3%A9` → `café`。
- 查询字符串（`?page=2`）请使用 [`searchParams()`](/docs/programmatic-navigation#reading-the-query-string)。
