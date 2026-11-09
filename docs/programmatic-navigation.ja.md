---
title: プログラムによるナビゲーション
group: ルーティング
order: 60
source: f021d3791f39
---

リンクには [`to` 属性](/docs/navigating-with-to)を使いましょう（[アクティブリンクのスタイル](/docs/active-link-styling)もおまけで付いてきます）。**コードから**ページを切り替えるには（フォーム送信後、ログイン後、タイマーなど）、`olum` から次のヘルパーをインポートします：

```js
import { push, replace, back, forward, go, pathname, searchParams, setSearchParam } from "olum";
```

history モードでも hash モードでも動き、ルーターの `root` も処理してくれます。

| ヘルパー | 役割 | 戻るボタン |
|--------|--------------|-------------|
| `push(path)` | 新しいページへ移動 | このページに戻る |
| `replace(path)` | 新しいページへ移動 | このページを飛ばす（置き換えられる） |
| `back()` | 1 つ戻る | |
| `forward()` | 1 つ進む | |
| `go(n)` | `n` ステップ移動（負の数 = 戻る） | |
| `pathname()` | 現在のパスを読む | |
| `searchParams()` | クエリ文字列をオブジェクトとして読む | |
| `setSearchParam(key, value)` | クエリの値を 1 つ変更する。**ページは再レンダリングされない** | 影響なし |

これらはブラウザの `history.pushState()`、`history.replaceState()`、`history.back()`、`history.forward()`、`history.go(n)`、`location.pathname`、`location.search` に対応しています。

## 例 {#example}

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

## `push` と `replace` のどちら？ {#push-or-replace}

- `push("/cart")` は履歴を追加するので、戻ると元の場所に戻ります。リンクをクリックしたのと同じです。
- `replace("/dashboard")` は現在の履歴を置き換えるので、戻るとそこは飛ばされます。戻っても意味がないリダイレクト（ログイン後、古い URL）に使います。

移動先が**現在の**パスとクエリと同じ場合、どちらも何もしません。レンダリングも履歴の追加もなく、ステートは保たれます。クエリが違えば新しいページとみなされます。

history モードでは、パスの末尾に `#id` を付けられます：`push("/match/chelsea/7#comments")`。現在のページならスクロールするだけで、別のページならレンダリングしてからスクロールします。[セクションへのリンク](/docs/navigating-with-to#links-to-a-section-id)を参照してください。

## 現在のパスを読む {#reading-the-current-path}

`pathname()` は現在のパスを返します。ルーターが見るのと同じ形に整えられています：`/` で始まり、末尾の `/` はなく、クエリもありません。hash モードでは `#` の後ろの部分です。

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

## クエリ文字列を読む {#reading-the-query-string}

`searchParams()` はクエリをプレーンなオブジェクトとして返します：

```js
import { searchParams } from "olum";

// URL: /shop?size=10&color=Blue&tag=a&tag=b
const { size, color, tag } = searchParams();
// size  -> 10          (exact numbers become numbers)
// color -> "Blue"      (case is kept)
// tag   -> ["a", "b"]  (a repeated key becomes an array)
```

- 数値になるのは**厳密な**数値だけです：`"10"`、`"-5"`、`"1.5"`。`"02134"`、`"1e3"`、`"0x10"`、`"Infinity"` のようなものはテキストのままなので、郵便番号や長い ID も安全です。
- それ以外はすべてテキストです。`"true"` は `"true"` のままです。
- `toString` や `__proto__` のようなキーも普通の値です（このオブジェクトにはプロトタイプがありません）。
- hash モードでは、クエリは hash の中（`/#/shop?size=10`）、その前（`/?size=10#/shop`）、またはその両方に置けます。

`searchParams()` は**リアクティブではありません**。呼んだ時点の URL を読みます。ページの `<script>` ではそれで十分です。新しいクエリへの移動（リンク、`push()`、戻る/進む）ではページが再レンダリングされ、スクリプトも再実行されるからです。

## クエリを変更する {#changing-the-query}

| やりたいこと | 使うもの | ページは再レンダリングされる？ | 履歴 |
|--------------|-----|---------------------|---------|
| リンクのように新しいクエリへ移動する | `push("/shop?size=12")` | はい、`<script>` が再実行される | 追加される |
| 同上、ただし戻るステップを残さない | `replace("/shop?size=12")` | はい | 置き換えられる |
| UI の状態を URL に覚えておくだけ | `setSearchParam("size", 12)` | **いいえ**、ステートは保たれる | 置き換えられる |

`push()` / `replace()` では、マッチングのためにパスは小文字になりますが、クエリは書いたとおりに保たれます。

## レンダリングせずにクエリを更新する {#updating-the-query-without-rendering}

`setSearchParam(key, value)` はクエリの値を 1 つ**その場で**変更します。ページは再レンダリングされず（フォーカス、スクロール、入力中のテキストは保たれます）、履歴も追加されません。タブ、フィルター、ページ番号、検索語を URL に保存して、リロードや共有したリンクでも同じ表示になるようにするために使います：

```js
import { setSearchParam } from "olum";

// URL: /shop?size=10
setSearchParam("color", "Blue");   // -> /shop?size=10&color=Blue
setSearchParam("size", 12);        // -> /shop?size=12&color=Blue
setSearchParam("tag", ["a", "b"]); // -> /shop?size=12&color=Blue&tag=a&tag=b
setSearchParam("tag", []);         // -> /shop?size=12&color=Blue
setSearchParam("color", null);     // -> /shop?size=12
```

**よくあるパターン：** `<script>` の先頭でクエリを一度 `state` に読み込み、変更のたびに `state`（ページを更新するため）と URL（リロード後も残すため）の**両方**を更新します：

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

検索欄に入力すると、フォーカスを失うことなくキーを押すたびに URL が更新され、`/shop?tab=sale&page=3&search=shoes` を開くと同じ表示になります。

### 知っておくと良いこと {#good-to-know}

- **削除：** `null`、`undefined`、`""`、`[]` はキーを削除します。`0` と `false` は `"0"` と `"false"` として書かれます。
- **配列**は繰り返しのキー（`?tag=a&tag=b`）になり、`searchParams()` は配列として読み戻します。要素が 1 つの配列は単一の値として読み戻されます。`[].concat(q.tag)` を使えば常に配列が得られます。
- URL の中では**すべてがテキストになります**。`searchParams()` は厳密な数値を数値に戻します。大文字・小文字は保たれます。
- **1 つのキーはそのすべての値を置き換えます：** `?tag=a&tag=b` に対して `setSearchParam("tag", "c")` を呼ぶと `?tag=c` になります。
- **URL の残りの部分は保たれます：** パス、他のパラメータ、`#id`、`history.state`。すでにある値を設定しても何も起きません。
- クエリは変更時に**再エンコードされます**：スペースは `+` に（`?q=a+b`）、単独の `?flag` は `?flag=` になります。読み戻した値は同じです。
- **hash モード：** 値は hash の中に書かれます（`/#/shop?color=Blue`）。hash の前にある同じキーのコピー（`/?color=x#/shop`）は削除されるので、`searchParams()` が 2 つ見ることはありません。
- **イベントは発火しません：** `popstate` も `viewLoaded` も、レンダリングも起きません。`searchParams()` を読んでいる他のコンポーネントは、再び読むまで古い値のままです。複数のコンポーネントがその値を必要とする場合は、`state` か[ストア](/docs/store/global-store)に保持してください。
- 履歴が追加されないので、**戻るとこれらの変更は飛ばされます**。変更ごとに戻るで元に戻せるようにしたい場合は、`push()` を使ってください（ページは再レンダリングされます）。
- `setSearchParam()` の後も **`#id` リンクは動きます**：同じページの `<a href="#comments">` はスクロールするだけで、クエリなしのページへの `push()` はページを再レンダリングします。
