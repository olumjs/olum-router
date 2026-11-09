---
title: 编程式导航
group: 路由
order: 60
source: f021d3791f39
---

链接请使用 [`to` 属性](/docs/navigating-with-to)（它还会免费给你[激活链接样式](/docs/active-link-styling)）。要**在代码中**切换页面（表单提交后、登录后、定时器到期时），从 `olum` 导入这些辅助函数：

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

它们在 history 模式和 hash 模式下都能工作，并会帮你处理路由器的 `root`。

| 辅助函数 | 作用 | 后退按钮 |
|--------|--------------|-------------|
| `push(path)` | 跳转到新页面 | 会回到当前页面 |
| `replace(path)` | 跳转到新页面 | 跳过当前页面（它被替换了） |
| `back()` | 后退一步 | |
| `forward()` | 前进一步 | |
| `go(n)` | 移动 `n` 步（负数 = 后退） | |
| `pathname()` | 读取当前路径 | |
| `searchParams()` | 把查询字符串读取为一个对象 | |
| `setSearchParam(key, value)` | 修改一个查询值，**不会重新渲染页面** | 不受影响 |

它们分别对应浏览器的 `history.pushState()`、`history.replaceState()`、`history.back()`、`history.forward()`、`history.go(n)`、`location.pathname` 和 `location.search`。

## 示例 {#example}

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

## 用 `push` 还是 `replace`？ {#push-or-replace}

- `push("/cart")` 会添加一条历史记录，所以点后退会回到你原来的位置。和点击链接一样。
- `replace("/dashboard")` 会替换当前的历史记录，所以后退会跳过它。在后退没有意义的重定向场景（登录后、旧 URL）中使用它。

如果目标就是**当前**的路径和查询参数，两者都什么都不做：不渲染，不添加历史记录，状态保留。查询参数不同就算作一个新页面。

在 history 模式下，路径可以以 `#id` 结尾：`push("/match/chelsea/7#comments")`。在当前页面上它只会滚动；在另一个页面上，它会先渲染再滚动。参见[指向某个区块的链接](/docs/navigating-with-to#links-to-a-section-id)。

## 读取当前路径 {#reading-the-current-path}

`pathname()` 返回当前路径，并以路由器看待它的方式进行了规整：以 `/` 开头，没有结尾的 `/`，没有查询参数。在 hash 模式下，它是 `#` 后面的部分。

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## 读取查询字符串 {#reading-the-query-string}

`searchParams()` 把查询参数作为一个普通对象返回：

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- 只有**精确的**数字才会变成数字：`"10"`、`"-5"`、`"1.5"`。像 `"02134"`、`"1e3"`、`"0x10"` 和 `"Infinity"` 这样的值保持为文本，所以邮政编码和长 ID 都是安全的。
- 其他一切都是文本。`"true"` 仍然是 `"true"`。
- 像 `toString` 或 `__proto__` 这样的键只是普通的值（这个对象没有原型）。
- 在 hash 模式下，查询参数可以在 hash 内部（`/#/shop?size=10`）、在它之前（`/?size=10#/shop`），或者两者都有。

`searchParams()` **不是响应式的**：它在你调用时读取 URL。在页面的 `<script>` 中这就足够了，因为跳转到新的查询参数（链接、`push()`、后退/前进）会重新渲染页面，脚本也会重新运行。

## 修改查询参数 {#changing-the-query}

| 你想要…… | 使用 | 页面会重新渲染吗？ | 历史记录 |
|--------------|-----|---------------------|---------|
| 像链接一样跳转到新的查询参数 | `push("/shop?size=12")` | 是，`<script>` 会重新运行 | 添加一条记录 |
| 同上，但不留后退步骤 | `replace("/shop?size=12")` | 是 | 替换当前记录 |
| 只是在 URL 中记住界面状态 | `setSearchParam("size", 12)` | **否**，状态保留 | 替换当前记录 |

使用 `push()` / `replace()` 时，路径会被转成小写用于匹配，但查询参数会完全按原样保留。

## 不重新渲染地更新查询参数 {#updating-the-query-without-rendering}

`setSearchParam(key, value)` 会**就地**修改一个查询值。页面不会重新渲染（焦点、滚动位置和已输入的文字都会保留），也不会添加历史记录。用它把标签页、筛选条件、页码或搜索词保存在 URL 中，这样刷新或分享链接时会显示同样的视图：

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

**常用模式：** 在 `<script>` 顶部把查询参数一次性读入 `state`，然后每次变化时**同时**更新 `state`（让页面更新）和 URL（让它在刷新后依然保留）：

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

在搜索框中打字时，每按一个键都会更新 URL 而不会丢失焦点；打开 `/shop?tab=sale&page=3&search=shoes` 会显示同样的视图。

### 须知 {#good-to-know}

- **移除：** `null`、`undefined`、`""` 和 `[]` 会移除这个键。`0` 和 `false` 会被写成 `"0"` 和 `"false"`。
- **数组**会变成重复的键（`?tag=a&tag=b`），`searchParams()` 会把它读回为数组。只有一项的数组会被读回为单个值；`[].concat(q.tag)` 总能给你一个数组。
- 在 URL 中**一切都会变成文本**；`searchParams()` 会把精确的数字转回数字。大小写会保留。
- **一个键会替换它的所有值：** 在 `?tag=a&tag=b` 上调用 `setSearchParam("tag", "c")` 会得到 `?tag=c`。
- **URL 的其余部分会保留：** 路径、其他参数、`#id` 和 `history.state`。设置一个已经存在的值什么都不做。
- 查询参数变化时**会被重新编码**：空格会变成 `+`（`?q=a+b`），单独的 `?flag` 会变成 `?flag=`。读回的值不变。
- **Hash 模式：** 值会写在 hash 内部（`/#/shop?color=Blue`）。hash 之前同一个键的副本（`/?color=x#/shop`）会被移除，所以 `searchParams()` 永远不会看到两个。
- **不会触发任何事件：** 没有 `popstate`，没有 `viewLoaded`，也没有渲染。其他读取 `searchParams()` 的组件在再次读取之前会保留旧值。如果多个组件都需要这个值，请把它放在 `state` 或 [store](/docs/store/global-store) 中。
- **后退会跳过这些修改**，因为没有添加历史记录。如果每次修改都应该能用后退撤销，请使用 `push()`（页面会重新渲染）。
- `setSearchParam()` 之后，**`#id` 链接依然有效**：同一页面上的 `<a href="#comments">` 只会滚动，而 `push()` 到不带查询参数的页面会重新渲染它。
