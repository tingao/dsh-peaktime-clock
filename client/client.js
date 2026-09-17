window.__ModuleLoader__.load({ id: "dsh-peaktime-clock", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
const React = require('react');
const h = React.createElement;

// ── styles ────────────────────────────────────────────────────────────────
const CSS = `
.ds-pk-clock {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid;
  font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1;
  user-select: none;
  background: rgba(16, 18, 24, 0.05);
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}
.ds-pk-clock.ds-pk-dragging {
  cursor: grabbing;
}
.ds-pk-clock.ds-pk-peak {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.35);
}
.ds-pk-clock.ds-pk-off {
  color: #51cf66;
  border-color: rgba(81, 207, 102, 0.35);
}
.ds-pk-whale {
  position: relative;
  display: inline-block;
  line-height: 1;
}
.ds-pk-whale-svg {
  display: block;
  width: 22px;
  height: 22px;
  animation: ds-pk-swim 3.4s ease-in-out infinite;
}
.ds-pk-peak .ds-pk-whale-svg {
  animation-duration: 2.2s;
  filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.55));
}
.ds-pk-off .ds-pk-whale-svg {
  filter: drop-shadow(0 0 5px rgba(81, 207, 102, 0.55));
}
@keyframes ds-pk-swim {
  0%, 100% { transform: translate(0, 0) rotate(-2.5deg); }
  50% { transform: translate(4px, -3px) rotate(2.5deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ds-pk-whale-svg { animation: none; }
}
.ds-pk-mood {
  position: absolute;
  top: -8px;
  right: -14px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', Consolas, monospace;
}
.ds-pk-peak .ds-pk-mood {
  color: #ffc9c9;
  text-shadow: 0 0 7px rgba(255, 107, 107, 0.9);
}
.ds-pk-off .ds-pk-mood {
  color: #d3f9d8;
  text-shadow: 0 0 7px rgba(81, 207, 102, 0.9);
}
.ds-pk-time {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  min-width: 52px;
  text-align: center;
}
.ds-pk-peak .ds-pk-time {
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.55);
}
.ds-pk-off .ds-pk-time {
  text-shadow: 0 0 8px rgba(81, 207, 102, 0.55);
}
.ds-pk-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.6px;
  padding: 2px 6px;
  border-radius: 999px;
}
.ds-pk-peak .ds-pk-badge {
  background: #ff6b6b;
  color: #101218;
}
.ds-pk-off .ds-pk-badge {
  background: #51cf66;
  color: #101218;
}
`;

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('dsh-peaktime-clock-style') !== null) return;
  const style = document.createElement('style');
  style.id = 'dsh-peaktime-clock-style';
  style.setAttribute('data-plugin', 'dsh-peaktime-clock');
  style.textContent = CSS;
  document.head.appendChild(style);
}

// ── DeepSeek price windows (UTC) ──────────────────────────────────────────
// Peak (full price): 01:00-04:00 UTC and 06:00-10:00 UTC.
// Off-peak (discounted): 00:00-01:00, 04:00-06:00, 10:00-24:00 UTC.
const PEAK_WINDOWS = [
  { start: 60, end: 240 },
  { start: 360, end: 600 },
];

function utcMinutes(date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
}

function isPeak(date) {
  const m = utcMinutes(date);
  for (let i = 0; i < PEAK_WINDOWS.length; i++) {
    if (m >= PEAK_WINDOWS[i].start && m < PEAK_WINDOWS[i].end) return true;
  }
  return false;
}

function windowRange(m) {
  if (m < 60) return '00:00-01:00';
  if (m < 240) return '01:00-04:00';
  if (m < 360) return '04:00-06:00';
  if (m < 600) return '06:00-10:00';
  return '10:00-24:00';
}

function nextBoundary(date) {
  const now = date.getTime();
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const bounds = [60, 240, 360, 600].map(m => dayStart + m * 60000);
  bounds.push(dayStart + 24 * 60 * 60000);
  let best = null;
  for (let i = 0; i < bounds.length; i++) {
    if (bounds[i] > now && (best === null || bounds[i] < best)) best = bounds[i];
  }
  return best;
}

function fmtCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (hh > 0) return hh + 'h ' + mm + 'm';
  return mm + 'm ' + String(ss).padStart(2, '0') + 's';
}

function formatTime(d) {
  const p = n => String(n).padStart(2, '0');
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function formatDate(d) {
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const p = n => String(n).padStart(2, '0');
  return wd + ' ' + p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

// ── Official DeepSeek logo whale (lobe-icons deepseek-color.svg) ───────────
const DEEPSEEK_WHALE_PATH = 'M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z';

function WhaleIcon({ peak }) {
  return h('svg', {
    viewBox: '0 0 24 24',
    className: 'ds-pk-whale-svg',
    'aria-hidden': true,
  }, h('path', { d: DEEPSEEK_WHALE_PATH, fill: peak ? '#ff6b6b' : '#51cf66' }));
}

// ── Component ─────────────────────────────────────────────────────────────
// -- drag position --------------------------------------------------------
// The widget can be dragged anywhere in the viewport; the dropped position is
// remembered per browser, and a double-click returns it to its corner.
const POS_KEY = 'dsh-peaktime-clock:pos';
const EDGE = 4;

function readPos() {
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch (e) { /* malformed entry or storage unavailable: keep the corner */ }
  return null;
}

function savePos(pos) {
  try {
    if (pos === null) window.localStorage.removeItem(POS_KEY);
    else window.localStorage.setItem(POS_KEY, JSON.stringify(pos));
  } catch (e) { /* storage unavailable: the position just will not persist */ }
}

// Never let the widget be dragged (or left) off screen.
function clampToViewport(x, y, width, height) {
  const maxX = Math.max(EDGE, window.innerWidth - width - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - height - EDGE);
  return {
    x: Math.min(Math.max(EDGE, x), maxX),
    y: Math.min(Math.max(EDGE, y), maxY),
  };
}

// Defined inside apply() so it closes over the Cordis ctx (timer service).
function makePeakClock(ctx) {
  return function PeakClock() {
    const state = React.useState(() => new Date());
    const now = state[0];
    const setNow = state[1];
    React.useEffect(() => ctx.interval(() => setNow(new Date()), 1000), []);

    const rootRef = React.useRef(null);
    const posState = React.useState(readPos);
    const pos = posState[0];
    const setPos = posState[1];
    const dragState = React.useState(false);
    const dragging = dragState[0];
    const setDragging = dragState[1];
    const drag = React.useRef(null);

    // Keep a previously dragged widget on screen when the window shrinks.
    React.useEffect(() => {
      function onResize() {
        setPos(function (current) {
          if (current === null) return null;
          const el = rootRef.current;
          const width = el === null ? 0 : el.offsetWidth;
          const height = el === null ? 0 : el.offsetHeight;
          const next = clampToViewport(current.x, current.y, width, height);
          return next.x === current.x && next.y === current.y ? current : next;
        });
      }
      window.addEventListener('resize', onResize);
      return function () { window.removeEventListener('resize', onResize); };
    }, []);

    function onPointerDown(event) {
      if (event.button !== 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      drag.current = {
        pointerId: event.pointerId,
        dx: event.clientX - rect.left,
        dy: event.clientY - rect.top,
        moved: false,
        x: rect.left,
        y: rect.top,
      };
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch (e) { /* capture is optional */ }
      setDragging(true);
    }

    function onPointerMove(event) {
      const active = drag.current;
      if (active === null || active.pointerId !== event.pointerId) return;
      active.moved = true;
      const el = event.currentTarget;
      const next = clampToViewport(
        event.clientX - active.dx,
        event.clientY - active.dy,
        el.offsetWidth,
        el.offsetHeight);
      active.x = next.x;
      active.y = next.y;
      setPos(next);
    }

    function onPointerEnd(event) {
      const active = drag.current;
      if (active === null || active.pointerId !== event.pointerId) return;
      drag.current = null;
      setDragging(false);
      try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (e) { /* already released */ }
      if (active.moved) savePos({ x: active.x, y: active.y });
    }

    function onDoubleClick() {
      savePos(null);
      setPos(null);
    }

    const peak = isPeak(now);
    const nb = nextBoundary(now);
    const left = fmtCountdown(nb - now.getTime());
    const tz = -now.getTimezoneOffset();
    const tzLabel = 'UTC' + (tz >= 0 ? '+' : '-') + String(Math.abs(tz) / 60);
    const m = utcMinutes(now);
    const range = windowRange(m);
    const title = 'DeepSeek price windows\n' +
      (peak ? 'PEAK now - full price, ends in ' + left + ' (' + range + ' UTC)\n' : 'OFF-PEAK now - discounted, ends in ' + left + ' (' + range + ' UTC)\n') +
      'Peak: 01:00-04:00 & 06:00-10:00 UTC\n' +
      'Off-peak: 10:00-01:00, 04:00-06:00 UTC\n' +
      'Local: ' + formatDate(now) + ' ' + formatTime(now) + ' (' + tzLabel + ')';

    const style = pos === null
      ? undefined
      : { left: pos.x + 'px', top: pos.y + 'px', right: 'auto', bottom: 'auto' };

    return h('div', {
      ref: rootRef,
      className: 'ds-pk-clock ' + (peak ? 'ds-pk-peak' : 'ds-pk-off') + (dragging ? ' ds-pk-dragging' : ''),
      style,
      title: title + '\n\nDrag to move - double-click to return to the corner.',
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onDoubleClick,
    },
      h('span', { className: 'ds-pk-whale' },
        h(WhaleIcon, { peak }),
        h('span', { className: 'ds-pk-mood' }, peak ? '$' : 'z z')),
      h('span', { className: 'ds-pk-time' }, left),
      h('span', { className: 'ds-pk-badge' }, peak ? 'PEAK' : 'OFF'));
  };
}

// ── Plugin ────────────────────────────────────────────────────────────────
exports.name = 'dsh-peaktime-clock/client';
exports.inject = ['slots', 'timer'];
exports.apply = function apply(ctx) {
  injectStyles();
  const slots = ctx.get('slots');
  if (slots === undefined) return;
  const PeakClock = makePeakClock(ctx);
  slots.inject('shell.overlay', () => slots.register(
    { name: 'shell.overlay', id: 'ds-peak-clock' },
    () => h(PeakClock)));
};

return module.exports; } });
