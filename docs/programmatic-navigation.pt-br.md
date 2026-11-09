---
title: Navegação programática
group: Roteamento
order: 60
source: f021d3791f39
---

Para links, use o [atributo `to`](/docs/navigating-with-to) (ele ainda te dá o [estilo do link ativo](/docs/active-link-styling) de graça). Para trocar de página **pelo código** (depois de enviar um formulário, depois de um login, com um timer), importe estes helpers de `olum`:

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

Eles funcionam tanto no modo history quanto no modo hash, e cuidam do `root` do router para você.

| Helper | O que faz | Botão Voltar |
|--------|--------------|-------------|
| `push(path)` | vai para uma página nova | volta para esta página |
| `replace(path)` | vai para uma página nova | pula esta página (ela é substituída) |
| `back()` | volta um passo | |
| `forward()` | avança um passo | |
| `go(n)` | move `n` passos (negativo = voltar) | |
| `pathname()` | lê o caminho atual | |
| `searchParams()` | lê a query string como um objeto | |
| `setSearchParam(key, value)` | muda um valor da query **sem renderizar a página de novo** | não é afetado |

Eles correspondem a `history.pushState()`, `history.replaceState()`, `history.back()`, `history.forward()`, `history.go(n)`, `location.pathname` e `location.search` do navegador.

## Exemplo {#example}

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

## `push` ou `replace`? {#push-or-replace}

- `push("/cart")` adiciona uma entrada no histórico, então Voltar retorna para onde você estava. Igual a clicar em um link.
- `replace("/dashboard")` substitui a entrada atual, então Voltar a pula. Use para redirecionamentos (depois do login, URLs antigas) em que voltar não faz sentido.

Os dois não fazem nada se o destino for o caminho e a query **atuais**: nada é renderizado, nenhuma entrada é adicionada e o state é mantido. Uma query diferente conta como uma página nova.

No modo history, um caminho pode terminar com `#id`: `push("/match/chelsea/7#comments")`. Na página atual ele só rola; em outra página, renderiza e depois rola. Veja [Links para uma seção](/docs/navigating-with-to#links-to-a-section-id).

## Lendo o caminho atual {#reading-the-current-path}

`pathname()` retorna o caminho atual, limpo do mesmo jeito que o router o vê: começa com `/`, sem `/` no fim, sem query. No modo hash é a parte depois do `#`.

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## Lendo a query string {#reading-the-query-string}

`searchParams()` retorna a query como um objeto simples:

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- Só números **exatos** viram números: `"10"`, `"-5"`, `"1.5"`. Coisas como `"02134"`, `"1e3"`, `"0x10"` e `"Infinity"` continuam texto, então CEPs e IDs longos ficam seguros.
- Todo o resto é texto. `"true"` continua `"true"`.
- Chaves como `toString` ou `__proto__` são só valores normais (o objeto não tem protótipo).
- No modo hash a query pode estar dentro do hash (`/#/shop?size=10`), antes dele (`/?size=10#/shop`), ou nos dois.

`searchParams()` **não é reativo**: ele lê a URL quando você o chama. No `<script>` de uma página isso basta, porque ir para uma query nova (link, `push()`, Voltar/Avançar) renderiza a página de novo e o script roda de novo.

## Mudando a query {#changing-the-query}

| Você quer… | Use | A página renderiza de novo? | Histórico |
|--------------|-----|---------------------|---------|
| ir para uma query nova, como um link | `push("/shop?size=12")` | sim, o `<script>` roda de novo | adiciona uma entrada |
| o mesmo, sem um passo de Voltar | `replace("/shop?size=12")` | sim | substitui a entrada |
| só lembrar o estado da interface na URL | `setSearchParam("size", 12)` | **não**, o state é mantido | substitui a entrada |

Com `push()` / `replace()` o caminho fica em minúsculas para a comparação, mas a query é mantida exatamente como foi escrita.

## Atualizando a query sem renderizar {#updating-the-query-without-rendering}

`setSearchParam(key, value)` muda um valor da query **no lugar**. A página não é renderizada de novo (foco, rolagem e texto digitado são mantidos) e nenhuma entrada é adicionada ao histórico. Use para salvar uma aba, um filtro, um número de página ou uma busca na URL, para que recarregar ou compartilhar o link mostre a mesma visualização:

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

**O padrão comum:** leia a query para o `state` uma vez no topo do `<script>` e, a cada mudança, atualize **tanto** o `state` (para a página atualizar) quanto a URL (para sobreviver a um recarregamento):

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

Digitar na busca atualiza a URL a cada tecla sem perder o foco, e abrir `/shop?tab=sale&page=3&search=shoes` mostra a mesma visualização.

### Bom saber {#good-to-know}

- **Removendo:** `null`, `undefined`, `""` e `[]` removem a chave. `0` e `false` são escritos como `"0"` e `"false"`.
- **Arrays** viram uma chave repetida (`?tag=a&tag=b`), que `searchParams()` lê de volta como array. Um array de um item só volta como um valor único; `[].concat(q.tag)` sempre te dá um array.
- **Tudo vira texto** na URL; `searchParams()` transforma números exatos de volta em números. Maiúsculas e minúsculas são mantidas.
- **Uma chave substitui todos os seus valores:** `setSearchParam("tag", "c")` em `?tag=a&tag=b` dá `?tag=c`.
- **O resto da URL é mantido:** o caminho, os outros parâmetros, o `#id` e o `history.state`. Definir um valor que já está lá não faz nada.
- **A query é recodificada** quando muda: um espaço vira `+` (`?q=a+b`) e um `?flag` sozinho vira `?flag=`. Os valores são lidos de volta iguais.
- **Modo hash:** o valor é escrito dentro do hash (`/#/shop?color=Blue`). Uma cópia da mesma chave antes do hash (`/?color=x#/shop`) é removida, então `searchParams()` nunca vê duas.
- **Nenhum evento dispara:** nem `popstate`, nem `viewLoaded`, nem renderização. Outros componentes que leem `searchParams()` ficam com o valor antigo até lerem de novo. Se vários componentes precisam do valor, guarde-o no `state` ou em um [store](/docs/store/global-store).
- **Voltar pula essas mudanças**, já que nenhuma entrada é adicionada ao histórico. Se cada mudança precisa poder ser desfeita com Voltar, use `push()` (a página renderiza de novo).
- **Links `#id` continuam funcionando** depois de `setSearchParam()`: `<a href="#comments">` na mesma página só rola, e `push()` para a página sem a query a renderiza de novo.
