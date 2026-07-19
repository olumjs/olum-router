// ============================================================================
// OlumJS router test suite — the third suite alongside compiler.test.js
// (compiler) and olum.test.js (core runtime). Covers core/router.js: the
// hash/history router the Olum runtime mounts via useRouter().
//
// router.js is `export default (function(){...})()` returning the Router
// constructor, and it reaches for BARE globals (`location`, `history`,
// `dispatchEvent`, `PopStateEvent`) rather than `window.`-prefixed ones. So —
// unlike olum.test.js's `new Function` loader — we eval the source *inside* a
// jsdom window (runScripts: "outside-only"), which gives those bare references
// the right binding. Each load() gets a fresh window (fresh location/history)
// so navigation in one test can't leak into another.
//
// Run:  node tests/router.test.js   (or: npm run test:router)
// ============================================================================

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

let passed = 0;
let failed = 0;

// ── Output styling (shared look with the other two suites) ────────────────────
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

// ── Loader ────────────────────────────────────────────────────────────────────
// Evaluate router.js inside a fresh jsdom window. `url` seeds location so a test
// can start "already on" a given route. Returns the window plus the Router ctor
// and an extractParams helper (an instance method on Router, so it's reached
// through a throwaway instance).
const ROUTER_SRC = fs.readFileSync(path.join(__dirname, "../src/router.js"), "utf8");
function load(url) {
  const dom = new JSDOM("<!doctype html><body></body>", { url: url || "http://localhost/", runScripts: "outside-only" });
  dom.window.eval(ROUTER_SRC.replace(/^\s*export\s+default\s+/m, "window.__Router = "));
  const Router = dom.window.__Router;
  const extractParams = (fp, pn) => new Router({ routes: [{ path: "/", comp: () => {} }] }).extractParams(fp, pn);
  return { window: dom.window, document: dom.window.document, Router: Router, extractParams: extractParams };
}

// router.js has a stray `console.log({current})` inside its popstate handler (and
// may console.error on a misconfigured err route). Silence console noise around
// the router calls that fire that handler so the suite output stays readable —
// without hiding it globally (a genuinely unexpected log elsewhere still shows).
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

// ── Section / check plumbing (mirrors the other suites) ───────────────────────
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

// A minimal "view" — mount() rejects anything that isn't a function, so route
// components must be callable. Named so a render spy can identify which fired.
const view = (tag) => {
  const f = () => tag;
  f.tag = tag;
  return f;
};

// Build a ready-to-listen router with a render spy. `calls` collects the tag of
// every view render() receives, in order — the observable output of routing.
function makeRouter(config, url) {
  const env = load(url);
  const calls = [];
  const router = new env.Router(config);
  router.render = (View) => calls.push(View.tag);
  router.rootElm = env.document.createElement("div");
  return { ...env, router, calls };
}

console.log("\n" + bold("🧪 OlumJS router fixtures") + "\n========================");

// ── §1 extractParams() (file-based route params) ──────────────────────────────
section("§1 extractParams()");

check("[slug] captures a single dynamic segment", () => {
  const { extractParams } = load();
  const p = extractParams("/blog/[slug]/page.html", "/blog/hello");
  return p.slug === "hello";
});

check("multiple [params] are all captured", () => {
  const { extractParams } = load();
  const p = extractParams("/users/[id]/posts/[postId]/page.html", "/users/5/posts/10");
  return p.id === "5" && p.postId === "10";
});

check("the value is URI-decoded", () => {
  const { extractParams } = load();
  return extractParams("/q/[term]/page.html", "/q/hello%20world").term === "hello world";
});

check("a static route yields no params", () => {
  const { extractParams } = load();
  return Object.keys(extractParams("/about/page.html", "/about")).length === 0;
});

check("[...rest] catch-all returns an array (current behavior: from path start)", () => {
  const { extractParams } = load();
  // NOTE: pins the router's CURRENT behavior — the catch-all slices from index 0,
  // so it includes the static prefix ("docs"), not just the matched tail.
  const p = extractParams("/docs/[...path]/page.html", "/docs/a/b/c");
  return Array.isArray(p.path) && p.path.join("/") === "docs/a/b/c";
});

check("extractParams is exposed on the router instance", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: () => {} }] });
  return typeof r.extractParams === "function";
});

// ── §2 String.prototype.cap ───────────────────────────────────────────────────
// The module augments String.prototype (inside the jsdom realm), so exercise it
// through window.eval rather than node's own String.
section("§2 String.prototype.cap");

check("capitalizes the first letter of each word", () => {
  const { window } = load();
  return window.eval('"hello world".cap()') === "Hello World";
});

check("is installed on the realm's String.prototype", () => {
  const { window } = load();
  return typeof window.String.prototype.cap === "function";
});

// ── §3 construction & guards ──────────────────────────────────────────────────
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

check("name() identifies it as a Router (runtime uses this to detect routers)", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: view("H") }] });
  return r.name() === "Router";
});

check("params starts as an empty object", () => {
  const { Router } = load();
  const r = new Router({ routes: [{ path: "/", comp: view("H") }] });
  return r.params && typeof r.params === "object" && Object.keys(r.params).length === 0;
});

// ── §4 pathname() normalization ───────────────────────────────────────────────
section("§4 pathname()");

check("hash mode reads the fragment from location.hash", () => {
  const { router } = makeRouter({ routes: [{ path: "/foo", comp: view("F") }] }, "http://localhost/#/foo");
  return router.pathname() === "/foo";
});

check("a trailing slash is normalized away", () => {
  const { router } = makeRouter({ routes: [{ path: "/foo", comp: view("F") }] }, "http://localhost/#/foo/");
  return router.pathname() === "/foo";
});

check("history mode reads the fragment from location.pathname", () => {
  const { router } = makeRouter({ mode: "history", routes: [{ path: "/foo", comp: view("F") }] }, "http://localhost/foo");
  return router.pathname() === "/foo";
});

// ── §5 navigation ─────────────────────────────────────────────────────────────
section("§5 navigation");

check("hash navigate() updates location.hash", () => {
  const { router, window } = makeRouter({ routes: [{ path: "/", comp: view("H") }, { path: "/about", comp: view("A") }] });
  silent(() => router.navigate("/about"));
  return window.location.hash === "#/about" && router.pathname() === "/about";
});

check("history navigate() pushes to the history stack", () => {
  const { router, window } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("H") }, { path: "/about", comp: view("A") }] }
  );
  silent(() => router.navigate("/about"));
  return window.location.pathname === "/about" && router.pathname() === "/about";
});

check("push() navigates like navigate()", () => {
  const { router, window } = makeRouter({ routes: [{ path: "/", comp: view("H") }, { path: "/about", comp: view("A") }] });
  silent(() => router.push("/about"));
  return window.location.hash === "#/about" && router.pathname() === "/about";
});

check("replace() overwrites the current entry instead of adding one", () => {
  const { router, window } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("H") }, { path: "/about", comp: view("A") }] }
  );
  const before = window.history.length;
  silent(() => router.replace("/about"));
  return window.location.pathname === "/about" && window.history.length === before;
});

check("back()/forward()/go() delegate to window.history", () => {
  // jsdom's history traversal is async, so assert delegation rather than URL
  // motion: swap window.history methods for spies and confirm each is hit.
  const { router, window } = makeRouter({ routes: [{ path: "/", comp: view("H") }] });
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

// ── §6 freeze / unfreeze ──────────────────────────────────────────────────────
section("§6 freeze / unfreeze");

check("freeze() suppresses route callbacks on popstate", () => {
  // history mode so a raw popstate re-runs matching; navigate() would auto-unfreeze.
  const { router, window, calls } = makeRouter({ mode: "history", routes: [{ path: "/", comp: view("H") }] });
  silent(() => router.listen()); // initial match → 1 render
  const before = calls.length;
  router.freeze();
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === before; // frozen: no additional render
});

check("unfreeze() restores route callbacks", () => {
  const { router, window, calls } = makeRouter({ mode: "history", routes: [{ path: "/", comp: view("H") }] });
  silent(() => router.listen());
  router.freeze();
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  const frozen = calls.length;
  router.unfreeze();
  silent(() => window.dispatchEvent(new window.PopStateEvent("popstate")));
  return calls.length === frozen + 1;
});

// ── §7 route matching ─────────────────────────────────────────────────────────
section("§7 route matching");

check("listen() renders the view for the current route", () => {
  const { router, calls } = makeRouter(
    { routes: [{ path: "/", comp: view("Home") }, { path: "/about", comp: view("About") }] },
    "http://localhost/#/about"
  );
  silent(() => router.listen());
  return calls[calls.length - 1] === "About";
});

check("navigating renders the destination view (history mode)", () => {
  const { router, calls } = makeRouter(
    { mode: "history", routes: [{ path: "/", comp: view("Home") }, { path: "/about", comp: view("About") }] }
  );
  silent(() => router.listen()); // Home
  silent(() => router.navigate("/about")); // About
  return calls.join(",") === "Home,About";
});

check("an unmatched route with no err handler shows Page Not Found", () => {
  const { router } = makeRouter({ routes: [{ path: "/", comp: view("Home") }] }, "http://localhost/#/missing");
  silent(() => router.listen());
  return router.rootElm.innerHTML === "Page Not Found!";
});

check("an unmatched route falls back to the configured err route", () => {
  const { router, calls } = makeRouter(
    { err: "/404", routes: [{ path: "/", comp: view("Home") }, { path: "/404", comp: view("NotFound") }] },
    "http://localhost/#/missing"
  );
  silent(() => router.listen());
  return calls[calls.length - 1] === "NotFound";
});

// ── Summary (mirrors the other suites) ────────────────────────────────────────
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

// Guard against a whole section silently disappearing. Bump when you add/remove tests.
const EXPECTED_CHECKS = 28;
const total = passed + failed;
if (total !== EXPECTED_CHECKS) {
  console.log(yellow(`⚠ ran ${total} checks but expected ${EXPECTED_CHECKS} — did a test get dropped?`) + "\n");
  process.exit(1);
}

process.exit(failed ? 1 : 0);
