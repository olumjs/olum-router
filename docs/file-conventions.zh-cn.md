---
title: 文件约定
group: 路由
order: 20
source: 5c70dfaffe19
---

`src/` 中的文件和文件夹名称如何变成路由，一览：

| 名称 | 作用 |
|------|--------------|
| `page.html` | 某个路由的页面。只有包含 `page.html` 的文件夹才会成为路由：`about/page.html` → `/about`。 |
| `not-found.html` | 404 页面，在没有路由匹配时显示。直接放在 `src/` 中。 |
| `[param]/` | URL 中的**动态**部分。`blog/[slug]/page.html` 匹配 `/blog/hello`，并给你 `slug = "hello"`（[读取路由参数](/docs/reading-route-params)）。 |
| `(group)/` | **分组**文件夹，不出现在 URL 中。`(marketing)/pricing/page.html` → `/pricing`。用来组织文件。 |
| `01-name/` | **数字前缀**（数字 + 短横线）会从 URL 中去掉：`01-guide/page.html` → `/guide`。方便给文件夹排序。其他位置的数字保留：`7guis/` → `/7guis`。 |
| `_name/` | **跳过。** 以 `_` 开头的文件夹永远不会生成路由（适合放草稿）。 |
| `components/`、`utils/` | **跳过**，无论在哪一层。把共享的组件和工具函数放在这里。 |
| `sitemap.js` | **不是路由。** `src/sitemap.js` 会开启[预渲染](/docs/core/prerendering)，并列出动态路由的真实 URL。仅在构建时使用。 |

:::warn
名称**区分大小写**：必须是 `page.html` 和 `not-found.html`，全部小写。`Page.html` 无效。
:::

:::tip
把可复用的组件放在 `src/components/` 中，用 **PascalCase** 命名，比如 `src/components/AddTodo.html`。这样能把它们和路由文件区分开。
:::

## 动态路由 {#dynamic-routes}

- 一个路径可以有多个动态部分：`users/[id]/posts/[postId]/page.html` 匹配 `/users/5/posts/10`，[`params()`](/docs/reading-route-params) 会把两个值都给你。
- 如果一个 URL 同时匹配普通路由和动态路由，**普通路由优先**。

:::warn
**没有通配路由。** 不支持 `[...slug]`。每个 `[param]` 只匹配 URL 中的**一段**，而且段数必须一致。
:::
