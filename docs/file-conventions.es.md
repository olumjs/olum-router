---
title: Convenciones de archivos
group: Enrutamiento
order: 20
source: 5c70dfaffe19
---

Cómo los nombres de archivos y carpetas de `src/` se convierten en rutas, de un vistazo:

| Nombre | Qué hace |
|------|--------------|
| `page.html` | La página de una ruta. Una carpeta solo se convierte en ruta si tiene un `page.html`: `about/page.html` → `/about`. |
| `not-found.html` | La página 404, que se muestra cuando ninguna ruta coincide. Ponla directamente en `src/`. |
| `[param]/` | Una parte **dinámica** de la URL. `blog/[slug]/page.html` coincide con `/blog/hello` y te da `slug = "hello"` ([Leer parámetros de ruta](/docs/reading-route-params)). |
| `(group)/` | Una carpeta de **grupo**, que no aparece en la URL. `(marketing)/pricing/page.html` → `/pricing`. Úsala para organizar archivos. |
| `01-name/` | Un **prefijo numérico** (dígitos + guion) se quita de la URL: `01-guide/page.html` → `/guide`. Útil para ordenar carpetas. Los dígitos en otras posiciones se mantienen: `7guis/` → `/7guis`. |
| `_name/` | **Se omite.** Una carpeta que empieza con `_` nunca crea rutas (útil para borradores). |
| `components/`, `utils/` | **Se omiten**, a cualquier profundidad. Pon aquí los componentes y utilidades compartidos. |
| `sitemap.js` | **No es una ruta.** `src/sitemap.js` activa el [prerenderizado](/docs/core/prerendering) y lista las URL reales de las rutas dinámicas. Solo se usa al compilar. |

:::warn
Los nombres **distinguen mayúsculas y minúsculas**: exactamente `page.html` y `not-found.html`, todo en minúsculas. `Page.html` no funcionará.
:::

:::tip
Pon los componentes reutilizables en `src/components/` con nombres en **PascalCase**, como `src/components/AddTodo.html`. Así quedan separados de los archivos de ruta.
:::

## Rutas dinámicas {#dynamic-routes}

- Una ruta puede tener varias partes dinámicas: `users/[id]/posts/[postId]/page.html` coincide con `/users/5/posts/10`, y [`params()`](/docs/reading-route-params) te da ambas.
- Si una URL coincide con una ruta normal y con una dinámica, **gana la ruta normal**.

:::warn
**No hay rutas catch-all.** `[...slug]` no está soportado. Cada `[param]` coincide exactamente con **una** parte de la URL, y el número de partes debe coincidir.
:::
