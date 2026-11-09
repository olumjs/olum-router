---
title: ルートパラメータの取得
group: ルーティング
order: 30
source: 139a59f5c680
---

`src/blog/[slug]/page.html` のような動的ルートでは、`params()` で URL から値を取得します：

```html title="src/blog/[slug]/page.html"
<script>
  import { params } from "olum";

  const { slug } = params();   // on /blog/hello → "hello"
</script>

<h1>blog: {slug}</h1>
```

## 知っておくと良いこと {#good-to-know}

- **`params()` は `<script>` の先頭で呼び出し**、必要な値をまとめて取り出します：`const { id, postId } = params();`。
- **値は小文字になります。** URL は大文字・小文字を区別せずにマッチし（`/Blog/Hello` もマッチします）、値は小文字で返ります：`slug === "hello"`。
- **値はデコード済み**です：`/blog/caf%C3%A9` → `café`。
- クエリ文字列（`?page=2`）には [`searchParams()`](/docs/programmatic-navigation#reading-the-query-string) を使います。
