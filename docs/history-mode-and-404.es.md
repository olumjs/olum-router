---
title: Modo history y la página 404
group: Enrutamiento
order: 70
source: 6101fd8ae15f
---

## URL limpias (modo history) {#clean-urls-history-mode}

El router usa por defecto URL limpias como `/blog/hello` ("modo history"). En un navegador antiguo sin History API, recurre a URL con hash como `/#/blog/hello`.

Las URL limpias necesitan una sola cosa de tu hosting: que envíe `index.html` para cada ruta que no sea un archivo. Si no, recargar `/blog/hello` muestra un 404. Consulta [Compilación y despliegue](/docs/core/build-and-deploy#deploying) para ver cómo configurarlo.

Las páginas [prerenderizadas](/docs/core/prerendering) no lo necesitan: cada una es un archivo real en `dist/<route>/index.html`, que cualquier hosting sirve.

## La página 404 {#the-404-page}

Añade `not-found.html` directamente en `src/`. Se muestra cuando ninguna ruta coincide. Sin ella, una URL desconocida muestra el texto plano "Page Not Found!".

Un `not-found.html` es una página como cualquier otra, así que puede tener su propio [`<head>`](/docs/core/metadata) (title, `robots`, …).

Para rutas dinámicas, varios parámetros y la regla de "sin catch-all", consulta [Convenciones de archivos](/docs/file-conventions#dynamic-routes).
