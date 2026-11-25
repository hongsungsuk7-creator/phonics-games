/* Shared prototype kit — used by Copy Cat, Little Detective, Shop & Count, Maze Quest, Photo Safari.
   Prototype stand-ins (see each README): browser TTS for lesson-pack audio / tutor voice,
   browser SpeechRecognition for phonics-api, emoji + simple SVG for lesson-pack pictures. */
'use strict';
(function(){
const K = window.KIT = {};
const $ = K.$ = id => document.getElementById(id);
K.sleep = ms => new Promise(r=>setTimeout(r,ms));
K.rnd = a => a[Math.floor(Math.random()*a.length)];
K.shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
K.clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* ---------- scale (TRD 9: 16:9 stage, u = min(1vh, 100vw/177.78)) ---------- */
K.fit = () => { const u=Math.min(innerHeight/100, innerWidth/177.78); document.documentElement.style.setProperty('--u', u+'px'); K.u=u; };
addEventListener('resize', K.fit); K.fit();

/* ---------- content placeholder for lesson pack FP.K.U1L1 ---------- */
K.MWORDS = [
  {w:'moon',e:'🌙',cat:'nature'},{w:'map',e:'🗺️',cat:'thing'},{w:'milk',e:'🥛',cat:'food'},{w:'mop',e:'🧹',cat:'thing'},
  {w:'mug',e:'☕',cat:'thing'},{w:'mouse',e:'🐭',cat:'animal'},{w:'mice',e:'🐁',cat:'animal'},{w:'monkey',e:'🐵',cat:'animal'},
  {w:'mushroom',e:'🍄',cat:'food'},{w:'mask',e:'🎭',cat:'thing'},{w:'mail',e:'✉️',cat:'thing'},{w:'mitt',e:'🧤',cat:'thing'},
  {w:'meat',e:'🍖',cat:'food'},{w:'mirror',e:'🪞',cat:'thing'},{w:'man',e:'👨',cat:'person'},{w:'mouth',e:'👄',cat:'body'},
];
K.OTHER = [{w:'egg',e:'🥚'},{w:'fox',e:'🦊'},{w:'gift',e:'🎁'},{w:'kite',e:'🪁'},{w:'doll',e:'🪆'},{w:'heart',e:'❤️'},{w:'ten',e:'🔟'}];
K.CONFUSE = { mouse:['mouth','mice'], mouth:['mouse'], mice:['mouse'], meat:['mitt'], mitt:['meat'], map:['mask','man'], mask:['map'], man:['map'] };
K.word = w => K.MWORDS.find(m=>m.w===w) || K.OTHER.find(m=>m.w===w);
K.COLORS = { red:'#e94b4b', blue:'#3d7be0', yellow:'#f5c842', green:'#4cb963', orange:'#f28c28', purple:'#9b5de5', pink:'#f478b4', brown:'#9a6b43' };
K.SVG = {
  mug:c=>`<svg viewBox="0 0 100 100"><path d="M68 38 h8 a12 12 0 0 1 0 24 h-8" fill="none" stroke="${c}" stroke-width="7"/><rect x="18" y="26" width="52" height="56" rx="8" fill="${c}"/><rect x="18" y="26" width="52" height="9" rx="4" fill="#fff" opacity=".35"/></svg>`,
  mitt:c=>`<svg viewBox="0 0 100 100"><path d="M30 86 V40 a22 22 0 0 1 44 0 V86 z" fill="${c}"/><path d="M30 58 q-16 -4 -14 -18 q6 -6 14 4" fill="${c}"/><rect x="28" y="78" width="48" height="10" rx="3" fill="#fff" opacity=".5"/></svg>`,
  mask:c=>`<svg viewBox="0 0 100 100"><path d="M8 42 q42 -18 84 0 q0 26 -20 26 q-14 0 -22 -10 q-8 10 -22 10 q-20 0 -20 -26z" fill="${c}"/><ellipse cx="32" cy="48" rx="9" ry="6" fill="#fffbe6"/><ellipse cx="68" cy="48" rx="9" ry="6" fill="#fffbe6"/></svg>`,
  mail:c=>`<svg viewBox="0 0 100 100"><rect x="12" y="26" width="76" height="50" rx="6" fill="${c}"/><path d="M14 30 L50 56 L86 30" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/></svg>`,
  mushroom:c=>`<svg viewBox="0 0 100 100"><rect x="40" y="50" width="20" height="34" rx="8" fill="#fff4dc"/><path d="M12 56 a38 34 0 0 1 76 0 z" fill="${c}"/><circle cx="34" cy="40" r="6" fill="#fff" opacity=".8"/><circle cx="60" cy="32" r="5" fill="#fff" opacity=".8"/><circle cx="70" cy="48" r="4" fill="#fff" opacity=".8"/></svg>`,
};
K.COLORABLE = ['mug','mitt','mask','mushroom','mail'];
K.key = it => it.svg ? it.color+'-'+it.svg : it.w;
K.label = it => it.svg ? `${it.color} ${it.svg}` : it.w;
K.noun = it => it.svg || it.w;
K.keysOf = it => it.svg ? [it.color, it.svg] : [it.w];
K.pic = (it, sizeCss) => it.svg ? `<div class="itm" style="${sizeCss?`width:${sizeCss};height:${sizeCss}`:''}">${K.SVG[it.svg](K.COLORS[it.color])}</div>`
                                 : `<div class="emo" style="${sizeCss?`font-size:${sizeCss}`:''}">${it.e}</div>`;
K.NUM = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
K.PLURAL = { mouse:'mice', match:'matches', mushroom:'mushrooms' };
K.plural = (w,n) => n===1 ? w : (K.PLURAL[w] || (w.endsWith('s')||w.endsWith('ch')? w+'es' : w+'s'));

/* ---------- save ---------- */
K.loadSave = prefix => { K.SKEY=prefix+'.save.v1'; let s={}; try{ s=JSON.parse(localStorage.getItem(K.SKEY))||{}; }catch(e){}
  s.ages=s.ages||{}; s.bank=s.bank||0; s.coll=s.coll||0; s.age=s.age||5; s.lang=s.lang||'ko'; K.SAVE=s; return s; };
K.writeSave = () => { try{ localStorage.setItem(K.SKEY, JSON.stringify(K.SAVE)); }catch(e){} };
K.ageRec = a => K.SAVE.ages[a] = K.SAVE.ages[a] || {level:1, poor:0};

/* ---------- audio ---------- */
K.muted = false;
function pickVoice(l){ const vs=speechSynthesis.getVoices(); return vs.find(v=>v.lang.startsWith(l)&&/Google|Natural|Aria|Jenny|Ava|Sun-?Hi|Heami/i.test(v.name))||vs.find(v=>v.lang.startsWith(l)); }
K.say = (text, lang='en') => new Promise(res=>{
  if(K.muted || !('speechSynthesis' in window)){ setTimeout(res, 250+text.length*25); return; }
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=lang==='ko'?'ko-KR':'en-US'; const v=pickVoice(u.lang.slice(0,2)); if(v) u.voice=v;
  u.rate=lang==='ko'?1.0:.88; u.pitch=1.15; let done=false; const fin=()=>{ if(!done){ done=true; res(); } };
  u.onend=fin; u.onerror=fin; setTimeout(fin, 1500+text.length*120); speechSynthesis.speak(u);
});
K.hush = () => { try{ speechSynthesis.cancel(); }catch(e){} };
let actx=null; const ac=()=>actx=actx||new (window.AudioContext||window.webkitAudioContext)();
function tone(seq,type='sine',vol=.16){ if(K.muted) return; try{ const a=ac(),t=a.currentTime,o=a.createOscillator(),g=a.createGain(); o.type=type; o.connect(g); g.connect(a.destination);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.02); seq.forEach(([f,d])=>o.frequency.setValueAtTime(f,t+d)); const end=t+seq[seq.length-1][1]+.18; g.gain.exponentialRampToValueAtTime(.0001,end); o.start(t); o.stop(end+.02);}catch(e){} }
function noise(dur,vol=.2,hp=800){ if(K.muted) return; try{ const a=ac(),n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=a.createBufferSource(); s.buffer=b; const f=a.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp; const g=a.createGain(); g.gain.value=vol; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }catch(e){} }
K.sfx = { ok:()=>tone([[660,0],[880,.1],[1320,.2]]), bad:()=>tone([[300,0],[240,.12]],'triangle'), tick:()=>tone([[1400,0]],'square',.05), star:()=>tone([[1046,0],[1318,.08],[1568,.16]]),
  pop:()=>tone([[500,0],[900,.05]]), click:()=>tone([[900,0]],'square',.06), bell:()=>tone([[1568,0],[1318,.15]]), whoosh:()=>noise(.4,.1,500), shutter:()=>{ noise(.06,.3,2000); setTimeout(()=>noise(.05,.25,2500),90); },
  clap:()=>{ for(let i=0;i<8;i++) setTimeout(()=>noise(.06,.25,1500), i*90+Math.random()*40); }, bump:()=>tone([[160,0],[120,.08]],'triangle',.2), coin:()=>tone([[988,0],[1318,.07]]) };

/* ---------- tutor lines ---------- */
K.L = {}; K.face = ()=>{};
K.COMMON_LINES = {
  mic:{en:'Please turn on the mic so I can hear you.', ko:'네 목소리를 들을 수 있게 마이크를 켜 줘.'},
  demoEnd:{en:'Now you try!', ko:'이제 혼자 해 봐!'},
  say:{en:'Say it!', ko:'말해 봐!'}, sayAgain:{en:'One more time!', ko:'한 번 더!'},
  goodTry:{en:"Good try! Let's go on.", ko:'좋은 시도였어! 다음으로 가자.'},
  jumpTip:{en:'Want to skip? Tap the jump button!', ko:'넘어가고 싶으면 점프 버튼을 눌러!'},
  nomic:{en:"I can't hear you. Let's keep going!", ko:'목소리가 안 들려. 계속 해 보자!'},
};
K.line = k => { const o=K.L[k]||K.COMMON_LINES[k]; let t=o[K.SAVE.lang], en=o.en; if(Array.isArray(t)){ const i=Math.floor(Math.random()*t.length); t=t[i]; en=o.en[i]; } return {t,en,lang:K.SAVE.lang}; };
K.bubble = html => { const b=$('bubble'); b.innerHTML=html; b.classList.add('on'); };
K.tutor = async (k, opt={}) => { const l=K.line(k); K.bubble(l.t+(l.lang==='ko'&&!opt.noEn?`<span class="en">${l.en}</span>`:'')); if(opt.face) K.face(opt.face);
  await K.say(l.t, l.lang); if(!opt.keep) setTimeout(()=>{ const b=$('bubble'); if(b.innerHTML.startsWith(l.t)) b.classList.remove('on'); },1600); };
K.sayLine = async (en, ko) => { const lang=K.SAVE.lang; const t = lang==='ko' && ko ? ko : en; K.bubble(t + (lang==='ko'&&ko?`<span class="en">${en}</span>`:'')); await K.say(en,'en'); };
K.anim = (el, cls) => { if(!el) return; el.classList.remove('bounce','oops','shake'); void el.offsetWidth; el.classList.add(cls); };
K.toast = (txt, ms=1600) => { let t=$('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; $('stage').appendChild(t); } t.textContent=txt; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'), ms); };

/* ---------- hand / idle ---------- */
K.showHand = (el, stay) => { const h=$('hand'); if(!el||!h) return; const r=el.getBoundingClientRect(), s=$('stage').getBoundingClientRect(); h.style.display='block';
  h.style.left=(r.left-s.left+r.width/2-h.offsetWidth/3)+'px'; h.style.top=(r.top-s.top+r.height/2)+'px'; if(!stay) setTimeout(()=>h.style.display='none',1800); };
K.hideHand = () => { const h=$('hand'); if(h) h.style.display='none'; };
let idleT=null, idleR=null;
K.clearIdle = () => { clearTimeout(idleT); clearInterval(idleR); };
K.armIdle = fn => { K.clearIdle(); idleT=setTimeout(async()=>{ await fn(); idleR=setInterval(fn,15000); },8000); };

/* ---------- level rule (TRD 6-3) ---------- */
K.levelFor = age => { const f=$('qaLevel')?.value; return f? +f : K.ageRec(age).level; };
K.applyLevel = (age, avg) => { if($('qaLevel')?.value) return {change:'', level:+$('qaLevel').value};
  const r=K.ageRec(age); let change='';
  if(avg>=2){ if(r.level<6){ r.level++; change='up'; } r.poor=0; }
  else if(avg<1.5){ r.poor++; if(r.poor>=2 && r.level>1){ r.level--; r.poor=0; change='down'; } }
  else r.poor=0;
  K.writeSave(); return {change, level:r.level}; };

/* ---------- progress ---------- */
K.renderProgress = G => { const p=$('progress'); if(!p) return; p.innerHTML=''; for(let i=0;i<G.total;i++){ const b=document.createElement('b'), s=G.stars[i];
  if(s!=null){ b.className='s'+s; b.textContent=s>0?'★':'·'; } if(i===G.idx) b.classList.add('cur'); p.appendChild(b); } const ss=$('starSum'); if(ss) ss.textContent=G.stars.reduce((a,b)=>a+(b||0),0); };

/* ---------- speaking (TRD 8-4 / 8-5) — prototype: browser SpeechRecognition ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let jumpFlag=false, firstQuiet=true, curRec=null;
const norm = s => ' '+s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()+' ';
K.judge = (alts, keys, ordered) => alts.some(a=>{ const t=norm(a); let pos=0;
  for(const k of keys){ const re=new RegExp(' '+k+'(s|es)? '); const m=re.exec(t.slice(ordered?pos:0)); if(!m) return false; if(ordered) pos += m.index+1; } return true; });
function listenOnce(phrase){
  return new Promise(res=>{ const m=$('qaSpeech')?.value||'real';
    if(m==='ok') return setTimeout(()=>res({alts:[phrase]}),1100);
    if(m==='wrong') return setTimeout(()=>res({alts:['banana']}),1100);
    if(m==='off'||!SR) return res({nomic:true});
    const r=new SR(); curRec=r; r.lang='en-US'; r.maxAlternatives=5; r.interimResults=false; r.continuous=false;
    let got=null, err=null; const to=setTimeout(()=>{ try{ r.abort(); }catch(e){} }, 9000);
    r.onresult=e=>{ got=[...e.results[0]].map(x=>x.transcript); }; r.onerror=e=>{ err=e.error; };
    r.onend=()=>{ clearTimeout(to); curRec=null; if(jumpFlag) return res({jump:true}); if(got) return res({alts:got});
      if(['not-allowed','service-not-allowed','audio-capture'].includes(err)) return res({nomic:true}); res({silent:true}); };
    try{ r.start(); }catch(e){ res({nomic:true}); } });
}
K.stopListening = () => { jumpFlag=true; if(curRec) try{ curRec.abort(); }catch(e){} };
/* returns true when passed. opts: {phrase, keys, ordered, targetHtml, isAlive()} */
K.speak = async (opts) => {
  jumpFlag=false; const alive=opts.isAlive||(()=>true);
  const hide=[...document.querySelectorAll('[data-hide-on-speak]')]; hide.forEach(e=>e.style.visibility='hidden');
  $('micTarget').innerHTML = opts.targetHtml || opts.phrase; $('heard').textContent=''; $('mic').classList.add('on');
  let tries=0, sil=0, ok=false; await K.tutor('say',{keep:true, face:'listen'});
  while(alive()){
    if(jumpFlag) break; $('micBtn').classList.add('listening'); const r=await listenOnce(opts.phrase); $('micBtn').classList.remove('listening');
    if(!alive()||r.jump) break; if(r.nomic){ await K.tutor('nomic'); break; }
    if(r.silent){ sil++; if(firstQuiet){ firstQuiet=false; K.showHand($('jumpBtn')); await K.tutor('jumpTip'); } if(sil>=2){ await K.tutor('goodTry'); break; } await K.tutor('sayAgain'); await K.say(opts.phrase); continue; }
    $('heard').textContent='heard: '+r.alts[0];
    if(K.judge(r.alts, opts.keys, opts.ordered)){ ok=true; K.sfx.star(); K.face('joy'); const g=K.line('great'); K.bubble(g.t); await K.say(g.t,g.lang); break; }
    tries++; if(tries>=2){ await K.tutor('goodTry',{face:'oops'}); break; } await K.tutor('sayAgain',{face:'oops'}); await K.say(opts.phrase);
  }
  $('mic').classList.remove('on'); hide.forEach(e=>e.style.visibility='visible'); K.hideHand(); return ok;
};

/* ---------- options (cards) ---------- */
/* list: items; opts: {box, onPick(card,item), label:bool, read:bool, textOnlyKey, isInteracted()} */
K.cards = async (box, list, opts={}) => {
  box.innerHTML='';
  const cs = list.map(it=>{ const c=document.createElement('div'); c.className='card'; c.dataset.k = it.num!=null ? 'n'+it.num : K.key(it);
    if(it.num!=null) c.innerHTML=`<div class="num">${it.num}</div>`;
    else if(opts.textOnlyKey===K.key(it)) c.innerHTML=`<div class="txt">${it.w}</div>`;
    else c.innerHTML = K.pic(it) + (opts.label?`<div class="lbl">${K.label(it)}</div>`:'');
    const sp=document.createElement('button'); sp.className='spk'; sp.textContent='🔊'; sp.onclick=e=>{ e.stopPropagation(); K.say(it.num!=null? K.NUM[it.num] : K.label(it)); }; c.appendChild(sp);
    c.onclick=()=>opts.onPick&&opts.onPick(c,it); box.appendChild(c); return {c,it}; });
  for(const {c,it} of cs){ c.classList.add('in'); if(!opts.read || (opts.isInteracted&&opts.isInteracted())){ await K.sleep(110); continue; }
    if(opts.textOnlyKey===K.key(it)) { await K.sleep(400); continue; } await K.say(it.num!=null? K.NUM[it.num] : K.label(it)); }
  return cs;
};
K.cardBy = (box, k) => [...box.querySelectorAll('.card')].find(c=>c.dataset.k===k);

/* ---------- result ---------- */
/* r: {title, heroHtml, total, count, words:[{text, phrase, stars, spoke}], rewardText, onHome, onAgain, onNext} */
K.result = async (G, r) => {
  const total=G.stars.reduce((a,b)=>a+(b||0),0), avg=total/G.total; const lv=K.applyLevel(G.age, avg);
  K.SAVE.bank += total; let got=0; const per=r.per||10; while(K.SAVE.bank>=per){ K.SAVE.bank-=per; K.SAVE.coll++; got++; } K.writeSave();
  $('resTitle').textContent=r.title; $('resHero').innerHTML=r.heroHtml||'';
  $('resStars').textContent=avg>=2.5?'⭐⭐⭐':avg>=1.5?'⭐⭐':'⭐';
  $('resMeta').textContent=`맞힌 문제 ${G.stars.filter(s=>s>0).length} / ${G.total} · 별 ${total}개 · 평균 ${avg.toFixed(1)}`;
  $('resLv').innerHTML = lv.change==='up'?`<span class="lvup">LEVEL UP! → ${lv.level}</span>`: lv.change==='down'?`<span class="resmeta">다음 판은 LEVEL ${lv.level}로 쉬워져요</span>`:`<span class="resmeta">다음 판 LEVEL ${lv.level}</span>`;
  const box=$('resWords'); box.innerHTML=''; G.words.forEach(w=>{ const d=document.createElement('div'); d.className='rw'+(w.spoke?' said':''); d.innerHTML=`${w.text} <span class="st">${'★'.repeat(w.stars)}${'☆'.repeat(3-w.stars)}</span>`; d.onclick=()=>K.say(w.phrase); box.appendChild(d); });
  $('resReward').textContent = got? `${r.icon} ${r.unit} ${got}! (${r.collName} ${K.SAVE.coll})` : `${r.icon} 다음 ${r.unit}까지 별 ${per-K.SAVE.bank}개`;
  show('result'); const l=K.line('clear'); await K.say(l.t,l.lang); if(lv.change==='up'){ const u=K.line('levelUp'); await K.say(u.t,u.lang); }
};
const show = K.show = id => document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on', s.id===id));

/* ---------- common DOM + title + QA ---------- */
/* cfg: {prefix, collIcon, onStart(), onExit(), qaExtra:html, demoKey} */
K.init = cfg => {
  K.cfg=cfg; K.loadSave(cfg.prefix);
  const st=$('stage');
  st.insertAdjacentHTML('beforeend', `
    <div class="hand" id="hand">👆</div><button class="btn" id="skipBtn">SKIP ⏭</button>
    <button id="qaBtn">QA</button>
    <div id="qa"><b>QA 패널 (프로토타입 전용)</b><br>
      레벨 강제: <select id="qaLevel"><option value="">자동(저장값)</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select><br>
      ${cfg.qaExtra||''}
      말하기: <select id="qaSpeech"><option value="real">실제 음성 인식(브라우저)</option><option value="ok">항상 통과(가짜)</option><option value="wrong">항상 오답(가짜)</option><option value="off">마이크 없음</option></select><br>
      첫 판 시범: <select id="qaDemo"><option value="auto">방문당 1회</option><option value="always">매번</option><option value="never">끄기</option></select><br>
      <button id="qaReset">저장 초기화</button>
      <div class="note">※ 발음 판정은 phonics-api 대신 브라우저 음성 인식(Chrome), 음성은 브라우저 내장 음성, 그림은 레슨팩 대표 이미지 대신 임시 그림(이모지·도형).</div></div>`);
  document.body.insertAdjacentHTML('afterbegin','<div class="rotate"><div>📱↻</div><div>기기를 가로로 돌려 주세요</div><small>Please turn your device sideways.</small></div>');
  $('game').insertAdjacentHTML('beforeend','<div class="mic" id="mic"><div class="target" id="micTarget"></div><button class="micbtn" id="micBtn">🎤</button><button class="btn green" id="jumpBtn">JUMP ⤼</button><div class="heard" id="heard"></div></div>');
  $('jumpBtn').onclick=K.stopListening;
  $('qaBtn').onclick=()=>$('qa').classList.toggle('on');
  $('qaReset').onclick=()=>{ try{ localStorage.removeItem(K.SKEY); sessionStorage.removeItem(cfg.prefix+'.demo'); }catch(e){} K.loadSave(cfg.prefix); refresh(); alert('저장 초기화 완료'); };
  const refresh = K.refreshTitle = () => { document.querySelectorAll('.chip[data-age]').forEach(c=>c.classList.toggle('on', +c.dataset.age===K.SAVE.age)); const cc=$('collCount'); if(cc) cc.textContent=K.SAVE.coll; const lb=$('langBtn'); if(lb) lb.textContent=K.SAVE.lang==='ko'?'한국어':'English'; };
  document.querySelectorAll('.chip[data-age]').forEach(c=>c.onclick=()=>{ K.SAVE.age=+c.dataset.age; K.writeSave(); refresh(); });
  $('langBtn').onclick=()=>{ K.SAVE.lang=K.SAVE.lang==='ko'?'en':'ko'; K.writeSave(); refresh(); };
  document.querySelectorAll('.sndBtn').forEach(b=>b.onclick=()=>{ K.muted=!K.muted; document.querySelectorAll('.sndBtn').forEach(x=>x.textContent=K.muted?'🔇':'🔊'); if(K.muted) K.hush(); });
  $('keyBtn').onclick=()=>alert('보호자 영역(프로토타입): 발음 서버 키 입력 자리입니다. 가정용 접속 방식이 정해지면 바뀝니다.');
  let greeted=false; $('title').addEventListener('pointerdown',()=>{ if(!greeted){ greeted=true; const l=K.line('hello'); K.say(l.t,l.lang); } });
  $('startBtn').onclick=async e=>{ e.stopPropagation(); K.hush(); await K.askMic(); cfg.onStart(); };
  $('exitBtn').onclick=()=>{ K.clearIdle(); K.hush(); K.stopListening(); K.skipDemo=true; $('skipBtn').style.display='none'; K.hideHand(); $('bubble').classList.remove('on'); $('mic').classList.remove('on'); cfg.onExit(); show('title'); refresh(); };
  $('homeBtn').onclick=()=>{ cfg.onExit(); show('title'); refresh(); };
  $('againBtn').onclick=()=>cfg.onStart(); $('nextRoundBtn').onclick=()=>cfg.onStart();
  $('skipBtn').onclick=()=>{ K.skipDemo=true; K.hush(); };
  // URL QA options: ?age=5|6|7 &level=1~6 &speech=real|ok|wrong|off &demo=auto|always|never &autostart=1 &mute=1 (+ game-specific)
  const p=new URLSearchParams(location.search); K.params=p;
  if(p.get('age')) K.SAVE.age=+p.get('age'); if(p.get('level')) $('qaLevel').value=p.get('level');
  if(p.get('speech')) $('qaSpeech').value=p.get('speech'); if(p.get('demo')) $('qaDemo').value=p.get('demo');
  if(p.get('mute')){ K.muted=true; document.querySelectorAll('.sndBtn').forEach(x=>x.textContent='🔇'); }
  refresh(); window.__ready=true;
  if(p.get('autostart')) setTimeout(cfg.onStart, 300);
};
K.askMic = async () => { if($('qaSpeech').value!=='real'||!navigator.mediaDevices?.getUserMedia) return; const t=setTimeout(()=>{ const l=K.line('mic'); K.say(l.t,l.lang); },1500);
  try{ const s=await Promise.race([navigator.mediaDevices.getUserMedia({audio:true}), K.sleep(15000)]); s&&s.getTracks&&s.getTracks().forEach(x=>x.stop()); }catch(e){} clearTimeout(t); };
K.demoNeeded = () => { const m=$('qaDemo').value; let seen=false; try{ seen=!!sessionStorage.getItem(K.cfg.prefix+'.demo'); }catch(e){} return m==='always' || (m==='auto' && !seen); };
K.demoDone = () => { try{ sessionStorage.setItem(K.cfg.prefix+'.demo','1'); }catch(e){} };
K.demoStart = () => { K.skipDemo=false; $('skipBtn').style.display='block'; };
K.demoEnd = () => { $('skipBtn').style.display='none'; K.hideHand(); $('bubble').classList.remove('on'); K.demoDone(); };
})();
