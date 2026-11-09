---
title: Estilo do link ativo
group: Roteamento
order: 50
source: ae370e0acd4b
---

O router adiciona a classe `active` a todo link `to` que corresponde à URL atual. Estilize-a no CSS:

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

- A query string é ignorada: `<a to="/shop?color=red">` fica ativo em `/shop`, `/shop?color=blue` e assim por diante.
- Só os links com `to` recebem a classe (veja [Navegando com to](/docs/navigating-with-to)).
