/* Native scroll drives three scenes; no wheel interception or scroll locking. */
(function () {
  "use strict";
  var section = document.getElementById("services-sequence");
  if (!section) return;
  var panels = Array.from(section.querySelectorAll(".x-blk"));
  var labels = Array.from(section.querySelectorAll(".x-services-progress span"));
  var pin = section.querySelector(".x-services-pin");
  var query = window.matchMedia("(min-width: 1100px) and (min-height: 780px) and (prefers-reduced-motion: no-preference)");
  var enabled = false, frame = 0, current = -1;
  function show(index) {
    if (index === current) return;
    current = index;
    panels.forEach(function (panel, i) {
      var active = i === index;
      panel.classList.toggle("is-current", active);
      panel.inert = !active;
      panel.setAttribute("aria-hidden", String(!active));
      labels[i].classList.toggle("is-current", active);
    });
    var bounds = section.getBoundingClientRect();
    if (bounds.top <= 100 + pin.offsetHeight && bounds.top + section.offsetHeight > 100) {
      document.querySelectorAll(".x-nav__link[data-sec]").forEach(function (link) {
        link.classList.toggle("is-active", link.dataset.sec === panels[index].id);
      });
    }
  }
  function update() {
    frame = 0;
    if (!enabled) return;
    // Do not remove a keyboard-focused disclosure while somebody is reading it.
    if (panels.some(function (p) { return p.contains(document.activeElement); })) return;
    var travel = Math.max(1, section.offsetHeight - pin.offsetHeight);
    var progress = Math.max(0, Math.min(1, (100 - section.getBoundingClientRect().top) / travel));
    show(Math.min(panels.length - 1, Math.floor(progress * panels.length)));
  }
  function schedule() {
    if (enabled && !frame) frame = window.requestAnimationFrame(update);
  }
  function configure() {
    enabled = query.matches;
    section.classList.toggle("is-pinned", enabled);
    current = -1;
    if (enabled) update();
    else panels.forEach(function (p) {
      p.inert = false;
      p.removeAttribute("aria-hidden");
      p.classList.remove("is-current");
    });
  }
  function navigate(id) {
    if (!enabled || document.documentElement.classList.contains("x-routed")) return false;
    var index = panels.findIndex(function (p) { return p.id === id; });
    if (index < 0) return false;
    var travel = Math.max(1, section.offsetHeight - pin.offsetHeight);
    var top = window.scrollY + section.getBoundingClientRect().top - 100;
    // Land in the middle of a scene to avoid floating-point threshold flicker.
    var destination = top + travel * ((index + 0.5) / panels.length);
    if (window.xLenis) {
      window.xLenis.resize();
      window.xLenis.scrollTo(destination, { immediate: true, force: true });
    } else window.scrollTo({ top: destination, behavior: "auto" });
    show(index);
    return true;
  }
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest("a[href]");
    if (!link || !enabled || document.documentElement.classList.contains("x-routed")) return;
    var href = link.getAttribute("href");
    if (!/^#(story|film|amplify)$/.test(href)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.history.pushState(null, "", href);
    navigate(href.slice(1));
  }, true);
  // The existing router calls this after returning from a film/journal route.
  var previousGlide = window.xGlideTo;
  window.xGlideTo = function (id) {
    if (navigate(id.slice(1))) {
      window.history.replaceState(null, "", id);
      return true;
    }
    return previousGlide ? previousGlide(id) : false;
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("hashchange", function () { navigate(window.location.hash.slice(1)); });
  section.addEventListener("focusout", schedule);
  if (query.addEventListener) query.addEventListener("change", configure);
  configure();
  if (/^#(story|film|amplify)$/.test(window.location.hash)) navigate(window.location.hash.slice(1));
})();
