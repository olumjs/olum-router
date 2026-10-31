---
title: Programmatic Navigation
group: Routing
order: 212
---

The [`to` attribute](/docs/navigating-with-to) covers links, but sometimes navigation happens from **code** — after a form submit, a successful login, a timeout. For that, import the navigation helpers from `olum`:

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

Each helper delegates to the active router instance and works in **both** `hash` and `history` mode — paths are resolved against the router's `root` for you.

| Helper | Action | History stack | Native equivalent |
|--------|--------|---------------|-------------------|
| `push(path)` | Navigate to a new URL | Adds a new entry | `history.pushState()` |
| `replace(path)` | Navigate to a new URL | Overwrites the current entry | `history.replaceState()` |
| `back()` | Move backward one step | Rewinds current position | `history.back()` |
| `forward()` | Move forward one step | Advances current position | `history.forward()` |
| `go(n)` | Move by `n` steps (negative = back) | Jumps to a specific index | `history.go(n)` |
| `pathname()` | Read the current route path | — | `location.pathname` |
| `searchParams()` | Read the query string as an object | — | `location.search` |
| `setSearchParam(key, value)` | Set or delete one query param, without rendering | Overwrites the current entry | `history.replaceState()` |

## Example

```html title="src/login/page.html"
<script>
  import { replace, back } from "olum";

  const login = () => {
    // ...authenticate...
    // `replace` so the login page doesn't stay in history —
    // pressing Back afterwards won't return to the form.
    replace("/dashboard");
  };

  const cancel = () => back();
</script>

<form>
  <button type="button" onclick="login()">Sign in</button>
  <button type="button" onclick="cancel()">Cancel</button>
</form>
```

## `push` vs `replace`

Both navigate to a new route; the difference is what the **Back button** does afterwards:

- `push("/cart")` — adds an entry, so Back returns to the page you came from. This is what a normal link click does.
- `replace("/dashboard")` — swaps the current entry, so the page you were on disappears from history. Use it for redirects (login flows, deprecated URLs) where returning to the intermediate page makes no sense.

## Reading the current route

`pathname()` returns the current route path, normalized the same way the router matches it — leading slash, no trailing slash, and in hash mode the part after `#`:

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## Reading the query string

`searchParams()` returns the query string of the current URL as a plain object. It works in both modes — in hash mode the query can sit inside the hash (`/#/shop?size=10`), before it (`/?size=10#/shop`), or both:

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- Only **exact** numbers are converted: `"10"`, `"-5"` and `"1.5"` become numbers, but `"02134"`, `"1e3"`, `"0x10"` and `"Infinity"` stay strings, so zip codes and long IDs are safe.
- Everything else is a string — `"true"` is not turned into `true`.
- The object has no prototype, so a key like `toString` or `__proto__` is just a value.

`searchParams()` reads the URL at the moment you call it — it is not reactive. That is enough in a page's `<script>`: navigating to a new query (a link, `push()`, Back/Forward) renders the page again, so the script runs again with the new values.

`pathname()` never includes the query.

## Changing the query

There are two ways, depending on whether the page should render again:

| You want | Use | Renders | History |
|----------|-----|---------|---------|
| Go to a new query, like a link would | `push("/shop?size=12")` | yes — the page's `<script>` runs again | adds an entry |
| The same, without a Back step | `replace("/shop?size=12")` | yes | overwrites the entry |
| Only reflect UI state in the URL | `setSearchParam("size", 12)` | **no** — the page keeps its state | overwrites the entry |

With `push()` / `replace()` the path part is matched against your routes as usual (lowercased), but the query is kept exactly as you wrote it.

## Updating the query without rendering

`setSearchParam(key, value)` changes one query param of the current URL **in place**: the page is not rendered again, keeps its state (focus, scroll, typed input), and no history entry is added. Use it to mirror UI state in the URL — a tab, a filter, a page number, a search box — so a reload or a shared link comes back to the same view:

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

The usual pattern: **read** the query once into `state` at the top of `<script>`, and **write** each change to both `state` (so the page updates) and the URL (so it survives a reload):

```html title="src/shop/page.html"
<script>
  import { searchParams, setSearchParam } from "olum";

  const TABS = ["all", "new", "sale"];
  const q = searchParams();
  const state = {
    tab: TABS.includes(q.tab) ? q.tab : "all",           // never trust the URL: validate
    page: typeof q.page === "number" && q.page > 1 ? q.page : 1,
    search: q.search === undefined ? "" : String(q.search), // "10" arrives as the number 10
  };

  const setTab = (tab) => {
    state.tab = tab;
    setSearchParam("tab", tab === "all" ? null : tab); // keep the default out of the URL
    setPage(1);
  };
  const setPage = (n) => {
    state.page = n;
    setSearchParam("page", n === 1 ? null : n);
  };
  const setSearch = (value) => {
    state.search = value;
    setSearchParam("search", value); // "" removes it
  };
</script>

<for each="tab of TABS">
  <button class="{state.tab === tab ? 'active' : ''}" onclick="setTab(tab)">{tab}</button>
</for>
<input value="{state.search}" oninput="(e) => setSearch(e.target.value)" placeholder="Search" />
<button onclick="setPage(state.page + 1)">Next page ({state.page})</button>
```

Typing in the search box updates the URL on every keystroke without the input losing focus, and reloading `/shop?tab=sale&page=3&search=shoes` opens the same view.

### Details worth knowing

- **Deleting:** `null`, `undefined`, `""` and an empty array remove the key. `0` and `false` are written as `"0"` and `"false"`.
- **Arrays** are written as a repeated key (`?tag=a&tag=b`), so `searchParams()` reads them back as an array. A one-item array reads back as a plain value — `[].concat(q.tag)` turns either into an array.
- **Values become strings** in the URL; `searchParams()` turns exact numbers back into numbers. Keys and values keep their case.
- **One key replaces all its values:** `setSearchParam("tag", "c")` on `?tag=a&tag=b` gives `?tag=c`.
- **The rest of the URL is kept:** the path, the other params, the `#id` and `history.state`. Writing a value the URL already has does nothing.
- **The whole query is re-encoded** when it changes, so a space shows as `+` (`?q=a+b`) and a bare `?flag` becomes `?flag=`. The values read back the same.
- **Hash mode:** the param is written inside the hash (`/#/shop?color=Blue`). A copy of the same key before the hash (`/?color=x#/shop`) is removed, so `searchParams()` never sees two.
- **No events fire:** no `popstate`, no `viewLoaded`, no render. Other components that read `searchParams()` keep their old value until they read it again — keep the value in `state` (or the [store](/docs/global-store)) when several components need it.
- **Back skips these changes.** Since no history entry is added, Back leaves the page instead of undoing a filter. If each step should be undoable with Back, use `push()` instead (the page renders again).
- **`#id` links keep working:** after `setSearchParam()`, an `<a href="#comments">` on the same page still only scrolls, and `push()` to the page without the query renders it again.

## Navigating to the current page

`push()` and `replace()` do nothing when the target has the same path and query as the current URL: no render, no history entry, and the page keeps its state. A different query is a new URL and navigates.

In **history** mode a path can also end with an `#id` — `push("/match/chelsea/7#comments")`. On the current page this only scrolls (no render); on another page it renders, then scrolls. See [Links to a section](/docs/navigating-with-to#links-to-a-section-id).

:::tip
For **links**, prefer the [`to` attribute](/docs/navigating-with-to) — it also gives you [active-link styling](/docs/active-link-styling) for free. Reach for these helpers only when navigation is triggered by logic rather than a click on a link.
:::
