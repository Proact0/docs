(function () {
  var koPrefix = "/ko";
  var defaultHome = "/";

  function homeForPath(pathname) {
    if (pathname === koPrefix || pathname.indexOf(koPrefix + "/") === 0) {
      return koPrefix;
    }
    return defaultHome;
  }

  function logoSelectors(anchorOnly) {
    if (anchorOnly) {
      return [
        "a[data-testid=\"nav-logo\"]",
        "a.nav-logo",
        "a#nav-logo",
        "a[aria-label=\"Home\"]",
        "a[aria-label=\"Homepage\"]"
      ];
    }
    return [
      "[data-testid=\"nav-logo\"]",
      ".nav-logo",
      "#nav-logo",
      "[aria-label=\"Home\"]",
      "[aria-label=\"Homepage\"]"
    ];
  }

  function findLogoLink(root) {
    var selectors = logoSelectors(true);

    var scope = root || document;
    if (scope instanceof Element) {
      for (var j = 0; j < selectors.length; j += 1) {
        var closest = scope.closest(selectors[j]);
        if (closest) {
          return closest;
        }
      }
    }
    for (var i = 0; i < selectors.length; i += 1) {
      var el = scope.querySelector(selectors[i]);
      if (!el) {
        continue;
      }
      if (el.tagName === "A") {
        return el;
      }
      var link = el.closest("a");
      if (link) {
        return link;
      }
    }

    var imgLogo = scope.querySelector("img[alt*=\"logo\" i]");
    if (imgLogo) {
      return imgLogo.closest("a");
    }

    return null;
  }

  function isLogoTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    var selectors = logoSelectors(false);
    for (var i = 0; i < selectors.length; i += 1) {
      if (target.closest(selectors[i])) {
        return true;
      }
    }
    return false;
  }

  function updateLogoHref() {
    var link = findLogoLink();
    if (!link) {
      return;
    }
    var target = homeForPath(window.location.pathname);
    if (link.getAttribute("href") !== target) {
      link.setAttribute("href", target);
    }
  }

  function scheduleUpdate() {
    updateLogoHref();
    window.setTimeout(updateLogoHref, 50);
    window.setTimeout(updateLogoHref, 250);
  }

  function wireLocationChange() {
    var notify = function () {
      window.dispatchEvent(new Event("locationchange"));
    };

    var pushState = history.pushState;
    history.pushState = function () {
      var result = pushState.apply(this, arguments);
      notify();
      return result;
    };

    var replaceState = history.replaceState;
    history.replaceState = function () {
      var result = replaceState.apply(this, arguments);
      notify();
      return result;
    };

    window.addEventListener("popstate", notify);
  }

  function wireLogoClick() {
    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (!target || typeof target.closest !== "function") {
          return;
        }
        if (!isLogoTarget(target)) {
          return;
        }
        var destination = homeForPath(window.location.pathname);
        event.preventDefault();
        event.stopPropagation();
        window.location.assign(destination);
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleUpdate);
  } else {
    scheduleUpdate();
  }

  wireLocationChange();
  wireLogoClick();
  window.addEventListener("locationchange", scheduleUpdate);

  var observer = new MutationObserver(function () {
    updateLogoHref();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
