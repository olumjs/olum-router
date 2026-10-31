---
title: Programmatic Navigation
group: Routing
order: 212
---

The [`to` attribute](/docs/navigating-with-to) covers links, but sometimes navigation happens from **code** — after a form submit, a successful login, a timeout. For that, import the navigation helpers from `olum`:

```js
import { push, replace, back, forward, go, pathname, searchParams } from "olum";
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

To change the query, navigate to a path that carries one — `push("/shop?size=12")`. The path part is matched against your routes as usual (lowercased), but the query is kept exactly as you wrote it. `pathname()` never includes the query.

`searchParams()` reads the URL at the moment you call it — it is not reactive. That is enough in a page's `<script>`: a new query renders the page again, so the script runs again with the new values.

## Navigating to the current page

`push()` and `replace()` do nothing when the target has the same path and query as the current URL: no render, no history entry, and the page keeps its state. A different query is a new URL and navigates.

In **history** mode a path can also end with an `#id` — `push("/match/chelsea/7#comments")`. On the current page this only scrolls (no render); on another page it renders, then scrolls. See [Links to a section](/docs/navigating-with-to#links-to-a-section-id).

:::tip
For **links**, prefer the [`to` attribute](/docs/navigating-with-to) — it also gives you [active-link styling](/docs/active-link-styling) for free. Reach for these helpers only when navigation is triggered by logic rather than a click on a link.
:::
