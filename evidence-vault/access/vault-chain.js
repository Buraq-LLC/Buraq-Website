/* vault-chain.js — BuraqAI Evidence Chain Viewer
 * Fetches live records from BuraqAI and renders them as a
 * SHA-256 hash-linked chain. Tier-gated field access:
 *   basic      → pins only, no coords/images/hashes
 *   pro        → pins + missions, coords + snapshots + truncated hash
 *   enterprise → + logs, full hash chain + prev-hash links + integrity badge
 *   admin      → everything + raw hash + rebuild
 */
(function(global) {
  'use strict';

  // ─── TIER CAPABILITIES ──────────────────────────────────────────────────────
  const CAPS = {
    basic: {
      sources:       ['pins'],
      showCoords:    false,
      showImages:    false,
      showHash:      false,
      showPrevHash:  false,
      showIntegrity: false,
      showRaw:       false,
      maxRec:        20,
    },
    pro: {
      sources:       ['pins', 'missions'],
      showCoords:    true,
      showImages:    true,
      showHash:      true,
      showPrevHash:  false,
      showIntegrity: false,
      showRaw:       false,
      maxRec:        50,
    },
    enterprise: {
      sources:       ['pins', 'missions', 'logs'],
      showCoords:    true,
      showImages:    true,
      showHash:      true,
      showPrevHash:  true,
      showIntegrity: true,
      showRaw:       false,
      maxRec:        100,
    },
    admin: {
      sources:       ['pins', 'missions', 'logs'],
      showCoords:    true,
      showImages:    true,
      showHash:      true,
      showPrevHash:  true,
      showIntegrity: true,
      showRaw:       true,
      maxRec:        500,
    },
  };

  // ─── STATE ───────────────────────────────────────────────────────────────────
  let _tier  = 'basic';
  let _api   = '';
  let _chain = [];
  let _ready = false;
  let _busy  = false;

  // ─── CSS ─────────────────────────────────────────────────────────────────────
  const STYLE = `
#sec-chain .chain-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.chain-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:64px 24px;color:var(--muted2);font-size:13px;text-align:center;gap:10px}
.chain-spinner{width:22px;height:22px;border:2px solid var(--border2);
  border-top-color:var(--tier);border-radius:50%;animation:vc-spin .7s linear infinite}
@keyframes vc-spin{to{transform:rotate(360deg)}}
.c-block{background:var(--bg2);border:1px solid var(--border);border-radius:12px;
  overflow:hidden;transition:border-color .15s;cursor:pointer}
.c-block:hover{border-color:var(--border2)}
.c-block.open{border-color:var(--tier)}
.c-head{padding:13px 18px}
.c-meta{display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap}
.c-title{font-size:13px;font-weight:600;margin-bottom:4px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;max-width:80%}
.c-time{font-family:'SF Mono','Fira Code',monospace;font-size:10px;color:var(--muted);margin-bottom:4px}
.c-hash-row{display:flex;align-items:center;gap:5px;margin-top:3px}
.c-hash-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);min-width:36px}
.c-hash-val{font-family:'SF Mono','Fira Code',monospace;font-size:10px;color:var(--tier)}
.c-prev-val{font-family:'SF Mono','Fira Code',monospace;font-size:10px;color:var(--muted2)}
.c-hint{font-size:10px;color:var(--muted);margin-top:6px;letter-spacing:.03em}
.c-body{display:none;padding:0 18px 16px;border-top:1px solid var(--border)}
.c-block.open .c-body{display:block}
.c-block.open .c-hint{display:none}
.c-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding-top:14px}
.c-field{background:var(--bg3);border:1px solid var(--border);border-radius:8px;
  padding:9px 12px;overflow:hidden}
.c-field-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);margin-bottom:4px}
.c-field-val{font-size:12px;overflow-wrap:break-word;line-height:1.4}
.c-snap{margin-top:14px}
.c-snap-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);margin-bottom:8px}
.c-snap-img{max-width:100%;max-height:360px;border-radius:8px;border:1px solid var(--border);
  display:block;object-fit:cover}
.c-raw{margin-top:14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;
  padding:12px;font-family:'SF Mono','Fira Code',monospace;font-size:9px;color:var(--muted2);
  word-break:break-all;line-height:1.6;max-height:160px;overflow-y:auto}
.c-raw-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);margin-bottom:5px}
.c-link{display:flex;justify-content:center}
.c-link-line{width:2px;height:16px;background:linear-gradient(var(--tier),var(--border));
  opacity:.35;border-radius:1px}
.chain-ibadge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;
  padding:4px 10px;border-radius:99px;border:1px solid}
.ci-ok{background:rgba(34,197,94,.08);color:#22c55e;border-color:rgba(34,197,94,.2)}
.ci-fail{background:rgba(255,69,58,.08);color:#ff453a;border-color:rgba(255,69,58,.2)}
.ci-pend{background:rgba(90,98,114,.12);color:var(--muted2);border-color:var(--border)}
`;

  function injectStyle() {
    if (document.getElementById('vc-css')) return;
    const s = document.createElement('style');
    s.id = 'vc-css';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  // ─── SHA-256 ─────────────────────────────────────────────────────────────────
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── FETCH STATIC JSON ───────────────────────────────────────────────────────
  const BASE = '/evidence-vault/access';
  async function fetchJSON(file) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 9000);
      const r = await fetch(`${BASE}/${file}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!r.ok) return null;
      const j = await r.json();
      return Array.isArray(j) ? j : null;
    } catch {
      return null;
    }
  }

  // ─── LOAD ────────────────────────────────────────────────────────────────────
  async function load() {
    if (_busy) return;
    _busy  = true;
    _ready = false;
    _chain = [];
    setUI('loading');

    const caps = CAPS[_tier] || CAPS.basic;
    const raw  = [];
    let netErr = false;

    if (caps.sources.includes('pins')) {
      const r = await fetchJSON('chain-pins.json');
      if (r === null) netErr = true;
      else r.forEach(x => raw.push({ _src: 'pin', ...x }));
    }
    if (caps.sources.includes('missions')) {
      const r = await fetchJSON('chain-missions.json');
      if (r === null) netErr = true;
      else r.forEach(x => raw.push({ _src: 'mission', ...x }));
    }

    if (netErr && raw.length === 0) { setUI('error'); _busy = false; return; }
    if (raw.length === 0)           { setUI('empty'); _busy = false; return; }

    // Sort oldest-first for hash chaining, cap to maxRec
    raw.sort((a, b) =>
      new Date(a.created_at || a.start_time || 0) -
      new Date(b.created_at || b.start_time || 0)
    );
    raw.splice(caps.maxRec);

    _chain = await buildChain(raw); // returns newest-first for display
    _ready = true;
    _busy  = false;
    renderChain();
  }

  // ─── BUILD CHAIN ─────────────────────────────────────────────────────────────
  async function buildChain(sorted) {
    const out  = [];
    let prev   = '0'.repeat(64);

    for (let i = 0; i < sorted.length; i++) {
      const rec  = sorted[i];
      let hash   = rec.hash || (rec.hash_record && rec.hash_record.hash) || null;
      let prevH  = rec.prev_hash || (rec.hash_record && rec.hash_record.prev_hash) || prev;

      if (!hash) {
        const content = [prev, rec._src, rec.id,
          rec.created_at || rec.start_time || '',
          rec.message || rec.name || ''].join('|');
        hash  = await sha256(content);
        prevH = prev;
      }

      out.push({ idx: i + 1, src: rec._src, data: rec, hash, prevHash: prevH });
      prev = hash;
    }

    return out.reverse(); // newest first for display
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  function renderChain(filter) {
    const wrap = document.getElementById('vcContainer');
    if (!wrap) return;
    const caps = CAPS[_tier] || CAPS.basic;

    let blocks = _chain;
    if (filter) {
      const q      = (filter.q      || '').toLowerCase();
      const sev    = filter.sev     || '';
      const region = filter.region  || '';
      const type   = filter.type    || '';
      blocks = blocks.filter(b => {
        const d = b.data;
        if (q && !JSON.stringify(d).toLowerCase().includes(q)) return false;
        if (sev    && d.severity !== sev)    return false;
        if (region && d.region   !== region) return false;
        if (type   && b.src      !== type)   return false;
        return true;
      });
    }

    const cntEl = document.getElementById('vcCount');
    if (cntEl) cntEl.textContent = `${blocks.length} block${blocks.length !== 1 ? 's' : ''}`;

    if (blocks.length === 0) {
      wrap.innerHTML = '<div class="chain-empty"><span style="font-size:28px">⛓</span><span>No blocks match filter.</span></div>';
      return;
    }

    wrap.innerHTML = blocks.map((b, i) => blockHTML(b, caps, i === blocks.length - 1)).join('');
    wrap.querySelectorAll('.c-block').forEach(el =>
      el.addEventListener('click', () => el.classList.toggle('open'))
    );

    if (caps.showIntegrity) verifyIntegrity();
  }

  // ─── BLOCK HTML ──────────────────────────────────────────────────────────────
  function blockHTML(block, caps, isLast) {
    const { idx, src, data, hash, prevHash } = block;
    const ts     = new Date(data.created_at || data.start_time || Date.now())
      .toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const srcLbl = { pin: 'PIN', log: 'LOG', mission: 'MISSION' }[src] || src.toUpperCase();
    const srcCls = { pin: 'bt-photo', log: 'bt-doc', mission: 'bt-test' }[src] || 'bt-sensor';
    const sevCls = { CRITICAL: 'bf', HIGH: 'bf', MEDIUM: 'bp', LOW: 'bv', INFO: 'bv' }[data.severity || ''] || '';
    const title  = esc(data.message || data.name || data.entity_type || `Record #${idx}`);

    let hashHTML = '';
    if (caps.showHash) {
      hashHTML  = `<div class="c-hash-row"><span class="c-hash-lbl">SHA256</span><span class="c-hash-val">${hash.slice(0, 16)}…${hash.slice(-8)}</span></div>`;
      if (caps.showPrevHash) {
        hashHTML += `<div class="c-hash-row"><span class="c-hash-lbl">PREV</span><span class="c-prev-val">${prevHash.slice(0, 16)}…${prevHash.slice(-8)}</span></div>`;
      }
    }

    const fields  = fieldHTML(data, src, caps);
    const img     = imgHTML(data, caps);
    const rawSect = caps.showRaw
      ? `<div class="c-raw-lbl" style="margin-top:14px">Full Hash</div><div class="c-raw">${esc(hash)}</div>`
      : '';
    const link = isLast ? '' : '<div class="c-link"><div class="c-link-line"></div></div>';

    return `
<div class="c-block" id="vcb-${idx}">
  <div class="c-head">
    <div class="c-meta">
      <span class="badge ${srcCls}">${srcLbl}</span>
      <span style="font-size:10px;color:var(--muted)">#${idx}</span>
      ${data.severity ? `<span class="badge ${sevCls}">${esc(data.severity)}</span>` : ''}
    </div>
    <div class="c-title">${title}</div>
    <div class="c-time">${ts}</div>
    ${hashHTML}
    <div class="c-hint">Click to expand ↓</div>
  </div>
  <div class="c-body">
    ${fields}
    ${img}
    ${rawSect}
  </div>
</div>${link}`;
  }

  // ─── FIELD ROWS ──────────────────────────────────────────────────────────────
  function fieldHTML(data, src, caps) {
    const rows = [];
    const f = (lbl, val, mono) => {
      if (val === null || val === undefined || val === '') return;
      const v = mono
        ? `<div class="c-field-val"><code style="font-family:monospace;font-size:11px">${esc(String(val))}</code></div>`
        : `<div class="c-field-val">${esc(String(val))}</div>`;
      rows.push(`<div class="c-field"><div class="c-field-lbl">${esc(lbl)}</div>${v}</div>`);
    };

    if (src === 'pin') {
      f('Entity Type', data.entity_type);
      f('Region',      data.region);
      f('Source',      data.source);
      f('Status',      data.status);
      if (data.confidence != null) f('Confidence', (data.confidence * 100).toFixed(0) + '%');
      if (caps.showCoords) {
        if (data.lat != null && data.lng != null)
          f('Coordinates', `${Number(data.lat).toFixed(5)}, ${Number(data.lng).toFixed(5)}`, true);
        if (data.altitude_m  != null) f('Altitude',  data.altitude_m  + ' m');
        if (data.speed_kmh   != null) f('Speed',     data.speed_kmh   + ' km/h');
        if (data.heading     != null) f('Heading',   data.heading     + '°');
        if (data.callsign)            f('Callsign',  data.callsign,     true);
        if (data.icao24)              f('ICAO24',    data.icao24,       true);
        if (data.frp         != null) f('Fire Power', data.frp + ' MW');
        if (data.magnitude   != null) f('Magnitude', data.magnitude);
      }
      if (data.tags && data.tags.length) f('Tags', data.tags.join(', '));
    } else if (src === 'log') {
      f('Level', data.level);
      if (caps.showPrevHash && data.hash_record) {
        f('Chain Hash', data.hash_record.hash,      true);
        f('Prev Hash',  data.hash_record.prev_hash, true);
      }
    } else if (src === 'mission') {
      f('Code Name', data.code_name, true);
      f('Status',    data.status);
      f('Priority',  data.priority);
      f('Region',    data.region);
      if (caps.showCoords) {
        f('Operator',   data.operator);
        f('Events',     data.events_count);
        f('Alerts',     data.alerts_count);
        f('Intel Items', data.intelligence_gathered);
      }
      if (data.objective) f('Objective', data.objective);
    }

    return rows.length ? `<div class="c-fields">${rows.join('')}</div>` : '';
  }

  // ─── SNAPSHOT IMAGE ──────────────────────────────────────────────────────────
  function imgHTML(data, caps) {
    if (!caps.showImages || !data.snapshot_url) return '';
    const url = data.snapshot_url.startsWith('http')
      ? data.snapshot_url
      : `${_api}${data.snapshot_url.startsWith('/') ? '' : '/'}${data.snapshot_url}`;
    return `<div class="c-snap">
      <div class="c-snap-lbl">Snapshot</div>
      <img class="c-snap-img" src="${esc(url)}" alt="snapshot" loading="lazy"
        onerror="this.closest('.c-snap').style.display='none'"/>
    </div>`;
  }

  // ─── INTEGRITY CHECK ─────────────────────────────────────────────────────────
  async function verifyIntegrity() {
    const el = document.getElementById('vcIntegrity');
    if (!el) return;
    const sorted = [..._chain].reverse(); // oldest-first
    let broken = false;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].prevHash !== sorted[i - 1].hash) { broken = true; break; }
    }
    el.className = `chain-ibadge ${broken ? 'ci-fail' : 'ci-ok'}`;
    el.innerHTML = broken
      ? '<span style="font-size:8px">●</span> Chain broken'
      : '<span style="font-size:8px">●</span> Chain verified';
  }

  // ─── STATUS STATES ───────────────────────────────────────────────────────────
  function setUI(state) {
    const wrap = document.getElementById('vcContainer');
    if (!wrap) return;
    if (state === 'loading') {
      wrap.innerHTML = '<div class="chain-empty"><div class="chain-spinner"></div><span>Connecting to BuraqAI…</span></div>';
    } else if (state === 'empty') {
      wrap.innerHTML = `<div class="chain-empty">
        <span style="font-size:32px">⛓</span>
        <span style="font-weight:600">No records yet</span>
        <span style="font-size:12px;color:var(--muted)">BuraqAI has no evidence records in this category.</span>
      </div>`;
    } else if (state === 'error') {
      wrap.innerHTML = `<div class="chain-empty">
        <span style="font-size:28px;color:var(--red)">⚠</span>
        <span style="font-weight:600;color:var(--red)">Cannot reach BuraqAI</span>
        <span style="font-size:12px;color:var(--muted);max-width:400px;text-align:center">
          Ensure BuraqAI is running at
          <code style="font-family:monospace;background:var(--bg3);padding:1px 5px;border-radius:4px">${esc(_api)}</code>
          with CORS enabled for this origin.
        </span>
        <button class="act-btn" style="margin-top:4px" onclick="window.VaultChain.reload()">↻ Retry</button>
        <div style="margin-top:10px;padding:12px 18px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-size:11px;color:var(--muted2);max-width:440px;line-height:1.65">
          <strong style="color:var(--text)">Setup:</strong> Add
          <code style="font-family:monospace">window.__env.VAULT_BURAQAI_API = "http://your-api-host"</code>
          to <code style="font-family:monospace">__env.js</code>, then enable
          <code style="font-family:monospace">flask-cors</code> in BuraqAI for this origin.
        </div>
      </div>`;
    }
  }

  // ─── SECTION SCAFFOLD ────────────────────────────────────────────────────────
  function buildSection(tier) {
    const caps = CAPS[tier] || CAPS.basic;
    const hasSrcFilter = caps.sources.length > 1;
    const intBadge = caps.showIntegrity
      ? '<span id="vcIntegrity" class="chain-ibadge ci-pend"><span style="font-size:8px">●</span> Verifying…</span>'
      : '';
    return `
<div class="sec-head">
  <div>
    <div class="sec-title">Evidence Chain</div>
    <div class="sec-sub">Live hash-linked records from BuraqAI · <span id="vcCount">—</span></div>
  </div>
  <div style="display:flex;align-items:center;gap:8px">${intBadge}</div>
</div>
<div class="chain-toolbar">
  <input class="tbl-search" id="vcQ" placeholder="Search records…" style="min-width:160px"/>
  <select class="tbl-sel" id="vcSev">
    <option value="">All Severity</option>
    <option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>INFO</option>
  </select>
  <select class="tbl-sel" id="vcRegion">
    <option value="">All Regions</option>
    <option>gaza</option><option>westbank</option><option>north</option><option>south</option>
  </select>
  ${hasSrcFilter ? `<select class="tbl-sel" id="vcType">
    <option value="">All Types</option>
    <option value="pin">Pins</option>
    ${caps.sources.includes('missions') ? '<option value="mission">Missions</option>' : ''}
    ${caps.sources.includes('logs')     ? '<option value="log">Logs</option>'         : ''}
  </select>` : ''}
  <button class="act-btn" onclick="window.VaultChain.reload()">↻ Refresh</button>
</div>
<div id="vcContainer"></div>`;
  }

  // ─── FILTER WIRING ───────────────────────────────────────────────────────────
  function wireFilters() {
    const apply = () => {
      if (!_ready) return;
      renderChain({
        q:      document.getElementById('vcQ')?.value,
        sev:    document.getElementById('vcSev')?.value,
        region: document.getElementById('vcRegion')?.value,
        type:   document.getElementById('vcType')?.value,
      });
    };
    ['vcQ', 'vcSev', 'vcRegion', 'vcType'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
  }

  // ─── UTILS ───────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────
  global.VaultChain = {
    init(tier) {
      injectStyle();
      _tier = tier || _tier;
      _api  = (global.__env && global.__env.VAULT_BURAQAI_API) || 'http://localhost:5000';

      const sec = document.getElementById('sec-chain');
      if (!sec) return;

      if (!sec.dataset.built) {
        sec.innerHTML    = buildSection(_tier);
        sec.dataset.built = '1';
        wireFilters();
      }

      if (!_ready) load();
    },

    reload() {
      _ready = false;
      _chain = [];
      const sec = document.getElementById('sec-chain');
      if (sec) { sec.dataset.built = ''; sec.innerHTML = ''; }
      this.init(_tier);
    },
  };

})(window);
