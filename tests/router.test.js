const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

let passed = 0;
let failed = 0;

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => paint("32", s);
const red = (s) => paint("31", s);
const dim = (s) => paint("2", s);
const bold = (s) => paint("1", s);
const yellow = (s) => paint("33", s);
const cyan = (s) => paint("36", s);
const PASS_ICON = green("✔");
const FAIL_ICON = red("✖");

const ROUTER_SRC = fs.readFileSync(
  path.join(__dirname, "../core/router.js"),
  "utf8",
);
function load(url, src) {
  const dom = new JSDOM("<!doctype html><body></body>", {
    url: url || "http://localhost/",
    runScripts: "outside-only",
  });
  dom.window.eval(
    (src || ROUTER_SRC).replace(
      /^\s*export\s+default\s+/m,
      "window.__Router = ",
    ),
  );
  const Router = dom.window.__Router;
  const extractParams = (fp, pn) =>
    new Router({ routes: [{ path: "/", comp: () => {} }] }).extractParams(
      fp,
      pn,
    );
  return {
    window: dom.window,
    document: dom.window.document,
    Router: Router,
    extractParams: extractParams,
  };
}

function silent(fn) {
  const log = console.log,
    err = console.error,
    warn = console.warn;
  console.log = console.error = console.warn = () => {};
  try {
    return fn();
  } finally {
    console.log = log;
    console.error = err;
    console.warn = warn;
  }
}

let currentSection = "(no section)";
const failedSections = [];

function recordFail(name) {
  failed++;
  failedSections.push({ section: currentSection, name });
}

function check(name, fn) {
  let ok = false;
  let detail = "";
  try {
    ok = fn();
  } catch (e) {
    detail = " (" + e.message + ")";
  }
  if (ok) {
    passed++;
    console.log("  " + PASS_ICON + " " + name);
  } else {
    recordFail(name);
    console.log("  " + FAIL_ICON + " " + red(name) + dim(detail));
    console.log("      " + dim("↳ in " + currentSection));
  }
}

function section(title) {
  currentSection = title;
  console.log("\n" + bold(cyan(title)));
}

const view = (tag) => {
  const f = () => tag;
  f.tag = tag;
  return f;
};

function makeRouter(config, url, src) {
  const env = load(url, src);
  const calls = [];
  const router = new env.Router(config);
  router.render = (View) => calls.push(View.tag);
  router.rootElm = env.document.createElement("div");
  return { ...env, router, calls };
}

console.log(
  "\n" + bold("🧪 OlumJS router fixtures") + "\n========================",
);

section("§1 extractParams()");

check("[slug] captures a single dynamic segment", () => {
  const { extractParams } = load();
  const p = extractParams("/blog/[slug]/page.html", "/blog/hello");
  return p.slug === "hello";
});

check("multiple [params] are all captured", () => {
  const { extractParams } = load();
  const p = extractParams(
    "/users/[id]/posts/[postId]/page.html",
    "/users/5/posts/10",
  );
  return p.id === "5" && p.postId === "10";
});

check("the value is URI-decoded", () => {
  const { extractParams } = load();
  return (
    extractParams("/q/[term]/page.html", "/q/hello%20world").term ===
    "hello world"
  );
});

check("a static route yields no params", () => {
  const { extractParams } = load();
  return Object.keys(extractParams("/about/page.html", "/about")).length === 0;
});

check(
  "[...rest] catch-all returns an array (current behavior: from path start)",
  () => {
    const { extractParams } = load();

    const p = extractParams("/docs/[...path]/page.html", "/docs/a/b/c");
    return Array.isArray(p.path) && p.path.join("/") === "docs/a/b/c";
  },
);

check("extractParams is exposed on the router instance", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: () => {} }] });
  return typeof r.extractParams === "function";
});

section("§2 String.prototype.cap");

check("capitalizes the first letter of each word", () => {
  const { window } = load();
  return window.eval('"hello world".cap()') === "Hello World";
});

check("is installed on the realm's String.prototype", () => {
  const { window } = load();
  return typeof window.String.prototype.cap === "function";
});

section("§3 construction & guards");

check("throws when called without `new`", () => {
  const { Router } = load();
  let threw = false;
  try {
    Router({ routes: [{ path: "/", comp: view("H") }] });
  } catch (e) {
    threw = /without 'new'/.test(e.message);
  }
  return threw;
});

check("throws when config is missing", () => {
  const { Router } = load();
  let threw = false;
  try {
    new Router();
  } catch (e) {
    threw = /Missing config/.test(e.message);
  }
  return threw;
});

check("throws when there are no routes", () => {
  const { Router } = load();
  let threw = false;
  try {
    new Router({ routes: [] });
  } catch (e) {
    threw = /No routes/.test(e.message);
  }
  return threw;
});

check("a valid config produces a ready router", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: view("H") }] });
  return r.isReady === true;
});

check(
  "name() identifies it as a Router (runtime uses this to detect routers)",
  () => {
    const { Router } = load();
    const r = new Router({ routes: [{ path: "/", comp: view("H") }] });
    return r.name() === "Router";
  },
);

check("params starts as an empty object", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: view("H") }] });
  return (
    r.params &&
    typeof r.params === "object" &&
    Object.keys(r.params).length === 0
  );
});

section("§4 pathname()");

check("hash mode reads the fragment from location.hash", () => {
  const { router } = makeRouter(
    { routes: [{ path: "/foo", comp: view("F") }] },
    "http://localhost/#/foo",
  );
  return router.pathname() === "/foo";
});

check("a trailing slash is normalized away", () => {
  const { router } = makeRouter(
    { routes: [{ path: "/foo", comp: view("F") }] },
    "http://localhost/#/foo/",
  );
  return router.pathname() === "/foo";
});

check("history mode reads the fragment from location.pathname", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/foo", comp: view("F") }] },
    "http://localhost/foo",
  );
  return router.pathname() === "/foo";
});

section("§5 navigation");

check("hash navigate() updates location.hash", () => {
  const { router, window } = makeRouter({
    routes: [
      { path: "/", comp: view("H") },
      { path: "/about", comp: view("A") },
    ],
  });
  silent(() => router.navigate("/about"));
  return window.location.hash === "#/about" && router.pathname() === "/about";
});

check("history navigate() pushes to the history stack", () => {
  const { router, window } = makeRouter({
    mode: "history",
    routes: [
      { path: "/", comp: view("H") },
      { path: "/about", comp: view("A") },
    ],
  });
  silent(() => router.navigate("/about"));
  return (
    window.location.pathname === "/about" && router.pathname() === "/about"
  );
});

check("push() navigates like navigate()", () => {
  const { router, window } = makeRouter({
    routes: [
      { path: "/", comp: view("H") },
      { path: "/about", comp: view("A") },
    ],
  });
  silent(() => router.push("/about"));
  return window.location.hash === "#/about" && router.pathname() === "/about";
});

check("replace() overwrites the current entry instead of adding one", () => {
  const { router, window } = makeRouter({
    mode: "history",
    routes: [
      { path: "/", comp: view("H") },
      { path: "/about", comp: view("A") },
    ],
  });
  const before = window.history.length;
  silent(() => router.replace("/about"));
  return (
    window.location.pathname === "/about" && window.history.length === before
  );
});

check("back()/forward()/go() delegate to window.history", () => {
  const { router, window } = makeRouter({
    routes: [{ path: "/", comp: view("H") }],
  });
  window.eval(`
    window.__hits = [];
    history.back = () => window.__hits.push("back");
    history.forward = () => window.__hits.push("forward");
    history.go = (n) => window.__hits.push("go:" + n);
  `);
  router.back();
  router.forward();
  router.go(-2);
  return window.__hits.join(",") === "back,forward,go:-2";
});

section("§6 freeze / unfreeze");

check("freeze() suppresses route callbacks on popstate", () => {
  const { router, window, calls } = makeRouter({
    mode: "history",
    routes: [{ path: "/", comp: view("H") }],
  });
  silent(() => router.listen());
  const before = calls.length;
  router.freeze();
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === before;
});

check("unfreeze() restores route callbacks", () => {
  const { router, window, calls } = makeRouter({
    mode: "history",
    routes: [
      { path: "/", comp: view("H") },
      { path: "/about", comp: view("A") },
    ],
  });
  silent(() => router.listen());
  router.freeze();
  window.history.pushState({}, "", "/about");
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  const frozen = calls.length;
  router.unfreeze();
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === frozen + 1 && calls[calls.length - 1] === "A";
});

section("§7 route matching");

check("listen() renders the view for the current route", () => {
  const { router, calls } = makeRouter(
    {
      routes: [
        { path: "/", comp: view("Home") },
        { path: "/about", comp: view("About") },
      ],
    },
    "http://localhost/#/about",
  );
  silent(() => router.listen());
  return calls[calls.length - 1] === "About";
});

check("navigating renders the destination view (history mode)", () => {
  const { router, calls } = makeRouter({
    mode: "history",
    routes: [
      { path: "/", comp: view("Home") },
      { path: "/about", comp: view("About") },
    ],
  });
  silent(() => router.listen());
  silent(() => router.navigate("/about"));
  return calls.join(",") === "Home,About";
});

check("an unmatched route with no err handler shows Page Not Found", () => {
  const { router } = makeRouter(
    { routes: [{ path: "/", comp: view("Home") }] },
    "http://localhost/#/missing",
  );
  silent(() => router.listen());
  return router.rootElm.innerHTML === "Page Not Found!";
});

check("an unmatched route falls back to the configured err route", () => {
  const { router, calls } = makeRouter(
    {
      err: "/404",
      routes: [
        { path: "/", comp: view("Home") },
        { path: "/404", comp: view("NotFound") },
      ],
    },
    "http://localhost/#/missing",
  );
  silent(() => router.listen());
  return calls[calls.length - 1] === "NotFound";
});

section("§8 searchParams()");

check("history mode reads the query from location.search", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/shop", comp: view("S") }] },
    "http://localhost/shop?size=10&color=blue",
  );
  const q = router.searchParams();
  return q.size === 10 && q.color === "blue" && Object.keys(q).length === 2;
});

check(
  "hash mode reads the query inside the hash, and pathname() ignores it",
  () => {
    const { router } = makeRouter(
      { routes: [{ path: "/shop", comp: view("S") }] },
      "http://localhost/#/shop?size=10&color=blue",
    );
    const q = router.searchParams();
    return q.size === 10 && q.color === "blue" && router.pathname() === "/shop";
  },
);

check("hash mode merges a query before the hash with the one inside it", () => {
  const { router } = makeRouter(
    { routes: [{ path: "/shop", comp: view("S") }] },
    "http://localhost/?utm=mail#/shop?size=10",
  );
  const q = router.searchParams();
  return q.utm === "mail" && q.size === 10;
});

check("no query gives an empty object", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/shop", comp: view("S") }] },
    "http://localhost/shop",
  );
  return Object.keys(router.searchParams()).length === 0;
});

check("repeated keys become arrays", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("H") }] },
    "http://localhost/?tag=a&tag=b&tag=3",
  );
  const t = router.searchParams().tag;
  return (
    Array.isArray(t) &&
    t.length === 3 &&
    t[0] === "a" &&
    t[1] === "b" &&
    t[2] === 3
  );
});

check("only exact numbers become numbers", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("H") }] },
    "http://localhost/?a=10&b=-5&c=1.5&zip=02134&exp=1e3&hex=0x10&inf=Infinity&nan=NaN&sp=%205&id=12345678901234567890&e=",
  );
  const q = router.searchParams();
  return (
    q.a === 10 &&
    q.b === -5 &&
    q.c === 1.5 &&
    q.zip === "02134" &&
    q.exp === "1e3" &&
    q.hex === "0x10" &&
    q.inf === "Infinity" &&
    q.nan === "NaN" &&
    q.sp === " 5" &&
    q.id === "12345678901234567890" &&
    q.e === ""
  );
});

check("keys like toString / constructor / __proto__ are plain values", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("H") }] },
    "http://localhost/?toString=a&constructor=b&__proto__=c",
  );
  const q = router.searchParams();
  return q.toString === "a" && q.constructor === "b" && q["__proto__"] === "c";
});

check("push() keeps the query case but still matches the route", () => {
  const { router, window, calls } = makeRouter({
    mode: "history",
    routes: [
      { path: "/", comp: view("H") },
      { path: "/shop", comp: view("S") },
    ],
  });
  silent(() => router.listen());
  silent(() => router.push("/Shop?color=Blue"));
  return (
    window.location.pathname === "/shop" &&
    window.location.search === "?color=Blue" &&
    router.searchParams().color === "Blue" &&
    calls[calls.length - 1] === "S"
  );
});

check("hash push() with a root keeps the query untouched", () => {
  const { router, window } = makeRouter({
    root: "/app",
    routes: [
      { path: "/", comp: view("H") },
      { path: "/shop", comp: view("S") },
    ],
  });
  silent(() => router.push("/shop?next=/app/Cart"));
  return (
    window.location.hash === "#/shop?next=/app/Cart" &&
    router.searchParams().next === "/app/Cart"
  );
});

check(
  "`to` links: query counts for the no-op check, not for the active class",
  () => {
    const { router, window, document, calls } = makeRouter(
      {
        mode: "history",
        routes: [
          { path: "/", comp: view("H") },
          { path: "/shop", comp: view("S") },
        ],
      },
      "http://localhost/shop?color=red",
    );
    document.body.innerHTML =
      '<a id="red" to="/shop?color=red">r</a><a id="blue" to="/shop?color=blue">b</a>';
    window.setTimeout = (fn) => fn();
    silent(() => router.listen());
    const red = document.getElementById("red");
    const blue = document.getElementById("blue");
    const bothActive =
      /active/.test(red.className) && /active/.test(blue.className);
    const click = (el) =>
      silent(() =>
        el.dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, button: 0 }),
        ),
      );
    const before = calls.length;
    click(red);
    const sameIsNoop =
      calls.length === before && window.location.search === "?color=red";
    click(blue);
    return (
      bothActive &&
      sameIsNoop &&
      window.location.search === "?color=blue" &&
      calls.length > before
    );
  },
);

section("§9 same-route guard");

const twoRoutes = (extra) =>
  Object.assign(
    {
      routes: [
        { path: "/", comp: view("H") },
        { path: "/match", comp: view("M") },
      ],
    },
    extra,
  );

check("history push() to the current route does nothing", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
  );
  silent(() => router.listen());
  const before = { renders: calls.length, entries: window.history.length };
  silent(() => router.push("/match"));
  silent(() => router.push("/Match/"));
  return (
    calls.length === before.renders && window.history.length === before.entries
  );
});

check("history replace() to the current route does nothing", () => {
  const { router, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
  );
  silent(() => router.listen());
  const before = calls.length;
  silent(() => router.replace("/match"));
  return calls.length === before;
});

check("push() to the same path with another query still navigates", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match?page=1",
  );
  silent(() => router.listen());
  const before = calls.length;
  silent(() => router.push("/match?page=1"));
  const sameIsNoop = calls.length === before;
  silent(() => router.push("/match?page=2"));
  return (
    sameIsNoop &&
    calls.length === before + 1 &&
    window.location.search === "?page=2"
  );
});

check("an encoded query matches its plain form", () => {
  const { router, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match?q=a%20b",
  );
  silent(() => router.listen());
  const before = calls.length;
  silent(() => router.push("/match?q=a b"));
  return calls.length === before;
});

check("hash mode with a root: push() to the current route does nothing", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ root: "/app" }),
    "http://localhost/#/match",
  );
  silent(() => router.listen());
  router.freeze();
  silent(() => router.push("/match"));
  const before = calls.length;
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === before;
});

check("a frozen router stays frozen after a same-route push()", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
  );
  silent(() => router.listen());
  router.freeze();
  silent(() => router.push("/match"));
  const before = calls.length;
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === before;
});

section("§10 #fragment re-navigation");

const REHASH = "location.replace(location.hash);";
const REHASH_SRC = ROUTER_SRC.replace(
  REHASH,
  '(window.__rehash = (window.__rehash || 0) + 1, dispatchEvent(new PopStateEvent("popstate")));',
);

check("history mode: the re-navigation renders once and does not loop", () => {
  if (REHASH_SRC === ROUTER_SRC) return false;
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match#comments",
    REHASH_SRC,
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  return calls.join() === "M" && window.__rehash === 1;
});

check("history mode: no #fragment, no re-navigation", () => {
  const { router, window } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
    REHASH_SRC,
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  return window.__rehash === undefined;
});

check("hash mode never re-navigates (location.hash holds the route)", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes(),
    "http://localhost/#/match",
    REHASH_SRC,
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  return calls.join() === "M" && window.__rehash === undefined;
});

check("the real re-navigation keeps the URL and adds no history entry", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match#comments",
  );
  window.setTimeout = (fn) => fn();
  const entries = window.history.length;
  silent(() => router.listen());
  return (
    calls.join() === "M" &&
    window.location.href === "http://localhost/match#comments" &&
    window.history.length === entries
  );
});

function browserHashChange(window, url) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new window.PopStateEvent("popstate"));
}

check('a plain href="#id" change does not re-render the page', () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
    REHASH_SRC,
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  silent(() => browserHashChange(window, "/match#b"));
  silent(() => browserHashChange(window, "/match#c"));
  silent(() => browserHashChange(window, "/match"));
  return calls.join() === "M" && window.__rehash === undefined;
});

check(
  "push() to another #id on the same page keeps the page and re-navigates so it scrolls",
  () => {
    const { router, window, calls } = makeRouter(
      twoRoutes({ mode: "history" }),
      "http://localhost/match",
      REHASH_SRC,
    );
    window.setTimeout = (fn) => fn();
    silent(() => router.listen());
    silent(() => router.push("/match#comments"));
    return (
      calls.join() === "M" &&
      window.location.hash === "#comments" &&
      window.__rehash === 1
    );
  },
);

check("a new path or query still renders, #id or not", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match#a",
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  silent(() => browserHashChange(window, "/match?page=2#a"));
  silent(() => browserHashChange(window, "/#a"));
  return calls.join() === "M,M,H";
});

check("clicking the #id already in the URL does not re-render", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match#a",
    REHASH_SRC,
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  const rehashes = window.__rehash;
  silent(() => browserHashChange(window, "/match#a"));
  silent(() => browserHashChange(window, "/match#a"));
  return calls.join() === "M" && window.__rehash === rehashes;
});

check(
  "push() to the #id already in the URL scrolls again without re-rendering",
  () => {
    const { router, window, calls } = makeRouter(
      twoRoutes({ mode: "history" }),
      "http://localhost/match",
      REHASH_SRC,
    );
    window.setTimeout = (fn) => fn();
    silent(() => router.listen());
    silent(() => router.push("/match#team"));
    silent(() => router.push("/match#team"));
    return calls.join() === "M" && window.__rehash === 2;
  },
);

check("a frozen page is not marked as rendered", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  router.freeze();
  silent(() => browserHashChange(window, "/"));
  router.unfreeze();
  silent(() => browserHashChange(window, "/#x"));
  return calls.join() === "M,H";
});

section("§11 setSearchParam()");

check("searchParams() returns only the query (no function mixed in)", () => {
  const { router } = makeRouter(
    { mode: "history", routes: [{ path: "/shop", comp: view("S") }] },
    "http://localhost/shop?a=1",
  );
  const q = router.searchParams();
  return Object.keys(q).join() === "a" && !("setSearchParam" in q);
});

check(
  "history mode: sets, overwrites and deletes without a render or a history entry",
  () => {
    const { router, window, calls } = makeRouter(
      twoRoutes({ mode: "history" }),
      "http://localhost/match?keep=x",
    );
    silent(() => router.listen());
    const entries = window.history.length;
    router.setSearchParam("color", "Blue");
    const set = window.location.search === "?keep=x&color=Blue";
    router.setSearchParam("color", "red");
    const overwritten = router.searchParams().color === "red";
    router.setSearchParam("color", null);
    router.setSearchParam("keep", "");
    return (
      set &&
      overwritten &&
      window.location.href === "http://localhost/match" &&
      calls.join() === "M" &&
      window.history.length === entries
    );
  },
);

check(
  "an array becomes a repeated key that searchParams() reads back as an array",
  () => {
    const { router } = makeRouter(
      { mode: "history", routes: [{ path: "/", comp: view("H") }] },
      "http://localhost/?tag=old",
    );
    router.setSearchParam("tag", ["a", 2]);
    const t = router.searchParams().tag;
    return Array.isArray(t) && t.join() === "a,2";
  },
);

check("keeps the #id and the history state", () => {
  const { router, window } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match#comments",
  );
  window.history.replaceState({ x: 1 }, "", window.location.href);
  router.setSearchParam("page", 2);
  return (
    window.location.href === "http://localhost/match?page=2#comments" &&
    window.history.state.x === 1
  );
});

check(
  "history mode: an #id click after setSearchParam() does not re-render",
  () => {
    const { router, window, calls } = makeRouter(
      twoRoutes({ mode: "history" }),
      "http://localhost/match",
      REHASH_SRC,
    );
    window.setTimeout = (fn) => fn();
    silent(() => router.listen());
    router.setSearchParam("page", 2);
    silent(() => browserHashChange(window, "/match?page=2#b"));
    return calls.join() === "M";
  },
);

check("history mode: push() back to the old query renders again", () => {
  const { router, window, calls } = makeRouter(
    twoRoutes({ mode: "history" }),
    "http://localhost/match",
  );
  window.setTimeout = (fn) => fn();
  silent(() => router.listen());
  router.setSearchParam("page", 2);
  silent(() => router.push("/match"));
  return calls.join() === "M,M" && window.location.search === "";
});

check(
  "hash mode: writes the query inside the hash and drops a copy before it",
  () => {
    const { router, window, calls } = makeRouter(
      twoRoutes(),
      "http://localhost/?color=old&utm=mail#/match?color=blue",
    );
    silent(() => router.listen());
    router.setSearchParam("color", "red");
    const set =
      window.location.href === "http://localhost/?utm=mail#/match?color=red" &&
      router.searchParams().color === "red";
    router.setSearchParam("color", null);
    return (
      set &&
      window.location.hash === "#/match" &&
      router.searchParams().utm === "mail" &&
      router.pathname() === "/match" &&
      calls.join() === "M"
    );
  },
);

console.log("\n========================");
const summary = `${passed} passed, ${failed} failed`;
console.log((failed ? red(bold(summary)) : green(bold(summary))) + "\n");

if (failed) {
  const bySection = {};
  failedSections.forEach(({ section, name }) => {
    (bySection[section] = bySection[section] || []).push(name);
  });
  console.log(bold("Failed in:"));
  Object.keys(bySection).forEach((sec) => {
    console.log("  " + red(sec));
    bySection[sec].forEach((name) => console.log("    " + dim("• " + name)));
  });
  console.log("");
}

const EXPECTED_CHECKS = 61;
const total = passed + failed;
if (total !== EXPECTED_CHECKS) {
  console.log(
    yellow(
      `⚠ ran ${total} checks but expected ${EXPECTED_CHECKS} — did a test get dropped?`,
    ) + "\n",
  );
  process.exit(1);
}

process.exit(failed ? 1 : 0);
