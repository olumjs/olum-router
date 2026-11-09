---
title: アクティブリンクのスタイル
group: ルーティング
order: 50
source: ae370e0acd4b
---

ルーターは、現在の URL に一致するすべての `to` リンクに `active` クラスを付けます。CSS でスタイルを当てましょう：

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

- クエリ文字列は無視されます：`<a to="/shop?color=red">` は `/shop`、`/shop?color=blue` などでアクティブになります。
- クラスが付くのは `to` を持つリンクだけです（[to によるナビゲーション](/docs/navigating-with-to)を参照）。
