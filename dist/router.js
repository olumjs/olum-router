/**
* @name olum-router
* @version 0.5.2
* @copyright 2026 
* @author Eissa Saber
* @license MIT
*/
export default (function () {
  "use strict";

  var global = window;
  var debugStr = "Router [warn]:";
  var isDebugging = false;

  function isDef(val) {
    return val !== undefined && val !== null;
  }

  function isDev() {
    return ["localhost", "127.0.0.1"].indexOf(global.location.hostname) !== -1;
  }

  function isObj(obj) {
    return obj !== null && typeof obj === "object";
  }

  function isFullArr(arr) {
    return !!(isObj(arr) && Array.isArray(arr) && arr.length);
  }

  function isFullObj(obj) {
    return !!(
      isObj(obj) &&
      Array.isArray(Object.keys(obj)) &&
      Object.keys(obj).length
    );
  }

  function addProp(obj, key, val) {
    Object.defineProperty(obj, key, {
      value: val,
      writable: true,
      configurable: true,
    });
  }
  String.prototype.cap = function () {
    return this.toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  function debug(args, level) {
    if (!isDef(level)) level = "log";
    level = level == "err" ? "error" : level;
    if (isDebugging)
      Array.isArray(args)
        ? console[level].apply(console, args)
        : console[level](args);
  }

  function Router(config) {
    if (!(this instanceof Router))
      throw new Error("can't invoke 'Router' without 'new' keyword");
    if (!config) throw new Error(debugStr + " Missing config object @Router");
    var $this = this;
    var pushStateAPI = global.history.pushState;

    var routes = [];
    var root = "/";
    var mode = "hash";
    var err = null;
    var isFrozen = false;
    var popStateEvent = null;
    var viewLoaded = null;
    mode =
      config && config.mode === "history" && pushStateAPI ? "history" : "hash";
    root = config && config.root ? config.root : "/";
    err = config && config.err ? resolve(config.err) : null;

    this.isReady = false;
    this.params = {};
    this.name = function () {
      return "Router";
    };
    this.freeze = function () {
      isFrozen = true;
    };

    this.unfreeze = function () {
      isFrozen = false;
    };

    this.pathname = function () {
      var fragment = "";
      if (mode === "history")
        fragment = clear(decodeURIComponent(location.pathname));
      else if (mode === "hash")
        fragment = clear(decodeURIComponent(location.hash));
      return "/" + fragment;
    };

    this.navigate = function (path) {
      $this.unfreeze();
      path = resolve(path);
      if (mode === "history") {
        global.history.pushState({}, "", path);
        debug("Pushed to history");
        dispatchEvent(popStateEvent);
      } else if (mode === "hash") {
        location.href = hashHref(path);
      }
    };

    this.push = function (path) {
      $this.navigate(path);
    };

    this.replace = function (path) {
      $this.unfreeze();
      path = resolve(path);
      if (mode === "history") {
        global.history.replaceState({}, "", path);
        debug("Replaced history entry");
        dispatchEvent(popStateEvent);
      } else if (mode === "hash") {
        location.replace(hashHref(path));
      }
    };

    this.back = function () {
      global.history.back();
    };

    this.forward = function () {
      global.history.forward();
    };

    this.go = function (n) {
      global.history.go(n);
    };

    this.listen = function () {
      debug($this.__proto__);
      global.addEventListener("popstate", function () {
        debug(["Dispatched Popstate", routes]);
        var current = $this.pathname();
        var _root = "/" + clear(root);

        current =
          mode === "hash" && root !== "/"
            ? (current = _root + current).replace(/\/$/, "")
            : current;

        var route;
        $this.params = {};

        for (var i = 0; i < routes.length; i++) {
          var item = routes[i];
          if (current === item.path) {
            route = item;
            break;
          } else if (
            current === "" ||
            current === "/" ||
            current.indexOf("index.html") !== -1
          ) {
            if (item.path === _root) {
              route = item;
              break;
            }
          }
        }

        if (!isDef(route)) {
          for (var x = 0; x < routes.length; x++) {
            if (routes[x].path.indexOf(":") === -1) continue;
            var params = matchRoute(routes[x].path, current);
            if (isDef(params)) {
              $this.params = params;
              route = routes[x];
              break;
            }
          }
        }
        debug(["$this.params -> ", $this.params]);

        if (isDef(route)) {
          if (!isFrozen) route.cb();
        } else {
          if (isDef(err)) {
            var _err;
            for (var index = 0; index < routes.length; index++) {
              if (routes[index].path === err) {
                _err = routes[index];
                break;
              }
            }
            if (isDef(_err)) {
              _err.cb();
            } else {
              console.error(debugStr + " Unmached path @Router");
            }
          } else {
            $this.rootElm.innerHTML = "Page Not Found!";
          }
        }

        debug({ current, route });
      });

      dispatchEvent(popStateEvent);
    };

    function clear(str) {
      var regex = new RegExp("^[#/]{1,}|/$", "g");
      str = String(str).toLowerCase().trim().replace(regex, "");
      return str;
    }

    function matchRoute(routePath, pathname) {
      var routeSegs = routePath.split("/").filter(Boolean);
      var pathSegs = pathname.split("/").filter(Boolean);
      if (routeSegs.length !== pathSegs.length) return null;
      var params = {};
      for (var i = 0; i < routeSegs.length; i++) {
        if (routeSegs[i].charAt(0) === ":") {
          params[routeSegs[i].slice(1)] = pathSegs[i];
        } else if (routeSegs[i] !== pathSegs[i]) {
          return null;
        }
      }
      return params;
    }

    function resolve(path) {
      var _root = clear(root);
      path = clear(path);
      path = root !== "/" ? "/" + _root + "/" + path : "/" + path;
      return path !== "/" ? path.replace(/\/$/g, "") : path;
    }

    function hashHref(path) {
      var base = location.href.replace(/\#.*/g, "");
      if (root === "/") return base + "#" + path;
      var _root = clear(root);
      _root = _root.replace(/\//g, "\\/");
      var rootRegex = new RegExp("\\/" + _root, "g");
      var _path = path.replace(rootRegex, "");
      _path = "/" + _path.replace(/^\//g, "");
      return base + "#" + _path;
    }

    function to() {
      var links = [].slice.call(document.querySelectorAll("[to]"));
      if (isFullArr(links)) {
        for (var i = 0; i < links.length; i++) {
          if (links[i].nodeName === "A")
            links[i].setAttribute("href", "javascript:void(0)");

          links[i].addEventListener("click", function (e) {
            var path = e.currentTarget.getAttribute("to");
            if (!isDef(path)) return;
            var _path_ = resolve(path);
            var current = $this.pathname();
            if (_path_ === current) return;
            $this.navigate(path);
          });
        }
      }
    }

    function active(path_b) {
      var links = [].slice.call(document.querySelectorAll("[to]"));
      if (isFullArr(links)) {
        for (var i = 0; i < links.length; i++) {
          var path_a = resolve(links[i].getAttribute("to"));
          if (path_a === path_b) links[i].className += " active";
          else links[i].className = links[i].className.replace(/active/g, "");
        }
      }
    }

    function mount(View) {
      if (!View || typeof View != "function") {
        throw new Error(debugStr + " Missing View argument @Router");
      } else {
        $this.render(View);
        setTimeout(() => {
          active($this.pathname());
          to();
          if (isDef(viewLoaded)) {
            dispatchEvent(viewLoaded);
            debug("viewLoaded");
          }
        }, 0);
      }
    }

    function addRoute(path, comp) {
      routes.push({
        path: resolve(path),
        cb: function () {
          mount(comp);
        },
      });
    }

    function hasRoutes() {
      if (config && config.routes && isFullArr(config.routes)) {
        for (let i = 0; i < config.routes.length; i++) {
          addRoute(config.routes[i].path, config.routes[i].comp);
        }
        return true;
      }
      return false;
    }

    if (!hasRoutes()) {
      throw new Error(debugStr + " No routes found!");
    } else {
      popStateEvent = new PopStateEvent("popstate");
      viewLoaded = new CustomEvent("viewLoaded", {
        detail: {},
        bubbles: true,
        cancelable: true,
        composed: false,
      });
      this.isReady = true;
    }

    this.extractParams = function (filePath, pathname) {
      const routeParts = filePath
        .replace(/\/page\.[^/]+$/, "")
        .split("/")
        .filter(Boolean);

      const pathParts = pathname.split("/").filter(Boolean);

      const params = {};

      let i = routeParts.length - 1;
      let j = pathParts.length - 1;

      while (i >= 0 && j >= 0) {
        const part = routeParts[i];

        if (part.startsWith("[...") && part.endsWith("]")) {
          params[part.slice(4, -1)] = pathParts.slice(0, j + 1);
          break;
        }

        if (part.startsWith("[") && part.endsWith("]")) {
          params[part.slice(1, -1)] = decodeURIComponent(pathParts[j]);
        }

        i--;
        j--;
      }

      return params;
    };
  }

  return Router;
})();
