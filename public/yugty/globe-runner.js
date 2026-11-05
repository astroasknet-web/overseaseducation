/* Yugty home: runs the globe (globe.js) on #yg-globe. Plain JS. Pauses off screen and in hidden tabs; one still frame for reduced motion.
   Cycles the globe through its stages (wireframe -> living Earth) and mirrors the stage in [data-yg-stage] / [data-yg-dot]. */
(function () {
  var cv = document.getElementById("yg-globe");
  if (!cv || cv.getAttribute("data-started")) return;
  cv.setAttribute("data-started", "1");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var box = cv.parentElement, ctx = cv.getContext("2d"), W = 0, H = 0, raf = 0, visible = true, impl = null, t0 = performance.now();
  function rgba(h, a) { h = h.trim(); if (h.charAt(0) !== "#" || h.length < 7) return h; return "rgba(" + parseInt(h.slice(1, 3), 16) + "," + parseInt(h.slice(3, 5), 16) + "," + parseInt(h.slice(5, 7), 16) + "," + a + ")"; }
  function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = box.clientWidth; H = box.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  var api = { ctx: ctx, a: "#2f6bff", a2: "#14d8c4", rgba: rgba, W: function () { return W; }, H: function () { return H; }, cv: cv, reduce: reduce };
  var labels = ["Discover", "Consult", "Shortlist", "Apply", "Get admitted", "Fly"];
  var stage = 0, timer = 0;
  var label = document.querySelector("[data-yg-stage]"), dots = Array.prototype.slice.call(document.querySelectorAll("[data-yg-dot]"));
  function setStage(i, instant) {
    stage = i; if (window.VeloraGlobe) window.VeloraGlobe.setStage(Math.min(5, i), instant);
    if (label) label.textContent = labels[i];
    dots.forEach(function (d, k) { d.classList.toggle("on", k === i); d.classList.toggle("past", k < i); });
  }
  function tick() { clearTimeout(timer); if (reduce || !visible) return; timer = setTimeout(function () { setStage((stage + 1) % 6); tick(); }, stage === 5 ? 6000 : 3800); }
  dots.forEach(function (d, k) { d.addEventListener("click", function () { setStage(k); tick(); }); });
  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    if (!impl) { if (window.VeloraGlobe) { impl = window.VeloraGlobe.create(api); setStage(reduce ? 5 : 0, true); } }
    if (impl) impl((now - t0) / 1000);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); tick(); }
  new IntersectionObserver(function (es) { visible = es.some(function (e) { return e.isIntersecting; }); if (visible) start(); else { cancelAnimationFrame(raf); raf = 0; clearTimeout(timer); } }).observe(box);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
  addEventListener("resize", function () { size(); if (reduce && impl) impl(3); });
  if (reduce) { var poll = setInterval(function () { if (window.VeloraGlobe) { clearInterval(poll); impl = window.VeloraGlobe.create(api); setStage(5, true); impl(3); } }, 150); }
  else start();
})();
