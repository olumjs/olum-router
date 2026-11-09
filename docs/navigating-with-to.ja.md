---
title: to によるナビゲーション
group: ルーティング
order: 40
source: 2310098e855f
---

リンクには `href` の代わりに `to` を使います。するとルーターはブラウザを**リロードせずに**ページを切り替えます：

````html title="src/page.html"
<a to="/about">About</a>                  <!-- fast: no reload -->

<a href="/about">About (full reload)</a>  <!-- normal browser link -->
````

コードから移動する場合（フォーム送信後、ログイン後など）は [`push` / `replace` / `back`](/docs/programmatic-navigation) を使います。

:::warn
`to` リンクの中身は**プレーンテキスト**にしてください。中に要素（`<span>`、`<img>`、アイコン）を入れると、ユーザーがそれをクリックしたときにナビゲーションが行われません。
:::

:::note
プリレンダリングしない場合、`/blog/hello` のようなページをリロードするにはホスティング側の設定が必要です。[History モードと 404 ページ](/docs/history-mode-and-404)を参照してください。
:::

## 現在のページへのリンクをクリックしたとき {#clicking-a-link-to-the-current-page}

リンクのパス**と**クエリが現在の URL と同じ場合は何も起きません。ページは再レンダリングされず、ステートも保たれ、履歴にも追加されません。

```html
<!-- on /shop?color=red -->
<a to="/shop?color=red">Red</a>    <!-- nothing happens -->
<a to="/shop?color=blue">Blue</a>  <!-- navigates: different query -->
<a to="/Shop/">Shop</a>            <!-- nothing on /shop: case and trailing slash are ignored -->
```

`push()` と `replace()` も同じように動きます。クエリは値で比較されるので、`?q=a b` と `?q=a%20b` は等しいとみなされます。

## セクションへのリンク（`#id`） {#links-to-a-section-id}

一般的なウェブサイトと同じく、リンクの末尾に `#id` を付けると、その `id` を持つ要素までスクロールします：

```html
<a href="#comments">Comments</a>                    <!-- on this page -->
<a to="/match/chelsea/7#comments">Comments</a>       <!-- this page or another one -->
```

- **同じページ：** スクロールするだけです。ページは再レンダリングされないので、ステートは保たれます（`#id` 間の戻る / 進むや、同じ `#id` を 2 回クリックした場合も同様です）。
- **別のページ：** ページをレンダリングしてからスクロールします。
- `/match/chelsea/7#comments` を**開いたりリロードしたりした場合**：ページをレンダリングしてからスクロールします。
- スクロールはブラウザが行うので、`scroll-margin-top`（固定ヘッダー分の余白）や `scroll-behavior: smooth` といった CSS も効きます。

:::warn
- history モード（デフォルト）でのみ使えます。hash モードでは `#` がすでにルートに使われています（`/#/about`）。
- `to` リンクでは、`#id` もパスの他の部分と同様に**小文字に変換**されるので、id は小文字にしてください（`#Comments` ではなく `#comments`）。普通の `href="#id"` は大文字・小文字がそのまま保たれます。
- `to="/#story"`（ホームページ上の `#id`）は動きません。`/story` に移動してしまいます。ホームページでは `<a href="#story">` を使ってください。
:::
