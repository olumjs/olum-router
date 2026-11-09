---
title: Estilo del enlace activo
group: Enrutamiento
order: 50
source: ae370e0acd4b
---

El router añade la clase `active` a cada enlace `to` que coincide con la URL actual. Dale estilo en CSS:

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

- La query string se ignora: `<a to="/shop?color=red">` está activo en `/shop`, `/shop?color=blue`, etc.
- Solo los enlaces con `to` reciben la clase (consulta [Navegar con to](/docs/navigating-with-to)).
