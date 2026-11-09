---
title: Navegando com to
group: Roteamento
order: 40
source: 2310098e855f
---

Use `to` em vez de `href` em um link. Assim o router troca a página **sem recarregar** o navegador:

````html title="src/page.html"
<a to="/about">About</a>                  <!-- fast: no reload -->

<a href="/about">About (full reload)</a>  <!-- normal browser link -->
````

Para navegar pelo código (depois de enviar um formulário, depois de um login…), use [`push` / `replace` / `back`](/docs/programmatic-navigation).

:::warn
Deixe o conteúdo de um link `to` como **texto puro**. Se você colocar um elemento dentro (`<span>`, `<img>`, um ícone) e o usuário clicar nele, a navegação não acontece.
:::

:::note
Recarregar uma página como `/blog/hello` precisa de uma configuração na hospedagem, a menos que você use pré-renderização. Veja [Modo history e a página 404](/docs/history-mode-and-404).
:::

## Clicando em um link para a página atual {#clicking-a-link-to-the-current-page}

Se o caminho **e** a query do link forem iguais à URL atual, nada acontece: a página não é renderizada de novo, o state dela é mantido e nenhuma entrada é adicionada ao histórico.

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- nothing happens -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: different query -->
<a to="/Shop/">Shop</a>            <!-- nothing on /shop: case and trailing slash are ignored -->
```

`push()` e `replace()` funcionam do mesmo jeito. As queries são comparadas pelo valor, então `?q=a b` e `?q=a%20b` são iguais.

## Links para uma seção (`#id`) {#links-to-a-section-id}

Um link pode terminar com `#id` para rolar até o elemento com esse `id`, como em qualquer site:

```html
<a href="#comments">Comments</a>                    <!-- on this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **Mesma página:** só rola. A página não é renderizada de novo, então o state dela é mantido (também no Voltar / Avançar entre `#id`s e ao clicar duas vezes no mesmo `#id`).
- **Outra página:** a página renderiza e depois rola.
- **Abrindo ou recarregando** `/match/chelsea/7#comments`: a página renderiza e depois rola.
- Quem rola é o navegador, então CSS como `scroll-margin-top` (espaço para um header fixo) e `scroll-behavior: smooth` funciona.

:::warn
- Só no modo history (o padrão). No modo hash, o `#` já é usado pela rota (`/#/about`).
- Em um link `to`, o `#id` fica **em minúsculas** como o resto do caminho, então use ids em minúsculas (`#comments`, não `#Comments`). Um `href="#id"` comum mantém as maiúsculas.
- `to="/#story"` (um `#id` na página inicial) não funciona: ele vai para `/story`. Na página inicial, use `<a href="#story">`.
:::
