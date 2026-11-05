/* Veloraglobalupdate01: the globe that comes alive. Starts as a dark, colourless wireframe and, stage by stage, fills with ocean,
   land, borders and destination countries, then lights up with routes and cities. Real geography: Natural Earth 110m via
   world-data.js (public domain). Plain JS, no dependencies. Used by division.js when present; falls back to the simple globe otherwise.
   API: VeloraGlobe.create(k) -> draw(t);  VeloraGlobe.setStage(i);  VeloraGlobe.state. */
(function () {
  var WORLD = window.VELORA_WORLD;
  if (!WORLD) return;
  var d2r = Math.PI / 180, TAU = Math.PI * 2;
  function unpack(arr) { var n = arr.length / 2, o = new Float32Array(n * 3); for (var i = 0; i < n; i++) { var lo = arr[2 * i] / 10 * d2r, la = arr[2 * i + 1] / 10 * d2r; o[3 * i] = Math.cos(la) * Math.sin(lo); o[3 * i + 1] = Math.sin(la); o[3 * i + 2] = Math.cos(la) * Math.cos(lo); } return o; }
  var LAND = WORLD.land.map(unpack), BORDERS = WORLD.borders.map(unpack), DEST = {};
  Object.keys(WORLD.dest).forEach(function (k) { DEST[k] = WORLD.dest[k].map(unpack); });
  var COLOR = { USA: "#ff8a5b", Canada: "#ffcf5b", UK: "#c08bff", Germany: "#5bd3ff", France: "#ff6fb1", Australia: "#5bffb0", UAE: "#ffd27a" };
  var ORDER = ["UK", "Germany", "USA", "Australia", "Canada", "UAE", "France"];
  var STAGE_C = [0, 0.24, 0.46, 0.68, 0.86, 1];
  var STAGE_REACH = [0, 2, 3, 5, 6, 7];
  var STAGE_VIEW = [null, [10, 48], [-95, 42], [135, -25], [55, 25], [20, 20]];

  var state = { c: 0, tc: 0, reach: 0, treach: 0, stage: 0, focus: null, view: null, userAt: -1e9 };
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) { return "rgb(" + Math.round(lerp(c1[0], c2[0], t)) + "," + Math.round(lerp(c1[1], c2[1], t)) + "," + Math.round(lerp(c1[2], c2[2], t)) + ")"; }
  function setStage(i, instant) { state.stage = i; state.tc = STAGE_C[i]; state.treach = STAGE_REACH[i]; var v = STAGE_VIEW[i]; state.view = v ? { lon: v[0], lat: v[1] } : null; if (instant) { state.c = state.tc; state.reach = state.treach; if (v) { state.pendingRot = { y: v[0] * d2r, x: Math.max(-1.1, Math.min(1.1, v[1] * d2r * 0.8)) }; } } }

  function create(k) {
    var ctx = k.ctx, cv = k.cv, dest = []; try { dest = JSON.parse(cv.getAttribute("data-dest") || "[]"); } catch (e) {}
    var origin = { name: "India", lat: 28.6, lon: 77.2 }, rot = { y: 0.95, x: 0.42 }, drag = null, auto = 0.14, last = 0;
    var seed = 3, srnd = function () { return (seed = (seed * 16807) % 2147483647) / 2147483647; }, st = [];
    for (var s = 0; s < 150; s++) st.push({ x: srnd(), y: srnd(), z: srnd() < 0.15 ? 2 : 1, p: 0.5 + srnd() * 2 });
    if (k.reduce) { state.c = 1; state.tc = 1; state.reach = 7; state.treach = 7; }

    function vec(lat, lon) { var la = lat * d2r, lo = lon * d2r; return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]; }
    function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function rotv(v) { var cy = Math.cos(rot.y), sy = Math.sin(rot.y), x1 = v[0] * cy - v[2] * sy, z1 = v[0] * sy + v[2] * cy, cx = Math.cos(rot.x), sx = Math.sin(rot.x); return [x1, v[1] * cx - z1 * sx, v[1] * sx + z1 * cx]; }
    var M = [0, 0, 0, 0, 0, 0];
    function prep() { M[0] = Math.cos(rot.y); M[1] = Math.sin(rot.y); M[2] = Math.cos(rot.x); M[3] = Math.sin(rot.x); }

    cv.addEventListener("pointerdown", function (e) { state.userAt = performance.now(); drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; rot.y += (e.clientX - drag.x) * 0.006; rot.x = Math.max(-1.1, Math.min(1.1, rot.x + (e.clientY - drag.y) * 0.004)); drag = { x: e.clientX, y: e.clientY }; if (k.reduce) draw(3); });
    ["pointerup", "pointercancel"].forEach(function (n) { cv.addEventListener(n, function () { drag = null; cv.style.cursor = ""; }); });
    Array.prototype.slice.call(document.querySelectorAll("[data-dest-chip]")).forEach(function (b) {
      var on = function () { state.focus = b.getAttribute("data-name"); state.userAt = performance.now(); if (k.reduce) draw(3); };
      var off = function () { state.userAt = performance.now(); if (b.getAttribute("aria-pressed") !== "true") { state.focus = null; if (k.reduce) draw(3); } };
      b.addEventListener("pointerenter", on); b.addEventListener("focus", on); b.addEventListener("pointerleave", off); b.addEventListener("blur", off);
      b.addEventListener("click", function () { var was = b.getAttribute("aria-pressed") === "true"; Array.prototype.slice.call(document.querySelectorAll("[data-dest-chip]")).forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); if (!was) { b.setAttribute("aria-pressed", "true"); on(); } else { state.focus = null; state.userAt = performance.now(); } });
    });

    /* a polygon ring on the sphere: back-facing points slide to the limb so the fill stays a clean cap */
    function ringPath(r, cx, cy, R) {
      var n = r.length / 3, any = false, i, x, y, z, h;
      ctx.beginPath();
      var first = true;
      for (i = 0; i < n; i++) {
        var vx = r[3 * i], vy = r[3 * i + 1], vz = r[3 * i + 2];
        var x1 = vx * M[0] - vz * M[1], z1 = vx * M[1] + vz * M[0];
        y = vy * M[2] - z1 * M[3]; z = vy * M[3] + z1 * M[2]; x = x1;
        if (z >= 0) any = true; else { h = Math.hypot(x, y) || 1; x /= h; y /= h; }
        var px = cx + x * R, py = cy - y * R;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.closePath();
      return any;
    }
    function lineFront(r, cx, cy, R) {
      var n = r.length / 3, pen = false;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var vx = r[3 * i], vy = r[3 * i + 1], vz = r[3 * i + 2], x1 = vx * M[0] - vz * M[1], z1 = vx * M[1] + vz * M[0], y = vy * M[2] - z1 * M[3], z = vy * M[3] + z1 * M[2];
        if (z > 0) { var px = cx + x1 * R, py = cy - y * R; pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py); pen = true; } else pen = false;
      }
      ctx.stroke();
    }

    function draw(t) {
      var W = k.W(), H = k.H(), cx = W / 2, cy = H * 0.43, R = Math.min(W * 0.45, H * 0.37), dt = Math.min(0.05, Math.max(0, t - last));
      ctx.clearRect(0, 0, W, H);
      state.c += (state.tc - state.c) * (k.reduce ? 1 : 1 - Math.pow(0.18, dt));
      state.reach += (state.treach - state.reach) * (k.reduce ? 1 : 1 - Math.pow(0.4, dt));
      var c = state.c, c2 = Math.max(0, (c - 0.12) / 0.88);

      /* where the globe is looking */
      var fd = state.focus ? dest.filter(function (d) { return d.name === state.focus; })[0] : null;
      var idleUser = performance.now() - state.userAt > 5000;
      var tgt = fd ? { lon: fd.lon, lat: fd.lat } : (state.view && idleUser ? state.view : null);
      if (tgt && !drag) { var tY = tgt.lon * d2r, dY = Math.atan2(Math.sin(tY - rot.y), Math.cos(tY - rot.y)); rot.y += dY * (k.reduce ? 1 : 0.045); rot.x += (Math.max(-1.1, Math.min(1.1, tgt.lat * d2r * 0.8)) - rot.x) * (k.reduce ? 1 : 0.045); }
      else if (!drag && !k.reduce) rot.y += dt * auto;
      last = t; if (state.pendingRot) { rot.y = state.pendingRot.y; rot.x = state.pendingRot.x; state.pendingRot = null; } prep();

      /* stars */
      st.forEach(function (q, i) { ctx.fillStyle = "rgba(210,230,255," + (0.1 + 0.3 * (0.5 + 0.5 * Math.sin(t * q.p + i))) + ")"; ctx.fillRect(q.x * W, q.y * H, q.z, q.z); });

      /* atmosphere: teal at first, sky blue once the world is alive */
      var ar = lerp(31, 110, c), ag = lerp(209, 190, c), ab = lerp(192, 255, c);
      var atm = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.24); atm.addColorStop(0, "rgba(" + Math.round(ar) + "," + Math.round(ag) + "," + Math.round(ab) + "," + (0.34 + 0.2 * c) + ")"); atm.addColorStop(0.4, "rgba(" + Math.round(ar) + "," + Math.round(ag) + "," + Math.round(ab) + ",0.1)"); atm.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.24, 0, TAU); ctx.fill();

      /* ocean: near-black at first, then deep to bright blue */
      var oc = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.02);
      oc.addColorStop(0, mix([14, 24, 44], [34, 118, 214], c)); oc.addColorStop(0.55, mix([8, 14, 30], [16, 84, 170], c)); oc.addColorStop(1, mix([4, 8, 18], [8, 46, 112], c));
      ctx.fillStyle = oc; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

      /* graticule, strong at first and fading as real geography takes over */
      ctx.lineWidth = 1; var ga = 0.2 * (1 - c * 0.7), la, lo, pen, pv, q;
      for (la = -60; la <= 60; la += 30) { ctx.strokeStyle = k.rgba(k.a2, ga); ctx.beginPath(); pen = false; for (lo = 0; lo <= 360; lo += 6) { pv = rotv(vec(la, lo)); if (pv[2] > 0) { var gx = cx + pv[0] * R, gy = cy - pv[1] * R; pen ? ctx.lineTo(gx, gy) : ctx.moveTo(gx, gy); pen = true; } else pen = false; } ctx.stroke(); }
      for (lo = 0; lo < 360; lo += 30) { ctx.strokeStyle = k.rgba(k.a2, ga); ctx.beginPath(); pen = false; for (la = -90; la <= 90; la += 6) { pv = rotv(vec(la, lo)); if (pv[2] > 0) { var hx = cx + pv[0] * R, hy = cy - pv[1] * R; pen ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy); pen = true; } else pen = false; } ctx.stroke(); }

      /* land: a faint outline first, then green and tan with polar white */
      if (c > 0.03) {
        var lg = ctx.createLinearGradient(cx, cy - R, cx, cy + R); lg.addColorStop(0, "#dcebe6"); lg.addColorStop(0.2, "#5fae78"); lg.addColorStop(0.5, "#3e9a5a"); lg.addColorStop(0.74, "#bda968"); lg.addColorStop(1, "#eef6f4");
        ctx.fillStyle = lg; ctx.strokeStyle = "rgba(235,255,245," + (0.15 + 0.4 * c) + ")"; ctx.lineWidth = 0.8;
        var fa = Math.min(1, c2 * 1.4);
        for (q = 0; q < LAND.length; q++) { if (ringPath(LAND[q], cx, cy, R)) { ctx.globalAlpha = 0.04 + 0.96 * fa * fa; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); } }
      }
      /* country borders */
      if (c > 0.35) { ctx.strokeStyle = "rgba(255,255,255," + (0.42 * c2 * c2) + ")"; ctx.lineWidth = 0.7; for (q = 0; q < BORDERS.length; q++) lineFront(BORDERS[q], cx, cy, R); }

      /* destination countries appear one by one, each in its own colour */
      var appeared = {}, names = ORDER;
      for (q = 0; q < names.length; q++) {
        var nm = names[q], a = Math.max(0, Math.min(1, state.reach - q)), isF = state.focus === nm;
        if (a < 0.02 && !isF) continue; appeared[nm] = a;
        var rings = DEST[nm]; if (!rings) continue;
        ctx.fillStyle = COLOR[nm]; ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.5 * a) + ")"; ctx.lineWidth = isF ? 2.4 : 1.3; ctx.shadowColor = COLOR[nm]; ctx.shadowBlur = isF ? 26 : 12 * a;
        for (var r = 0; r < rings.length; r++) { if (ringPath(rings[r], cx, cy, R)) { ctx.globalAlpha = (isF ? 0.95 : 0.68) * Math.max(a, isF ? 0.7 : 0); ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); } }
        ctx.shadowBlur = 0;
      }
      if (DEST.India && c > 0.3) { ctx.fillStyle = "#ffb02e"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.shadowColor = "#ffb02e"; ctx.shadowBlur = 14; DEST.India.forEach(function (rg) { if (ringPath(rg, cx, cy, R)) { ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); } }); ctx.shadowBlur = 0; }

      /* sunlight and limb darkening, stronger as the world comes alive */
      var sh = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.32, R * 0.18, cx, cy, R * 1.02);
      sh.addColorStop(0, "rgba(255,255,255," + 0.14 * c + ")"); sh.addColorStop(0.55, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,6,28," + (0.45 + 0.3 * c) + ")");
      ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
      ctx.strokeStyle = k.rgba(k.a2, 0.4 + 0.3 * c); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

      /* routes from India, labels, city lights */
      var o = vec(origin.lat, origin.lon), ov = rotv(o), fs = Math.max(11, R * 0.058);
      dest.forEach(function (d, i) {
        var a = appeared[d.name]; var isF = state.focus === d.name; if (!a && !isF) return; a = a || 1;
        var dv = vec(d.lat, d.lon), dot = Math.max(-1, Math.min(1, o[0] * dv[0] + o[1] * dv[1] + o[2] * dv[2])), om = Math.acos(dot), N = 48, path = [];
        for (var s2 = 0; s2 <= N; s2++) { var f = s2 / N, A = Math.sin((1 - f) * om) / Math.sin(om || 1), B = Math.sin(f * om) / Math.sin(om || 1), p = norm([A * o[0] + B * dv[0], A * o[1] + B * dv[1], A * o[2] + B * dv[2]]), lift = 1 + Math.sin(Math.PI * f) * 0.22 * (om / 1.6); path.push(rotv([p[0] * lift, p[1] * lift, p[2] * lift])); }
        ctx.strokeStyle = k.rgba("#ffffff", (isF ? 1 : 0.55) * a); ctx.lineWidth = isF ? 3.2 : 1.5; ctx.shadowColor = COLOR[d.name] || k.a; ctx.shadowBlur = isF ? 18 : 6; ctx.beginPath(); var pn = false;
        path.forEach(function (qq) { if (qq[2] > -0.05) { var x = cx + qq[0] * R, y = cy - qq[1] * R; pn ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pn = true; } else pn = false; }); ctx.stroke(); ctx.shadowBlur = 0;
        var u = k.reduce ? 0.5 : (t * 0.22 + i * 0.14) % 1;
        for (var tj = 0; tj < 8; tj++) { var qt = path[Math.max(0, Math.floor(u * N) - tj)]; if (qt && qt[2] > 0) { ctx.fillStyle = k.rgba("#ffffff", (1 - tj / 8) * 0.9 * a); ctx.beginPath(); ctx.arc(cx + qt[0] * R, cy - qt[1] * R, 2.8 * (1 - tj / 11), 0, TAU); ctx.fill(); } }
        var pv2 = rotv(dv);
        if (pv2[2] > 0.05) {
          var px = cx + pv2[0] * R, py = cy - pv2[1] * R, pulse = k.reduce ? 0.4 : (t * 0.6 + i * 0.17) % 1;
          if (state.stage >= 4 || isF) { ctx.strokeStyle = k.rgba("#ffffff", (1 - pulse) * 0.8); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 4 + pulse * 16, 0, TAU); ctx.stroke(); }
          ctx.fillStyle = "#fff"; ctx.shadowColor = COLOR[d.name] || "#fff"; ctx.shadowBlur = state.stage >= 4 ? 16 : 6; ctx.beginPath(); ctx.arc(px, py, state.stage >= 4 ? 4.5 : 3.5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
          ctx.font = (isF ? "700 " : "600 ") + (isF ? fs * 1.3 : fs) + "px system-ui, sans-serif"; ctx.fillStyle = "#fff";
          var side = px > cx ? 1 : -1, dy = 4; if (d.name === "UK") { side = -1; dy = -4; } else if (d.name === "Germany") { side = 1; dy = -6; } else if (d.name === "France") { side = -1; dy = 18; }
          ctx.textAlign = side > 0 ? "left" : "right"; ctx.fillText(d.name, px + side * 9, py + dy);
        }
      });
      if (ov[2] > 0 && c > 0.02) { var ox = cx + ov[0] * R, oy = cy - ov[1] * R; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox, oy, 7 + Math.sin(t * 3) * 1.5, 0, TAU); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, TAU); ctx.fill(); ctx.font = "700 " + fs + "px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillText("India", ox + 12, oy - 8); }
    }
    return draw;
  }
  window.VeloraGlobe = { create: create, setStage: setStage, state: state };
})();
