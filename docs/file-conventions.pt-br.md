---
title: Convenções de arquivos
group: Roteamento
order: 20
source: 5c70dfaffe19
---

Como os nomes de arquivos e pastas em `src/` viram rotas, em resumo:

| Nome | O que faz |
|------|--------------|
| `page.html` | A página de uma rota. Uma pasta só vira rota se tiver um `page.html`: `about/page.html` → `/about`. |
| `not-found.html` | A página 404, mostrada quando nenhuma rota bate. Coloque-a direto em `src/`. |
| `[param]/` | Uma parte **dinâmica** da URL. `blog/[slug]/page.html` bate com `/blog/hello` e te dá `slug = "hello"` ([Lendo parâmetros de rota](/docs/reading-route-params)). |
| `(group)/` | Uma pasta de **grupo**, que fica fora da URL. `(marketing)/pricing/page.html` → `/pricing`. Use para organizar arquivos. |
| `01-name/` | Um **prefixo numérico** (dígitos + hífen) é removido da URL: `01-guide/page.html` → `/guide`. Útil para ordenar pastas. Dígitos em outras posições ficam: `7guis/` → `/7guis`. |
| `_name/` | **Ignorada.** Uma pasta que começa com `_` nunca cria rotas (bom para rascunhos). |
| `components/`, `utils/` | **Ignoradas**, em qualquer nível. Coloque aqui componentes e helpers compartilhados. |
| `sitemap.js` | **Não é uma rota.** `src/sitemap.js` liga a [pré-renderização](/docs/core/prerendering) e lista as URLs reais das rotas dinâmicas. Só é usado no build. |

:::warn
Os nomes **diferenciam maiúsculas de minúsculas**: exatamente `page.html` e `not-found.html`, tudo em minúsculas. `Page.html` não funciona.
:::

:::tip
Coloque componentes reutilizáveis em `src/components/` com nomes em **PascalCase**, como `src/components/AddTodo.html`. Isso os mantém separados dos arquivos de rota.
:::

## Rotas dinâmicas {#dynamic-routes}

- Um caminho pode ter várias partes dinâmicas: `users/[id]/posts/[postId]/page.html` bate com `/users/5/posts/10`, e [`params()`](/docs/reading-route-params) te dá as duas.
- Se uma URL bate com uma rota normal e com uma dinâmica, **a rota normal vence**.

:::warn
**Não há rotas catch-all.** `[...slug]` não é suportado. Cada `[param]` bate com exatamente **uma** parte da URL, e o número de partes precisa ser igual.
:::
