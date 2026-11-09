---
title: Leer parámetros de ruta
group: Enrutamiento
order: 30
source: 139a59f5c680
---

En una ruta dinámica como `src/blog/[slug]/page.html`, obtén el valor de la URL con `params()`:

```html title="src/blog/[slug]/page.html"
<script>
  import { params } from "olum";

  const { slug } = params();   // on /blog/hello → "hello"
</script>

<h1>blog: {slug}</h1>
```

## Conviene saber {#good-to-know}

- **Llama a `params()` al principio de `<script>`** y saca de ahí todo lo que necesites: `const { id, postId } = params();`.
- **Los valores llegan en minúsculas.** Las URL coinciden sin importar mayúsculas (`/Blog/Hello` coincide) y el valor se devuelve en minúsculas: `slug === "hello"`.
- **Los valores ya vienen decodificados**: `/blog/caf%C3%A9` → `café`.
- Para la query string (`?page=2`), usa [`searchParams()`](/docs/programmatic-navigation#reading-the-query-string).
