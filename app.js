/* Phonics Games launcher — games.json → search + cards, checklist tab, TRD reader */
'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const TYPE_CHIPS = ['전체', '어휘·생각', '보드게임', '1인', '2인', '교실', '말하기', '레슨팩', '문법'];
  const STATUS_CHIPS = ['전체', '있음', '일부', '없음', '해당 없음'];
  const PRIO_CHIPS = ['전체', '높음', '중간', '낮음'];
  const state = { games: [], type: '전체', query: '', game: '전체', status: '전체', prio: '전체', selected: new Set(), trdCache: {} };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hasUrl = (u) => typeof u === 'string' && u.trim() !== '';
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage off */ } } };
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1800); }
  function chipGroup(boxId, labels, current, onPick, counts) {
    const box = $(boxId); box.innerHTML = '';
    labels.forEach((label) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', String(label === current));
      b.innerHTML = esc(label) + (counts ? `<span class="n">${counts[label] ?? 0}</span>` : '');
      b.addEventListener('click', () => onPick(label));
      box.appendChild(b);
    });
  }
  function tagsHTML(g) {
    const types = (g.type || []).map((t) => `<span class="tag type">${esc(t)}</span>`).join('');
    const extra = [g.skill, g.tutor && `튜터 ${g.tutor}`].filter(Boolean).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    return types + extra;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove(); return ok;
    }
  }

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const isDark = () => (root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
  function applyTheme(t) { if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme'); $('themeBtn').textContent = isDark() ? '☀️' : '🌙'; }
  applyTheme(store.get('launcher.theme') || 'dark');   // dark by default; the button choice is remembered
  $('themeBtn').addEventListener('click', () => { const next = isDark() ? 'light' : 'dark'; store.set('launcher.theme', next); applyTheme(next); });

  /* ---------- top-right tabs: 게임 / 점검표 ---------- */
  function showTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    $('panel-games').hidden = name !== 'games'; $('panel-check').hidden = name !== 'check';
    store.set('launcher.tab', name);
    const url = new URL(location.href); if (name === 'check') url.searchParams.set('tab', 'check'); else url.searchParams.delete('tab');
    history.replaceState(null, '', url);
  }
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));

  /* ---------- search + cards ---------- */
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
  const matches = (g, q) => !q || [g.title, g.titleKo, g.tutor, g.id].some((v) => norm(v).includes(q));
  function highlight(text, q) {
    if (!q) return esc(text);
    const raw = String(text); const flat = raw.toLowerCase();
    // match ignoring spaces: find q in the space-less string and map back to the original positions
    const map = []; let compact = ''; for (let k = 0; k < raw.length; k++) { if (!/\s/.test(raw[k])) { map.push(k); compact += flat[k]; } }
    const at = compact.indexOf(q); if (at < 0) return esc(text);
    const s = map[at], e = map[at + q.length - 1] + 1;
    return esc(raw.slice(0, s)) + '<mark>' + esc(raw.slice(s, e)) + '</mark>' + esc(raw.slice(e));
  }
  function renderGrid() {
    const q = norm(state.query);
    const byQuery = state.games.filter((g) => matches(g, q));
    const counts = { '전체': byQuery.length };
    TYPE_CHIPS.slice(1).forEach((t) => { counts[t] = byQuery.filter((g) => (g.type || []).includes(t)).length; });
    chipGroup('typeChips', TYPE_CHIPS, state.type, (t) => { state.type = t; renderGrid(); }, counts);
    const list = state.type === '전체' ? byQuery : byQuery.filter((g) => (g.type || []).includes(state.type));
    $('allCount').textContent = `${list.length}개`;
    $('grid').innerHTML = list.map((g) => `
      <article class="card">
        <div class="art" style="background:${esc(g.color || 'var(--surface-2)')}"><img src="${esc(g.thumbnail)}" alt="" loading="lazy"></div>
        <div class="body">
          <div class="name">${highlight(g.title, q)}${g.titleKo ? `<small>${highlight(g.titleKo, q)}</small>` : ''}</div>
          <p class="desc">${esc(g.description)}</p>
          <div class="tags">${tagsHTML(g)}</div>
          <div class="row">
            <a class="btn primary sm" href="${esc(g.playUrl)}" target="_blank" rel="noopener">▶ 플레이</a>
            ${hasUrl(g.trdUrl) ? `<button class="btn line sm" type="button" data-trd="${esc(g.id)}">📄 TRD 보기</button>` : ''}
          </div>
        </div>
      </article>`).join('');
    const empty = $('gridEmpty'); empty.hidden = list.length > 0;
    if (!list.length) empty.textContent = state.query ? `"${state.query}"에 맞는 게임이 없어요.` : '이 유형의 게임이 아직 없어요.';
  }
  $('grid').addEventListener('click', (e) => { const b = e.target.closest('[data-trd]'); if (b) openTrd(b.dataset.trd); });
  $('search').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderGrid(); });
  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && $('reader').hidden) { e.preventDefault(); showTab('games'); $('search').focus(); }
    if (e.key === 'Escape' && !$('reader').hidden) closeTrd();
  });

  /* ---------- checklist tab ---------- */
  const rowsAll = () => state.games.flatMap((g) => (g.checklist || []).map((c, i) => ({ key: `${g.id}#${i}`, game: g.title, ...c })));
  const statusClass = (s) => 'b-' + String(s).replace(/\s/g, '');
  const visibleRows = () => rowsAll().filter((r) => (state.game === '전체' || r.game === state.game) && (state.status === '전체' || r.status === state.status) && (state.prio === '전체' || r.priority === state.prio));
  function renderChecklist() {
    const all = rowsAll();
    const gameLabels = ['전체', ...state.games.map((g) => g.title)];
    const gc = { '전체': all.length }; state.games.forEach((g) => { gc[g.title] = all.filter((r) => r.game === g.title).length; });
    const sc = { '전체': all.length }; STATUS_CHIPS.slice(1).forEach((s) => { sc[s] = all.filter((r) => r.status === s).length; });
    const pc = { '전체': all.length }; PRIO_CHIPS.slice(1).forEach((p) => { pc[p] = all.filter((r) => r.priority === p).length; });
    chipGroup('gameChips', gameLabels, state.game, (v) => { state.game = v; renderChecklist(); }, gc);
    chipGroup('statusChips', STATUS_CHIPS, state.status, (v) => { state.status = v; renderChecklist(); }, sc);
    chipGroup('prioChips', PRIO_CHIPS, state.prio, (v) => { state.prio = v; renderChecklist(); }, pc);
    const rows = visibleRows();
    $('checkBody').innerHTML = rows.map((r) => `
      <tr class="${state.selected.has(r.key) ? 'sel' : ''}" data-key="${esc(r.key)}">
        <td class="c-sel no-print"><input type="checkbox" ${state.selected.has(r.key) ? 'checked' : ''} aria-label="${esc(r.game + ' ' + r.item)} 고르기"></td>
        <td class="c-game gname">${esc(r.game)}</td>
        <td class="c-item">${esc(r.item)}</td>
        <td class="c-status"><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td>
        <td class="c-prio"><span class="prio p-${esc(r.priority)}">${esc(r.priority)}</span></td>
        <td class="c-note">${esc(r.note)}</td>
      </tr>`).join('');
    $('checkEmpty').hidden = rows.length > 0;
    $('checkAll').checked = rows.length > 0 && rows.every((r) => state.selected.has(r.key));
    $('selCount').textContent = state.selected.size ? `(${state.selected.size})` : '';
    const high = all.filter((r) => r.priority === '높음' && r.status !== '있음').length;
    $('checkBadge').textContent = high ? `높음 ${high}` : '';
  }
  $('checkBody').addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    const key = e.target.closest('tr').dataset.key;
    if (e.target.checked) state.selected.add(key); else state.selected.delete(key);
    renderChecklist();
  });
  $('checkAll').addEventListener('change', (e) => { visibleRows().forEach((r) => (e.target.checked ? state.selected.add(r.key) : state.selected.delete(r.key))); renderChecklist(); });
  $('copyBtn').addEventListener('click', async () => {
    const rows = rowsAll().filter((r) => state.selected.has(r.key));
    if (!rows.length) { toast('먼저 표에서 항목을 골라 주세요.'); return; }
    const text = rows.map((r) => `- [${r.game}] ${r.item} — 상태: ${r.status} / 우선순위: ${r.priority}${r.note ? ` / 메모: ${r.note}` : ''}`).join('\n');
    toast((await copyText(text)) ? `${rows.length}개 항목을 복사했어요.` : '복사하지 못했어요. 브라우저 권한을 확인해 주세요.');
  });
  $('printBtn').addEventListener('click', () => {
    $('printMeta').textContent = `출력: ${new Date().toLocaleString('ko-KR')} · 게임 ${state.game} · 상태 ${state.status} · 우선순위 ${state.prio}`;
    window.print();
  });

  /* ---------- TRD reader: small Markdown renderer (headings, lists, tables, quotes, code, links) ---------- */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function renderMarkdown(md) {
    const lines = md.replace(/\r/g, '').split('\n'); const out = []; const toc = []; let i = 0; let para = [];
    const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
    const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { flush(); i++; continue; }
      const h = l.match(/^(#{1,4})\s+(.*)$/);
      if (h) { flush(); const lv = h[1].length; const id = `s${toc.length + 1}`; if (lv === 2) toc.push({ id, text: h[2] }); out.push(`<h${lv}${lv === 2 ? ` id="${id}"` : ''}>${inline(h[2])}</h${lv}>`); i++; continue; }
      if (/^---+\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
      if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        flush(); const head = cells(l); i += 2; const body = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { body.push(cells(lines[i])); i++; }
        out.push(`<div class="tw"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if (/^>\s?/.test(l)) { flush(); const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; } out.push(`<blockquote>${q.map(inline).join('<br>')}</blockquote>`); continue; }
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        flush(); const stack = [];
        while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/); const depth = Math.floor(m[1].length / 2); const tag = /\d/.test(m[2]) ? 'ol' : 'ul';
          while (stack.length > depth + 1) out.push(`</li></${stack.pop()}>`);
          if (stack.length < depth + 1) { stack.push(tag); out.push(`<${tag}><li>${inline(m[3])}`); }
          else out.push(`</li><li>${inline(m[3])}`);
          i++;
        }
        while (stack.length) out.push(`</li></${stack.pop()}>`);
        continue;
      }
      para.push(l.trim()); i++;
    }
    flush(); return { html: out.join('\n'), toc };
  }
  async function openTrd(id) {
    const g = state.games.find((x) => x.id === id); if (!g || !hasUrl(g.trdUrl)) return;
    $('rImg').src = g.thumbnail || ''; $('rTitle').textContent = g.title; $('rKo').textContent = [g.titleKo, g.tutor && `튜터 ${g.tutor}`].filter(Boolean).join(' · ');
    $('rPlay').href = g.playUrl;
    $('rBody').innerHTML = '<p class="empty">문서를 불러오는 중…</p>'; $('rToc').innerHTML = '';
    $('reader').hidden = false; document.body.classList.add('lock');
    const url = new URL(location.href); url.searchParams.set('trd', id); history.replaceState(null, '', url);
    try {
      const md = state.trdCache[id] || (state.trdCache[id] = await fetch(g.trdUrl, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }));
      const { html, toc } = renderMarkdown(md);
      $('rBody').innerHTML = html;
      $('rToc').innerHTML = toc.map((t) => { const m = t.text.match(/^(\d+)\.\s*(.*)$/);
        return `<a href="#${t.id}" data-go="${t.id}">${m ? `<span class="no">${m[1]}</span>${inline(m[2])}` : inline(t.text)}</a>`; }).join('');
      $('rBody').scrollTop = 0; $('rBody').focus();
    } catch (e) {
      $('rBody').innerHTML = `<p class="notice">TRD를 불러오지 못했어요 (${esc(g.trdUrl)}). 로컬 서버(start.bat)나 GitHub Pages 주소로 열어 주세요.</p>`;
    }
  }
  function closeTrd() {
    $('reader').hidden = true; document.body.classList.remove('lock');
    const url = new URL(location.href); url.searchParams.delete('trd'); history.replaceState(null, '', url);
  }
  $('rClose').addEventListener('click', closeTrd);
  $('reader').addEventListener('click', (e) => { if (e.target === $('reader')) closeTrd(); });
  $('rToc').addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault();
    const t = document.getElementById(a.dataset.go); if (t) $('rBody').scrollTo({ top: t.offsetTop - 8, behavior: 'smooth' });
    $('rToc').querySelectorAll('a').forEach((x) => x.classList.toggle('on', x === a));
  });
  $('rPrint').addEventListener('click', () => { document.body.classList.add('print-trd'); window.print(); });
  addEventListener('afterprint', () => document.body.classList.remove('print-trd'));

  /* ---------- load ---------- */
  fetch('games.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      state.games = Array.isArray(data.games) ? data.games : [];
      renderGrid(); renderChecklist();
      const p = new URLSearchParams(location.search);
      showTab(p.get('tab') === 'check' ? 'check' : (p.get('tab') === 'games' ? 'games' : (store.get('launcher.tab') || 'games')));
      if (p.get('trd')) openTrd(p.get('trd'));
    })
    .catch(() => {
      const n = $('loadError'); n.hidden = false;
      n.innerHTML = 'games.json을 불러오지 못했어요. 파일을 더블클릭해서 열면 브라우저가 막습니다. <b>start.bat</b>(로컬 서버)으로 열거나 GitHub Pages 주소로 접속해 주세요.';
    });
})();
