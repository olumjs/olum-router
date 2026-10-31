export default (function () {
  "use strict";

  var global = window;
  var debugStr = "Router [warn]:";
  var isDebugging = false;

  function isDef(val) {
    return val !== undefined && val !== null;
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

    var isRehashing = false;
    var renderedPage = null;
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
        fragment = clear(decodeURIComponent(splitQuery(location.hash)[0]));
      return "/" + fragment;
    };

    this.navigate = function (path) {
      if (isCurrent(path)) return debug("Already on " + path);
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
      if (isCurrent(path)) return debug("Already on " + path);
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
      global.addEventListener("popstate", function (e) {
        if (isRehashing) return;
        debug(["Dispatched Popstate", routes]);
        var current = $this.pathname();
        var _root = "/" + clear(root);

        current =
          mode === "hash" && root !== "/"
            ? (current = _root + current).replace(/\/$/, "")
            : current;

        var page = current + location.search;
        if (mode === "history" && page === renderedPage) {
          if (e === popStateEvent) rehash();
          return;
        }

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
          if (!isFrozen) {
            renderedPage = page;
            route.cb();
          }
        } else {
          renderedPage = page;
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

    function splitQuery(str) {
      str = String(str);
      var i = str.indexOf("?");
      return i === -1 ? [str, ""] : [str.slice(0, i), str.slice(i + 1)];
    }

    function resolve(path) {
      var parts = splitQuery(path);
      var _root = clear(root);
      path = clear(parts[0]);
      path = root !== "/" ? "/" + _root + "/" + path : "/" + path;
      path = path !== "/" ? path.replace(/\/$/g, "") : path;
      return parts[1] ? path + "?" + parts[1] : path;
    }

    function isCurrent(path) {
      var target = splitQuery(resolve(path));
      var current = $this.pathname();
      if (mode === "hash" && root !== "/")
        current = ("/" + clear(root) + current).replace(/\/$/, "");

      var targetQuery = new URLSearchParams(target[1]).toString();
      var nowQuery = new URLSearchParams(currentQuery()).toString();
      return target[0] === current && targetQuery === nowQuery;
    }

    function currentQuery() {
      var query = location.search.slice(1);
      if (mode === "hash") {
        var hashQuery = splitQuery(location.hash)[1];
        if (hashQuery) query = query ? query + "&" + hashQuery : hashQuery;
      }
      return query;
    }

    function hashHref(path) {
      var base = location.href.replace(/\#.*/g, "");
      if (root === "/") return base + "#" + path;
      var parts = splitQuery(path);
      var _root = clear(root);
      _root = _root.replace(/\//g, "\\/");
      var rootRegex = new RegExp("\\/" + _root, "g");
      var _path = parts[0].replace(rootRegex, "");
      _path = "/" + _path.replace(/^\//g, "");
      return base + "#" + _path + (parts[1] ? "?" + parts[1] : "");
    }

    function to() {
      var links = [].slice.call(document.querySelectorAll("[to]"));
      if (isFullArr(links)) {
        for (var i = 0; i < links.length; i++) {
          if (links[i].nodeName === "A" && !links[i].getAttribute("href")) {
            var toAttr = links[i].getAttribute("to");
            if (isDef(toAttr)) {
              var resolved = resolve(toAttr);
              links[i].setAttribute(
                "href",
                mode === "history" ? resolved : hashHref(resolved),
              );
            }
          }
          links[i].addEventListener("click", function (e) {
            if (
              e.button !== 0 ||
              e.ctrlKey ||
              e.metaKey ||
              e.shiftKey ||
              e.altKey
            )
              return;
            var target = e.currentTarget.getAttribute("target");
            if (isDef(target) && target !== "_self") return;
            e.preventDefault();
            var path = e.currentTarget.getAttribute("to");
            if (!isDef(path)) return;
            $this.navigate(path);
          });
        }
      }
    }

    function active(path_b) {
      var links = [].slice.call(document.querySelectorAll("[to]"));
      if (isFullArr(links)) {
        for (var i = 0; i < links.length; i++) {
          var path_a = splitQuery(resolve(links[i].getAttribute("to")))[0];
          if (path_a === path_b) links[i].className += " active";
          else links[i].className = links[i].className.replace(/active/g, "");
        }
      }
    }

    function rehash() {
      if (mode !== "history" || !location.hash) return;
      isRehashing = true;
      location.replace(location.hash);
      isRehashing = false;
    }

    function mount(View) {
      if (!View || typeof View != "function") {
        throw new Error(debugStr + " Missing View argument @Router");
      } else {
        $this.render(View);
        setTimeout(() => {
          active($this.pathname());
          to();
          rehash();
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

    this.setSearchParam = function (key, value) {
      function apply(params) {
        params.delete(key);
        if (!isDef(value) || value === "") return;
        [].concat(value).forEach(function (v) {
          params.append(key, v);
        });
      }

      var url = new URL(location.href);
      if (mode === "hash") {
        var parts = splitQuery(url.hash);
        var hashParams = new URLSearchParams(parts[1]);
        apply(hashParams);
        url.searchParams.delete(key);
        var query = hashParams.toString();
        url.hash = parts[0] + (query ? "?" + query : "");
      } else {
        apply(url.searchParams);
      }

      if (url.href === location.href) return;
      global.history.replaceState(global.history.state, "", url.href);

      if (mode === "history") renderedPage = $this.pathname() + location.search;
    };

    this.searchParams = function () {
      var result = Object.create(null);

      new URLSearchParams(currentQuery()).forEach(function (value, key) {
        var num = Number(value);
        var parsed =
          value !== "" && isFinite(num) && String(num) === value ? num : value;

        result[key] = key in result ? [].concat(result[key], parsed) : parsed;
      });

      return result;
    };
  }

  return Router;
})();
