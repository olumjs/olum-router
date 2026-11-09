---
title: Active Link Styling
group: Routing
order: 50
---

The router adds an `active` class to every `to` link that matches the current URL. Style it in CSS:

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

- The query string is ignored: `<a to="/shop?color=red">` is active on `/shop`, `/shop?color=blue`, and so on.
- Only links with `to` get the class (see [Navigating with to](/docs/navigating-with-to)).
