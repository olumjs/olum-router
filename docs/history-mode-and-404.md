---
title: History Mode & the 404 Page
group: Routing
order: 70
---

## Clean URLs (history mode)

The router uses clean URLs like `/blog/hello` by default ("history mode"). In an old browser without the History API, it falls back to hash URLs like `/#/blog/hello`.

Clean URLs need one thing from your host: it must send `index.html` for every path that isn't a file. Otherwise refreshing `/blog/hello` shows a 404. See [Build & Deploy](/docs/core/build-and-deploy#deploying) for how to set it up.

[Prerendered](/docs/core/prerendering) pages don't need this: each one is a real file at `dist/<route>/index.html`, which every host serves.

## The 404 page

Add `not-found.html` directly in `src/`. It's shown whenever no route matches. Without it, an unknown URL shows plain "Page Not Found!" text.

A `not-found.html` is a page like any other, so it can have its own [`<head>`](/docs/core/metadata) (title, `robots`, …).

For dynamic routes, multiple params and the "no catch-all" rule, see [File Conventions](/docs/file-conventions#dynamic-routes).
