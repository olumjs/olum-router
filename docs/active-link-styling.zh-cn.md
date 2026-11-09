---
title: 激活链接样式
group: 路由
order: 50
source: ae370e0acd4b
---

路由器会给每个与当前 URL 匹配的 `to` 链接添加 `active` 类。在 CSS 中为它设置样式：

````html title="src/nav.html"
<a to="/">Home</a>
<a to="/about">About</a>   <!-- gets class="active" on /about -->
````

````css title="src/nav.css"
a.active {
  font-weight: bold;
  color: #6366f1;
}
````

- 查询字符串会被忽略：`<a to="/shop?color=red">` 在 `/shop`、`/shop?color=blue` 等地址上都是激活状态。
- 只有带 `to` 的链接才会获得这个类（参见[使用 to 导航](/docs/navigating-with-to)）。
