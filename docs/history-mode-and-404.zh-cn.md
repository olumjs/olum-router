---
title: History 模式与 404 页面
group: 路由
order: 70
source: 6101fd8ae15f
---

## 干净的 URL（history 模式） {#clean-urls-history-mode}

路由器默认使用 `/blog/hello` 这样干净的 URL（"history 模式"）。在没有 History API 的旧浏览器中，它会退回到 `/#/blog/hello` 这样的 hash URL。

干净的 URL 需要你的托管服务做一件事：对于每个不是文件的路径，都返回 `index.html`。否则刷新 `/blog/hello` 时会显示 404。设置方法参见[构建与部署](/docs/core/build-and-deploy#deploying)。

[预渲染](/docs/core/prerendering)的页面不需要这一步：每个页面都是 `dist/<route>/index.html` 处的真实文件，任何托管服务都能提供。

## 404 页面 {#the-404-page}

直接在 `src/` 中添加 `not-found.html`。当没有路由匹配时就会显示它。如果没有它，未知的 URL 只会显示纯文本 "Page Not Found!"。

`not-found.html` 和其他页面一样，所以它可以有自己的 [`<head>`](/docs/core/metadata)（title、`robots` 等）。

关于动态路由、多个参数以及"没有通配路由"的规则，参见[文件约定](/docs/file-conventions#dynamic-routes)。
