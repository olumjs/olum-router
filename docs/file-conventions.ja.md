---
title: ファイル規約
group: ルーティング
order: 20
source: 5c70dfaffe19
---

`src/` 内のファイル名やフォルダ名がどのようにルートになるかの一覧です：

| 名前 | 役割 |
|------|--------------|
| `page.html` | ルートのページ。フォルダは `page.html` を持つ場合にだけルートになります：`about/page.html` → `/about`。 |
| `not-found.html` | 404 ページ。どのルートにもマッチしないときに表示されます。`src/` の直下に置きます。 |
| `[param]/` | URL の**動的な**部分。`blog/[slug]/page.html` は `/blog/hello` にマッチし、`slug = "hello"` が得られます（[ルートパラメータの取得](/docs/reading-route-params)）。 |
| `(group)/` | **グループ**フォルダ。URL には含まれません。`(marketing)/pricing/page.html` → `/pricing`。ファイルの整理に使います。 |
| `01-name/` | **数字のプレフィックス**（数字 + ダッシュ）は URL から取り除かれます：`01-guide/page.html` → `/guide`。フォルダの並び替えに便利です。それ以外の位置の数字は残ります：`7guis/` → `/7guis`。 |
| `_name/` | **スキップされます。** `_` で始まるフォルダはルートを作りません（下書きに便利です）。 |
| `components/`、`utils/` | どの階層にあっても**スキップされます**。共有のコンポーネントやヘルパーはここに置きます。 |
| `sitemap.js` | **ルートではありません。** `src/sitemap.js` は[プリレンダリング](/docs/core/prerendering)を有効にし、動的ルートの実際の URL を列挙します。ビルド時にだけ使われます。 |

:::warn
名前は**大文字と小文字を区別します**：`page.html` と `not-found.html` は正確にすべて小文字で書きます。`Page.html` は動きません。
:::

:::tip
再利用するコンポーネントは `src/components/` に **PascalCase** の名前で置きましょう。たとえば `src/components/AddTodo.html` のようにします。そうすればルートファイルと区別できます。
:::

## 動的ルート {#dynamic-routes}

- 1 つのパスに複数の動的な部分を持てます：`users/[id]/posts/[postId]/page.html` は `/users/5/posts/10` にマッチし、[`params()`](/docs/reading-route-params) で両方を取得できます。
- URL が通常のルートと動的ルートの両方にマッチする場合は、**通常のルートが優先されます**。

:::warn
**キャッチオールルートはありません。** `[...slug]` はサポートされていません。各 `[param]` は URL の**1 つ**の部分にだけマッチし、部分の数も一致している必要があります。
:::
