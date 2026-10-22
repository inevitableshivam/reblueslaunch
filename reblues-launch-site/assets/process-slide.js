/* Four cards travel through one sticky frame. The frame releases as card four reaches the top. */
(function () {
  var section = document.getElementById('process');
  if (!section || !window.matchMedia) return;
  var scene = section.querySelector('.x-process__scene');
  var stack = section.querySelector('.x-process__stack');
  var cards = Array.prototype.slice.call(stack.querySelectorAll('.x-process__step'));
  var query = window.matchMedia('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
  var queued = false;

  function update() {
    queued = false;
    if (!query.matches || !scene.getClientRects().length) return;
    var travel = scene.offsetHeight - stack.offsetHeight;
    if (travel <= 0) return;
    var step = travel / (cards.length - 1);
    var top = parseFloat(window.getComputedStyle(stack).top) || 0;
    var progress = Math.max(0, Math.min(travel, top - scene.getBoundingClientRect().top));
    var scale = window.devicePixelRatio || 1;
    cards.forEach(function (card, index) {
      var slide = Math.max(0, index * step - progress);
      card.style.setProperty('--process-slide', (Math.round(slide * scale) / scale) + 'px');
    });
  }

  function queueUpdate() {
    if (queued || !query.matches) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  function setMode() {
    section.classList.toggle('is-motion', query.matches);
    if (query.matches) update();
    else cards.forEach(function (card) { card.style.removeProperty('--process-slide'); });
  }

  if (query.addEventListener) query.addEventListener('change', setMode);
  else query.addListener(setMode);
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate, { passive: true });
  window.addEventListener('pageshow', queueUpdate);
  window.addEventListener('load', queueUpdate, { once: true });
  setMode();
})();
