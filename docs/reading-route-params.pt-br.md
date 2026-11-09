---
title: Lendo parâmetros de rota
group: Roteamento
order: 30
source: 139a59f5c680
---

Em uma rota dinâmica como `src/blog/[slug]/page.html`, pegue o valor da URL com `params()`:

```html title="src/blog/[slug]/page.html"
<script>
  import { params } from "olum";

  const { slug } = params();   // on /blog/hello → "hello"
</script>

<h1>blog: {slug}</h1>
```

## Bom saber {#good-to-know}

- **Chame `params()` no topo do `<script>`** e pegue dali tudo o que precisar: `const { id, postId } = params();`.
- **Os valores vêm em minúsculas.** As URLs batem sem diferenciar maiúsculas (`/Blog/Hello` também bate) e o valor volta em minúsculas: `slug === "hello"`.
- **Os valores já vêm decodificados**: `/blog/caf%C3%A9` → `café`.
- Para a query string (`?page=2`), use [`searchParams()`](/docs/programmatic-navigation#reading-the-query-string).
