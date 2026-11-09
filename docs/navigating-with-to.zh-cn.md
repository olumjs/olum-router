---
title: 使用 to 导航
group: 路由
order: 40
source: 2310098e855f
---

在链接上用 `to` 代替 `href`。这样路由器会在**不刷新**浏览器的情况下切换页面：

````html title="src/page.html"
<a to="/about">About</a>                  <!-- fast: no reload -->

<a href="/about">About (full reload)</a>  <!-- normal browser link -->
````

要在代码中导航（表单提交后、登录后……），请使用 [`push` / `replace` / `back`](/docs/programmatic-navigation)。

:::warn
`to` 链接的内容请保持为**纯文本**。如果你在里面放了元素（`<span>`、`<img>`、图标），用户点到它时导航会失效。
:::

:::note
除非使用预渲染，否则刷新 `/blog/hello` 这样的页面需要托管服务的设置。参见 [History 模式与 404 页面](/docs/history-mode-and-404)。
:::

## 点击指向当前页面的链接 {#clicking-a-link-to-the-current-page}

如果链接的路径**和**查询参数都与当前 URL 相同，就什么都不会发生：页面不会重新渲染，它的状态会被保留，也不会添加历史记录。

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- nothing happens -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: different query -->
<a to="/Shop/">Shop</a>            <!-- nothing on /shop: case and trailing slash are ignored -->
```

`push()` 和 `replace()` 的行为相同。查询参数按值比较，所以 `?q=a b` 和 `?q=a%20b` 是相等的。

## 指向某个区块的链接（`#id`） {#links-to-a-section-id}

链接可以以 `#id` 结尾，滚动到带有该 `id` 的元素，和任何网站一样：

```html
<a href="#comments">Comments</a>                    <!-- on this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **同一页面：** 只会滚动。页面不会重新渲染，所以它的状态会被保留（在 `#id` 之间前进 / 后退，以及连续两次点击同一个 `#id` 时也是如此）。
- **另一个页面：** 页面渲染后再滚动。
- **打开或刷新** `/match/chelsea/7#comments`：页面渲染后再滚动。
- 滚动由浏览器完成，所以 `scroll-margin-top`（为吸顶头部留出空间）和 `scroll-behavior: smooth` 这样的 CSS 都能生效。

:::warn
- 仅在 history 模式（默认）下有效。在 hash 模式下，`#` 已经被路由占用了（`/#/about`）。
- 在 `to` 链接中，`#id` 会像路径的其他部分一样被**转成小写**，所以请使用小写的 id（`#comments`，而不是 `#Comments`）。普通的 `href="#id"` 会保留大小写。
- `to="/#story"`（首页上的 `#id`）无效：它会跳到 `/story`。在首页上请使用 `<a href="#story">`。
:::
