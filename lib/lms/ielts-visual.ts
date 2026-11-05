/* eslint-disable */
// @ts-nocheck
// Ported from Vidaara (lib/ielts-writing-visual.js): renders an IELTS Writing Task 1 visual to inline SVG / HTML from JSON.

/**
 * lib/ielts-writing-visual.js — renders an IELTS Writing Task 1 visual to HTML
 * (inline SVG + an accessible data table) from structured JSON. No client JS.
 *
 * Visual shapes by format:
 *  line-graph / bar-chart : { title, yLabel, unit, categories:[x labels], series:[{name, values:[numbers]}] }
 *  pie-chart              : { title, unit:"%", charts:[{ title, slices:[{label, value}] }] }   (1–2 pies)
 *  table                  : { title, unit, columns:[...], rows:[[...], ...] }
 *  process                : { title, stages:[{ n, name, description }] }
 *  map                    : { title, periods:[{ label, items:[{ name, x, y, w, h, kind }] }] }  (100x100 grid; kind: building|green|water|road|other)
 *  combination            : { charts:[ { format:'bar-chart', ... }, { format:'line-graph', ... } ] }
 */

const PALETTE = ['#0d9488', '#7c3aed', '#ea580c', '#2563eb', '#db2777', '#ca8a04', '#059669', '#6b7280'];
const MAP_FILL = { building: '#c7d2fe', green: '#bbf7d0', water: '#bae6fd', road: '#e5e7eb', other: '#fde68a' };
const MAP_STROKE = { building: '#4338ca', green: '#15803d', water: '#0369a1', road: '#6b7280', other: '#b45309' };

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fmt(n) { return (typeof n === 'number' && isFinite(n)) ? (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10)) : esc(n); }

function niceMax(max) {
  if (max <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  const m = max / p;
  const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return step * p;
}

function dataTable(v, columns, rows, caption) {
  let h = '<div class="iwv-tablewrap"><table class="iwv-table">';
  if (caption) h += '<caption>' + esc(caption) + '</caption>';
  h += '<thead><tr>' + columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
  rows.forEach(function (r) { h += '<tr>' + r.map(function (c, i) { return (i === 0 ? '<th scope="row">' : '<td>') + (i === 0 ? esc(c) : fmt(c)) + (i === 0 ? '</th>' : '</td>'); }).join('') + '</tr>'; });
  return h + '</tbody></table></div>';
}

// ── Line / bar ────────────────────────────────────────────────────────────────
function xyChart(v, kind) {
  const cats = v.categories || [];
  const series = v.series || [];
  const allVals = series.reduce(function (a, s) { return a.concat(s.values || []); }, []).filter(function (n) { return typeof n === 'number'; });
  const yMax = niceMax(Math.max.apply(null, allVals.concat([1])) * 1.05);
  const W = 720, H = 360, L = 64, R = 24, T = 28, B = 64;
  const pw = W - L - R, ph = H - T - B;
  const ticks = 5;
  let s = '<svg class="iwv-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(v.title || '') + '">';
  // grid + y axis
  for (let i = 0; i <= ticks; i++) {
    const y = T + ph - (ph * i / ticks);
    const val = yMax * i / ticks;
    s += '<line x1="' + L + '" y1="' + y + '" x2="' + (L + pw) + '" y2="' + y + '" stroke="#e5e7eb"/>';
    s += '<text x="' + (L - 8) + '" y="' + (y + 4) + '" font-size="11" text-anchor="end" fill="#374151">' + fmt(val) + '</text>';
  }
  if (v.yLabel) s += '<text x="14" y="' + (T + ph / 2) + '" font-size="11" fill="#374151" transform="rotate(-90 14 ' + (T + ph / 2) + ')" text-anchor="middle">' + esc(v.yLabel + (v.unit ? ' (' + v.unit + ')' : '')) + '</text>';
  const n = cats.length;
  const slot = n ? pw / n : pw;
  // x labels
  cats.forEach(function (c, i) {
    const x = L + slot * i + slot / 2;
    s += '<text x="' + x + '" y="' + (T + ph + 18) + '" font-size="11" text-anchor="middle" fill="#374151">' + esc(c) + '</text>';
  });
  s += '<line x1="' + L + '" y1="' + (T + ph) + '" x2="' + (L + pw) + '" y2="' + (T + ph) + '" stroke="#6b7280"/>';
  if (kind === 'bar') {
    const gw = slot * 0.72, bw = series.length ? gw / series.length : gw;
    series.forEach(function (sr, si) {
      (sr.values || []).forEach(function (val, i) {
        if (typeof val !== 'number') return;
        const x = L + slot * i + (slot - gw) / 2 + bw * si;
        const h = ph * val / yMax;
        s += '<rect x="' + x + '" y="' + (T + ph - h) + '" width="' + (bw - 2) + '" height="' + h + '" fill="' + PALETTE[si % PALETTE.length] + '"><title>' + esc(sr.name) + ' — ' + esc(cats[i]) + ': ' + fmt(val) + '</title></rect>';
      });
    });
  } else {
    series.forEach(function (sr, si) {
      const pts = (sr.values || []).map(function (val, i) {
        if (typeof val !== 'number') return null;
        return [L + slot * i + slot / 2, T + ph - ph * val / yMax];
      }).filter(Boolean);
      s += '<polyline fill="none" stroke="' + PALETTE[si % PALETTE.length] + '" stroke-width="2.5" points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
      pts.forEach(function (p, i) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="' + PALETTE[si % PALETTE.length] + '"><title>' + esc(sr.name) + ' — ' + esc(cats[i]) + ': ' + fmt(sr.values[i]) + '</title></circle>'; });
    });
  }
  // legend
  let lx = L;
  series.forEach(function (sr, si) {
    s += '<rect x="' + lx + '" y="' + (H - 18) + '" width="12" height="12" fill="' + PALETTE[si % PALETTE.length] + '"/>';
    s += '<text x="' + (lx + 16) + '" y="' + (H - 8) + '" font-size="11" fill="#374151">' + esc(sr.name) + '</text>';
    lx += 16 + String(sr.name).length * 6.5 + 18;
  });
  s += '</svg>';
  const rows = series.map(function (sr) { return [sr.name].concat(sr.values || []); });
  return s + dataTable(v, [''].concat(cats), rows, (v.title || '') + (v.unit ? ' (' + v.unit + ')' : ''));
}

// ── Pie ──────────────────────────────────────────────────────────────────────
function pie(v) {
  const charts = v.charts || [];
  const size = 240, r = 92;
  const W = charts.length * 300, H = 300;
  let s = '<svg class="iwv-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(v.title || '') + '">';
  charts.forEach(function (c, ci) {
    const cx = 150 + ci * 300, cy = 140;
    const total = (c.slices || []).reduce(function (a, sl) { return a + (sl.value || 0); }, 0) || 1;
    let ang = -Math.PI / 2;
    (c.slices || []).forEach(function (sl, i) {
      const frac = (sl.value || 0) / total;
      const a2 = ang + frac * Math.PI * 2;
      const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = frac > 0.5 ? 1 : 0;
      s += '<path d="M' + cx + ',' + cy + ' L' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + x2 + ',' + y2 + ' Z" fill="' + PALETTE[i % PALETTE.length] + '" stroke="#fff" stroke-width="1.5"><title>' + esc(sl.label) + ': ' + fmt(sl.value) + (v.unit || '') + '</title></path>';
      const mid = (ang + a2) / 2, lx = cx + (r + 22) * Math.cos(mid), ly = cy + (r + 22) * Math.sin(mid);
      if (frac >= 0.04) s += '<text x="' + lx + '" y="' + (ly + 4) + '" font-size="11" text-anchor="middle" fill="#111827">' + fmt(sl.value) + (v.unit || '') + '</text>';
      ang = a2;
    });
    s += '<text x="' + cx + '" y="' + (cy + r + 48) + '" font-size="12" font-weight="700" text-anchor="middle" fill="#111827">' + esc(c.title || '') + '</text>';
  });
  s += '</svg>';
  // Legend + table
  const labels = [];
  charts.forEach(function (c) { (c.slices || []).forEach(function (sl) { if (labels.indexOf(sl.label) === -1) labels.push(sl.label); }); });
  let leg = '<div class="iwv-legend">' + labels.map(function (l, i) { return '<span><i style="background:' + PALETTE[i % PALETTE.length] + '"></i>' + esc(l) + '</span>'; }).join('') + '</div>';
  const rows = labels.map(function (l) { return [l].concat(charts.map(function (c) { const f = (c.slices || []).find(function (x) { return x.label === l; }); return f ? f.value : '–'; })); });
  return s + leg + dataTable(v, [''].concat(charts.map(function (c) { return c.title || ''; })), rows, (v.title || '') + (v.unit ? ' (' + v.unit + ')' : ''));
}

// ── Table ────────────────────────────────────────────────────────────────────
function table(v) {
  return dataTable(v, v.columns || [], v.rows || [], (v.title || '') + (v.unit ? ' (' + v.unit + ')' : ''));
}

// ── Process ──────────────────────────────────────────────────────────────────
function process(v) {
  const stages = v.stages || [];
  let h = '<div class="iwv-process" role="list" aria-label="' + esc(v.title || '') + '">';
  stages.forEach(function (st, i) {
    h += '<div class="iwv-stage" role="listitem"><div class="iwv-stage__n">' + esc(st.n != null ? st.n : i + 1) + '</div><div class="iwv-stage__body"><div class="iwv-stage__name">' + esc(st.name) + '</div>' + (st.description ? '<div class="iwv-stage__desc">' + esc(st.description) + '</div>' : '') + '</div></div>';
    if (i < stages.length - 1) h += '<div class="iwv-arrow" aria-hidden="true">↓</div>';
  });
  if (v.cyclic) h += '<div class="iwv-arrow" aria-hidden="true">↻ returns to stage 1</div>';
  return h + '</div>';
}

// ── Map ──────────────────────────────────────────────────────────────────────
function map(v) {
  const periods = v.periods || [];
  let h = '<div class="iwv-maps">';
  periods.forEach(function (p) {
    let s = '<svg class="iwv-svg iwv-map" viewBox="0 0 100 100" role="img" aria-label="' + esc(p.label || '') + '">';
    s += '<rect x="0" y="0" width="100" height="100" fill="#f9fafb" stroke="#9ca3af" stroke-width="0.6"/>';
    (p.items || []).forEach(function (it) {
      const kind = it.kind || 'other';
      if (kind === 'road') {
        s += '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="' + MAP_FILL.road + '" stroke="' + MAP_STROKE.road + '" stroke-width="0.4" stroke-dasharray="1.5 1"/>';
      } else if (kind === 'water') {
        s += '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" rx="3" fill="' + MAP_FILL.water + '" stroke="' + MAP_STROKE.water + '" stroke-width="0.5"/>';
      } else if (kind === 'green') {
        s += '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" rx="2" fill="' + MAP_FILL.green + '" stroke="' + MAP_STROKE.green + '" stroke-width="0.5"/>';
      } else {
        s += '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="' + (MAP_FILL[kind] || MAP_FILL.other) + '" stroke="' + (MAP_STROKE[kind] || MAP_STROKE.other) + '" stroke-width="0.5"/>';
      }
      const fs = it.w < 14 ? 2.4 : 3;
      s += '<text x="' + (it.x + it.w / 2) + '" y="' + (it.y + it.h / 2 + 1) + '" font-size="' + fs + '" text-anchor="middle" fill="#111827">' + esc(it.name) + '</text>';
    });
    if (v.compass !== false) s += '<text x="94" y="6" font-size="4" font-weight="700" text-anchor="middle" fill="#374151">N</text><path d="M94 8 l-1.5 4 h3 z" fill="#374151"/>';
    s += '</svg>';
    h += '<figure class="iwv-mapfig">' + s + '<figcaption>' + esc(p.label || '') + '</figcaption></figure>';
  });
  h += '</div>';
  h += '<div class="iwv-legend"><span><i style="background:' + MAP_FILL.building + '"></i>Buildings</span><span><i style="background:' + MAP_FILL.green + '"></i>Green space</span><span><i style="background:' + MAP_FILL.water + '"></i>Water</span><span><i style="background:' + MAP_FILL.road + '"></i>Roads / paths</span><span><i style="background:' + MAP_FILL.other + '"></i>Other</span></div>';
  return h;
}

function render(visual, format) {
  if (!visual) return '';
  const f = format || visual.format;
  try {
    switch (f) {
      case 'line-graph': return xyChart(visual, 'line');
      case 'bar-chart': return xyChart(visual, 'bar');
      case 'pie-chart': return pie(visual);
      case 'table': return table(visual);
      case 'process': return process(visual);
      case 'map': return map(visual);
      case 'combination': return (visual.charts || []).map(function (c) { return '<div class="iwv-combo">' + (c.title ? '<h4 class="iwv-subtitle">' + esc(c.title) + '</h4>' : '') + render(c, c.format) + '</div>'; }).join('');
      default: return '';
    }
  } catch (e) { return '<p class="iwv-err">Visual could not be rendered.</p>'; }
}

export { render };
