---
title: Navegación programática
group: Enrutamiento
order: 60
source: f021d3791f39
---

Para los enlaces, usa el [atributo `to`](/docs/navigating-with-to) (además te da gratis el [estilo del enlace activo](/docs/active-link-styling)). Para cambiar de página **desde el código** (tras enviar un formulario, tras un login, con un temporizador), importa estas funciones de `olum`:

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

Funcionan tanto en modo history como en modo hash, y se encargan del `root` del router por ti.

| Función | Qué hace | Botón Atrás |
|--------|--------------|-------------|
| `push(path)` | va a una página nueva | vuelve a esta página |
| `replace(path)` | va a una página nueva | se salta esta página (queda reemplazada) |
| `back()` | retrocede un paso | |
| `forward()` | avanza un paso | |
| `go(n)` | se mueve `n` pasos (negativo = atrás) | |
| `pathname()` | lee la ruta actual | |
| `searchParams()` | lee la query string como un objeto | |
| `setSearchParam(key, value)` | cambia un valor de la query **sin volver a renderizar la página** | no se ve afectado |

Equivalen a `history.pushState()`, `history.replaceState()`, `history.back()`, `history.forward()`, `history.go(n)`, `location.pathname` y `location.search` del navegador.

## Ejemplo {#example}

```html title="src/login/page.html"
<script>
  import { replace, back } from "olum";

  const login = () => {
    // ...check the password...
    replace("/dashboard");   // Back won't return to the login form
  };

  const cancel = () => back();
</script>

<form>
  <button type="button" onclick="login()">Sign in</button>
  <button type="button" onclick="cancel()">Cancel</button>
</form>
```

## ¿`push` o `replace`? {#push-or-replace}

- `push("/cart")` añade una entrada al historial, así que Atrás vuelve a donde estabas. Igual que hacer clic en un enlace.
- `replace("/dashboard")` reemplaza la entrada actual, así que Atrás se la salta. Úsalo para redirecciones (tras el login, URL antiguas) donde volver atrás no tiene sentido.

Las dos no hacen nada si el destino es la ruta y la query **actuales**: no se renderiza, no se añade entrada al historial y el state se conserva. Una query distinta cuenta como una página nueva.

En modo history, una ruta puede terminar en `#id`: `push("/match/chelsea/7#comments")`. En la página actual solo se desplaza; en otra página, la renderiza y luego se desplaza. Consulta [Enlaces a una sección](/docs/navigating-with-to#links-to-a-section-id).

## Leer la ruta actual {#reading-the-current-path}

`pathname()` devuelve la ruta actual, limpiada igual que la ve el router: empieza con `/`, sin `/` final y sin query. En modo hash es la parte que va después de `#`.

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## Leer la query string {#reading-the-query-string}

`searchParams()` devuelve la query como un objeto plano:

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- Solo los números **exactos** se convierten en números: `"10"`, `"-5"`, `"1.5"`. Cosas como `"02134"`, `"1e3"`, `"0x10"` e `"Infinity"` se quedan como texto, así que los códigos postales y los ID largos están a salvo.
- Todo lo demás es texto. `"true"` se queda como `"true"`.
- Claves como `toString` o `__proto__` son valores normales (el objeto no tiene prototipo).
- En modo hash la query puede estar dentro del hash (`/#/shop?size=10`), antes de él (`/?size=10#/shop`), o en ambos sitios.

`searchParams()` **no es reactivo**: lee la URL cuando lo llamas. En el `<script>` de una página es suficiente, porque ir a una query nueva (enlace, `push()`, Atrás/Adelante) vuelve a renderizar la página y el script se ejecuta de nuevo.

## Cambiar la query {#changing-the-query}

| Quieres… | Usa | ¿Se vuelve a renderizar la página? | Historial |
|--------------|-----|---------------------|---------|
| ir a una query nueva, como un enlace | `push("/shop?size=12")` | sí, `<script>` se ejecuta de nuevo | añade una entrada |
| lo mismo, sin un paso de Atrás | `replace("/shop?size=12")` | sí | reemplaza la entrada |
| solo recordar el estado de la interfaz en la URL | `setSearchParam("size", 12)` | **no**, el state se conserva | reemplaza la entrada |

Con `push()` / `replace()` la ruta se pasa a minúsculas para buscar coincidencias, pero la query se mantiene exactamente como la escribiste.

## Actualizar la query sin renderizar {#updating-the-query-without-rendering}

`setSearchParam(key, value)` cambia un valor de la query **en el sitio**. La página no se vuelve a renderizar (se conservan el foco, el scroll y el texto escrito) y no se añade ninguna entrada al historial. Úsalo para guardar en la URL una pestaña, un filtro, un número de página o una búsqueda, para que al recargar o al compartir el enlace se vea lo mismo:

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

**El patrón habitual:** lee la query en `state` una vez al principio de `<script>`, y en cada cambio actualiza **tanto** `state` (para que la página se actualice) como la URL (para que sobreviva a una recarga):

```html title="src/shop/page.html"
<script>
  import { searchParams, setSearchParam } from "olum";

  const TABS = ["all", "new", "sale"];
  const q = searchParams();
  const state = {
    tab: TABS.includes(q.tab) ? q.tab : "all",                 // never trust the URL: check it
    page: typeof q.page === "number" && q.page > 1 ? q.page : 1,
    search: q.search === undefined ? "" : String(q.search),    // "10" arrives as the number 10
  };

  const setTab = (tab) => {
    state.tab = tab;
    setSearchParam("tab", tab === "all" ? null : tab);   // keep the default out of the URL
    setPage(1);
  };
  const setPage = (n) => {
    state.page = n;
    setSearchParam("page", n === 1 ? null : n);
  };
  const setSearch = (value) => {
    state.search = value;
    setSearchParam("search", value);                     // "" removes it
  };
</script>

<for each="tab of TABS">
  <button class="{state.tab === tab ? 'active' : ''}" onclick="setTab(tab)">{tab}</button>
</for>
<input value="{state.search}" oninput="(e) => setSearch(e.target.value)" placeholder="Search" />
<button onclick="setPage(state.page + 1)">Next page ({state.page})</button>
```

Escribir en el buscador actualiza la URL con cada tecla sin perder el foco, y abrir `/shop?tab=sale&page=3&search=shoes` muestra la misma vista.

### Conviene saber {#good-to-know}

- **Quitar:** `null`, `undefined`, `""` y `[]` quitan la clave. `0` y `false` se escriben como `"0"` y `"false"`.
- **Los arrays** se convierten en una clave repetida (`?tag=a&tag=b`), que `searchParams()` vuelve a leer como array. Un array de un solo elemento se lee como un valor único; `[].concat(q.tag)` siempre te da un array.
- **Todo se convierte en texto** en la URL; `searchParams()` convierte los números exactos de nuevo en números. Se respetan mayúsculas y minúsculas.
- **Una clave reemplaza todos sus valores:** `setSearchParam("tag", "c")` sobre `?tag=a&tag=b` da `?tag=c`.
- **El resto de la URL se conserva:** la ruta, los demás parámetros, el `#id` y `history.state`. Asignar un valor que ya está no hace nada.
- **La query se vuelve a codificar** cuando cambia: un espacio pasa a ser `+` (`?q=a+b`) y un `?flag` suelto pasa a ser `?flag=`. Los valores se leen igual.
- **Modo hash:** el valor se escribe dentro del hash (`/#/shop?color=Blue`). Una copia de la misma clave antes del hash (`/?color=x#/shop`) se elimina, así que `searchParams()` nunca ve dos.
- **No se dispara ningún evento:** ni `popstate`, ni `viewLoaded`, ni renderizado. Otros componentes que leen `searchParams()` conservan el valor antiguo hasta que lo vuelven a leer. Si varios componentes necesitan el valor, guárdalo en `state` o en un [store](/docs/store/global-store).
- **Atrás se salta estos cambios**, porque no se añade ninguna entrada al historial. Si cada cambio debe poder deshacerse con Atrás, usa `push()` (la página se vuelve a renderizar).
- **Los enlaces `#id` siguen funcionando** después de `setSearchParam()`: `<a href="#comments">` en la misma página solo se desplaza, y `push()` a la página sin la query la vuelve a renderizar.
