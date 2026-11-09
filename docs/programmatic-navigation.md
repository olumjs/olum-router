---
title: Programmatic Navigation
group: Routing
order: 60
---

For links, use the [`to` attribute](/docs/navigating-with-to) (it also gives you [active-link styling](/docs/active-link-styling) for free). To change the page **from code** (after a form submit, a login, a timer), import these helpers from `olum`:

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

They work in both history and hash mode, and handle the router's `root` for you.

| Helper | What it does | Back button |
|--------|--------------|-------------|
| `push(path)` | go to a new page | returns to this page |
| `replace(path)` | go to a new page | skips this page (it's replaced) |
| `back()` | go back one step | |
| `forward()` | go forward one step | |
| `go(n)` | move `n` steps (negative = back) | |
| `pathname()` | read the current path | |
| `searchParams()` | read the query string as an object | |
| `setSearchParam(key, value)` | change one query value **without rendering the page again** | not affected |

They match the browser's `history.pushState()`, `history.replaceState()`, `history.back()`, `history.forward()`, `history.go(n)`, `location.pathname` and `location.search`.

## Example

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

## `push` or `replace`?

- `push("/cart")` adds a history entry, so Back returns to where you were. Same as clicking a link.
- `replace("/dashboard")` replaces the current entry, so Back skips it. Use it for redirects (after login, old URLs) where going back makes no sense.

Both do nothing if the target is the **current** path and query: no render, no history entry, state is kept. A different query counts as a new page.

In history mode, a path can end with `#id`: `push("/match/chelsea/7#comments")`. On the current page it only scrolls; on another page it renders, then scrolls. See [Links to a section](/docs/navigating-with-to#links-to-a-section-id).

## Reading the current path

`pathname()` returns the current path, cleaned up the same way the router sees it: starts with `/`, no trailing `/`, no query. In hash mode it's the part after `#`.

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## Reading the query string

`searchParams()` returns the query as a plain object:

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- Only **exact** numbers become numbers: `"10"`, `"-5"`, `"1.5"`. Things like `"02134"`, `"1e3"`, `"0x10"` and `"Infinity"` stay text, so zip codes and long IDs are safe.
- Everything else is text. `"true"` stays `"true"`.
- Keys like `toString` or `__proto__` are just normal values (the object has no prototype).
- In hash mode the query can be inside the hash (`/#/shop?size=10`), before it (`/?size=10#/shop`), or both.

`searchParams()` is **not reactive**: it reads the URL when you call it. That's enough in a page's `<script>`, because going to a new query (link, `push()`, Back/Forward) renders the page again and the script runs again.

## Changing the query

| You want to… | Use | Page renders again? | History |
|--------------|-----|---------------------|---------|
| go to a new query, like a link | `push("/shop?size=12")` | yes, `<script>` runs again | adds an entry |
| same, without a Back step | `replace("/shop?size=12")` | yes | replaces the entry |
| just remember UI state in the URL | `setSearchParam("size", 12)` | **no**, state is kept | replaces the entry |

With `push()` / `replace()` the path is lowercased for matching, but the query is kept exactly as written.

## Updating the query without rendering

`setSearchParam(key, value)` changes one query value **in place**. The page isn't rendered again (focus, scroll and typed text are kept) and no history entry is added. Use it to save a tab, filter, page number or search in the URL, so a refresh or a shared link shows the same view:

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

**The usual pattern:** read the query into `state` once at the top of `<script>`, then on each change update **both** `state` (so the page updates) and the URL (so it survives a refresh):

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

Typing in the search box updates the URL on every key without losing focus, and opening `/shop?tab=sale&page=3&search=shoes` shows the same view.

### Good to know

- **Removing:** `null`, `undefined`, `""` and `[]` remove the key. `0` and `false` are written as `"0"` and `"false"`.
- **Arrays** become a repeated key (`?tag=a&tag=b`), which `searchParams()` reads back as an array. A one-item array reads back as a single value; `[].concat(q.tag)` always gives you an array.
- **Everything becomes text** in the URL; `searchParams()` turns exact numbers back into numbers. Case is kept.
- **One key replaces all its values:** `setSearchParam("tag", "c")` on `?tag=a&tag=b` gives `?tag=c`.
- **The rest of the URL is kept:** the path, other params, the `#id` and `history.state`. Setting a value that's already there does nothing.
- **The query is re-encoded** when it changes: a space becomes `+` (`?q=a+b`) and a bare `?flag` becomes `?flag=`. Values read back the same.
- **Hash mode:** the value is written inside the hash (`/#/shop?color=Blue`). A copy of the same key before the hash (`/?color=x#/shop`) is removed, so `searchParams()` never sees two.
- **No events fire:** no `popstate`, no `viewLoaded`, no render. Other components that read `searchParams()` keep the old value until they read it again. If several components need the value, keep it in `state` or a [store](/docs/store/global-store).
- **Back skips these changes**, since no history entry is added. If each change should be undoable with Back, use `push()` (the page renders again).
- **`#id` links still work** after `setSearchParam()`: `<a href="#comments">` on the same page only scrolls, and `push()` to the page without the query renders it again.
