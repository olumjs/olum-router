---
title: Navegar con to
group: Enrutamiento
order: 40
source: 2310098e855f
---

Usa `to` en lugar de `href` en un enlace. Así el router cambia la página **sin recargar** el navegador:

````html title="src/page.html"
<a to="/about">About</a>                  <!-- fast: no reload -->

<a href="/about">About (full reload)</a>  <!-- normal browser link -->
````

Para navegar desde el código (tras enviar un formulario, tras un login…), usa [`push` / `replace` / `back`](/docs/programmatic-navigation).

:::warn
Deja el contenido de un enlace `to` como **texto plano**. Si pones un elemento dentro (`<span>`, `<img>`, un icono) y el usuario hace clic en él, la navegación se pierde.
:::

:::note
Recargar una página como `/blog/hello` necesita una configuración en el hosting, salvo que uses prerenderizado. Consulta [Modo history y la página 404](/docs/history-mode-and-404).
:::

## Hacer clic en un enlace a la página actual {#clicking-a-link-to-the-current-page}

Si la ruta **y** la query del enlace son iguales a la URL actual, no pasa nada: la página no se vuelve a renderizar, su state se conserva y no se añade ninguna entrada al historial.

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- nothing happens -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: different query -->
<a to="/Shop/">Shop</a>            <!-- nothing on /shop: case and trailing slash are ignored -->
```

`push()` y `replace()` funcionan igual. Las queries se comparan por valor, así que `?q=a b` y `?q=a%20b` son iguales.

## Enlaces a una sección (`#id`) {#links-to-a-section-id}

Un enlace puede terminar en `#id` para desplazarse hasta el elemento con ese `id`, como en cualquier web:

```html
<a href="#comments">Comments</a>                    <!-- on this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **Misma página:** solo se desplaza. La página no se vuelve a renderizar, así que su state se conserva (también al ir Atrás / Adelante entre `#id`s, y al hacer clic dos veces en el mismo `#id`).
- **Otra página:** la página se renderiza y luego se desplaza.
- **Al abrir o recargar** `/match/chelsea/7#comments`: la página se renderiza y luego se desplaza.
- El desplazamiento lo hace el navegador, así que funciona CSS como `scroll-margin-top` (espacio para una cabecera fija) y `scroll-behavior: smooth`.

:::warn
- Solo en modo history (el predeterminado). En modo hash el `#` ya se usa para la ruta (`/#/about`).
- En un enlace `to`, el `#id` se pasa **a minúsculas** como el resto de la ruta, así que usa ids en minúsculas (`#comments`, no `#Comments`). Un `href="#id"` normal mantiene las mayúsculas.
- `to="/#story"` (un `#id` en la página de inicio) no funciona: lleva a `/story`. En la página de inicio, usa `<a href="#story">`.
:::
