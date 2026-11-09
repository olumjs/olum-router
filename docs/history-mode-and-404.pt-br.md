---
title: Modo history e a página 404
group: Roteamento
order: 70
source: 6101fd8ae15f
---

## URLs limpas (modo history) {#clean-urls-history-mode}

O router usa por padrão URLs limpas como `/blog/hello` ("modo history"). Em um navegador antigo sem a History API, ele volta para URLs com hash como `/#/blog/hello`.

URLs limpas precisam de uma coisa da sua hospedagem: ela deve enviar `index.html` para todo caminho que não seja um arquivo. Senão, recarregar `/blog/hello` mostra um 404. Veja [Build e deploy](/docs/core/build-and-deploy#deploying) para saber como configurar.

Páginas [pré-renderizadas](/docs/core/prerendering) não precisam disso: cada uma é um arquivo real em `dist/<route>/index.html`, que qualquer hospedagem serve.

## A página 404 {#the-404-page}

Adicione `not-found.html` direto em `src/`. Ela aparece sempre que nenhuma rota bate. Sem ela, uma URL desconhecida mostra o texto simples "Page Not Found!".

Um `not-found.html` é uma página como qualquer outra, então pode ter o seu próprio [`<head>`](/docs/core/metadata) (title, `robots`, …).

Para rotas dinâmicas, vários parâmetros e a regra de "sem catch-all", veja [Convenções de arquivos](/docs/file-conventions#dynamic-routes).
