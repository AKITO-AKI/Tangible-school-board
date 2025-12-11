(function(){
  'use strict';

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal animation on scroll (IntersectionObserver)
  const revealTargets = Array.from(document.querySelectorAll('.card, .mock, .stats-bar, .split, .timeline, .next-card'));
  revealTargets.forEach(el => el.classList.add('reveal'));
  if (!prefersReduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    revealTargets.forEach(el => io.observe(el));
  }

  // Active nav-link based on current page
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav .nav-link, .menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const same = href.endsWith(path);
    a.classList.toggle('active', same);
    if (same) {
      a.setAttribute('aria-current','page');
    } else {
      a.removeAttribute('aria-current');
    }
  });

  // Side dots: navigate across pages if data-href is set
  const dots = Array.from(document.querySelectorAll('.scroll-dots .dot'));
  dots.forEach(btn => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('data-href');
      if (href) { location.assign(href); }
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key==='Enter' || e.key===' ') {
        e.preventDefault();
        const href = btn.getAttribute('data-href');
        if (href) { location.assign(href); }
      }
    });
  });

  // Count-up numbers for stats (simple, unobtrusive)
  function countUp(el){
    const text = el.textContent.trim();
    const target = parseFloat(text.replace(/[^0-9.]/g,''));
    if (!isFinite(target)) return;
    let current = 0; const duration = 800; const start = performance.now();
    function step(now){
      const p = Math.min(1, (now - start)/duration);
      const value = (target * p);
      el.textContent = text.replace(/[0-9.]+/, value.toFixed(text.includes('%') ? 1 : 0));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = text; // restore exact original
    }
    requestAnimationFrame(step);
  }
  if (!prefersReduce) {
    document.querySelectorAll('.stat .num, .bignum .value').forEach(el => countUp(el));
  }

  // ページ進行度インジケーター: スクロール比率をCSS変数と背景グラデーションへ共有
  function setupProgress(){
    const root = document.documentElement;
    const bar = document.getElementById('pageProgressBar');

    const clamp01 = (value) => Math.min(1, Math.max(0, value));
    const parseHex = (hex) => {
      const value = (hex || '').replace('#', '').trim();
      if (!value) return [79, 141, 255];
      const normalized = value.length === 3
        ? value.split('').map((ch) => ch + ch).join('')
        : value.padStart(6, '0');
      const bigint = Number.parseInt(normalized, 16);
      if (Number.isNaN(bigint)) return [79, 141, 255];
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };
    const mixWithWhite = (hex, weight) => {
      const [r, g, b] = parseHex(hex);
      const w = clamp01(weight);
      const mix = (channel) => Math.round((1 - w) * 255 + w * channel);
      return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
    };
    const readAccent = () => {
      const accent = getComputedStyle(document.body).getPropertyValue('--accent-page').trim();
      return accent || '#4f8dff';
    };
    const updateGradient = (ratio) => {
      const accent = readAccent();
      const topWeight = clamp01(0.6 - 0.3 * ratio);
      const midWeight = clamp01(0.4 - 0.18 * ratio);
      const bottomWeight = clamp01(0.1 + 0.24 * ratio);
      root.style.setProperty('--bg-gradient-top', mixWithWhite(accent, topWeight));
      root.style.setProperty('--bg-gradient-mid', mixWithWhite(accent, midWeight));
      root.style.setProperty('--bg-gradient-bottom', mixWithWhite(accent, bottomWeight));
    };

    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const y = Math.max(0, Math.min(total, window.scrollY || window.pageYOffset || 0));
      const progress = total > 0 ? (y / total) : 0;
      const clamped = clamp01(progress);
      root.style.setProperty('--scroll-progress', progress.toString());
      root.style.setProperty('--page-progress', clamped.toFixed(4));
      if (bar) {
        bar.style.width = `${(clamped * 100).toFixed(2)}%`;
      }
      updateGradient(clamped);
    };

    let rafId = null;
    const queueUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    };

    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) queueUpdate();
    });
    if (document.body) {
      const observer = new MutationObserver(queueUpdate);
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    update();
  }
  setupProgress();
  // 1. ロール切り替えトグル
  (function roleToggle(){
    const roleButtons = document.querySelectorAll('.role-btn');
    const roleTextBlocks = document.querySelectorAll('[data-role-text]');
    if (!roleButtons.length || !roleTextBlocks.length) return;
    let currentRole = localStorage.getItem('tsb_role') || 'student';
    function applyRole(role){
      currentRole = role;
      localStorage.setItem('tsb_role', role);
      roleButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.role === role));
      roleTextBlocks.forEach(block => { block.hidden = (block.dataset.roleText !== role); });
    }
    applyRole(currentRole);
    roleButtons.forEach(btn => btn.addEventListener('click', () => applyRole(btn.dataset.role)));
  })();

  // 2. Dayflow タイムライン
  (function dayflow(){
    const steps = document.querySelectorAll('.dayflow-step');
    const img = document.querySelector('[data-step-preview]');
    const cap = document.querySelector('[data-step-caption]');
    if (!steps.length || !img || !cap) return;
    const data = {
      morning: { img: 'assets/dayflow-morning.png', alt: '登校時のボードの様子', text: '昇降口の前で…' },
      homeroom: { img: 'assets/dayflow-homeroom.png', alt: 'HRでの使い方', text: 'HR開始前に今日の連絡を共有…' },
      after: { img: 'assets/dayflow-after.png', alt: '放課後のボード', text: '部活と委員会の連絡がまとまって見える。' },
      exam: { img: 'assets/dayflow-exam.png', alt: 'テスト前の使い方', text: '試験日程と持ち物の再確認に。' }
    };
    function setStep(step){
      steps.forEach(b => b.classList.toggle('is-active', b.dataset.step === step));
      const d = data[step];
      img.classList.add('fading');
      setTimeout(() => { img.src = d.img; img.alt = d.alt; cap.textContent = d.text; img.classList.remove('fading'); }, 160);
    }
    steps.forEach(b => b.addEventListener('click', () => setStep(b.dataset.step)));
    setStep('morning');
  })();

  // 3. UIハイライト同期
  (function uiOverview(){
    const items = document.querySelectorAll('.ui-feature-item');
    const hotspots = document.querySelectorAll('.ui-hotspot');
    if (!items.length || !hotspots.length) return;
    function setActive(key){
      items.forEach(i => i.classList.toggle('is-active', i.dataset.feature === key));
      hotspots.forEach(h => h.classList.toggle('is-active', h.dataset.feature === key));
    }
    items.forEach(i => i.addEventListener('mouseenter', () => setActive(i.dataset.feature)));
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.dataset.feature);
    }, { threshold: 0.4 });
    items.forEach(i => io.observe(i));
  })();

  // 4. 状態付きデモジャンプ
  (function demoJump(){
    const demoBaseUrl = '../board.html';
    document.querySelectorAll('.feature-demo-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.feature-card');
        const query = card?.dataset.demoQuery || '';
        const url = `${demoBaseUrl}${query ? ('?' + query) : ''}`;
        window.open(url, '_blank', 'noopener');
      });
    });
  })();

  // 6. 距離スライダー
  (function distanceDemo(){
    const range = document.getElementById('distance-range');
    const frame = document.querySelector('[data-distance-frame]');
    const caption = document.querySelector('[data-distance-caption]');
    if (!range || !frame || !caption) return;
    function updateDistance(val){
      const v = Number(val);
      let mode = 'mid';
      if (v < 30) mode = 'near'; else if (v > 70) mode = 'far';
      frame.dataset.distance = mode;
      caption.textContent = mode === 'near' ? 'ボードのすぐ近くで、細かい情報まで読むときの見え方。'
        : mode === 'far' ? '昇降口など、少し離れた場所から一目で把握したいとき。'
        : '教室の前を通りがかるときに、ざっと眺めるイメージ。';
    }
    range.addEventListener('input', e => updateDistance(e.target.value));
    updateDistance(range.value);
  })();

  // 7. 情報密度ヒートマップ
  (function heatmap(){
    const bar = document.querySelector('[data-heatmap-bar]');
    const dateLabel = document.querySelector('[data-heatmap-date]');
    const countLabel = document.querySelector('[data-heatmap-count]');
    const imageEl = document.querySelector('[data-heatmap-image]');
    if (!bar || !dateLabel || !countLabel || !imageEl) return;
    const heatmapData = [
      { date: '2025-06-01', count: 2, img: 'assets/day-1.png' },
      { date: '2025-06-02', count: 5, img: 'assets/day-2.png' },
      { date: '2025-06-03', count: 1, img: 'assets/day-3.png' },
      { date: '2025-06-04', count: 6, img: 'assets/day-4.png' },
      { date: '2025-06-05', count: 3, img: 'assets/day-5.png' },
      { date: '2025-06-06', count: 4, img: 'assets/day-6.png' }
    ];
    function render(){
      const max = Math.max(...heatmapData.map(d => d.count));
      bar.innerHTML = '';
      bar.style.display = 'grid';
      bar.style.gridTemplateColumns = `repeat(${heatmapData.length}, 1fr)`;
      heatmapData.forEach((d, idx) => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const intensity = d.count / (max || 1);
        cell.style.setProperty('--intensity', intensity.toString());
        cell.dataset.index = String(idx);
        bar.appendChild(cell);
      });
    }
    function setActive(index){
      const d = heatmapData[index];
      bar.querySelectorAll('.heatmap-cell').forEach(c => c.classList.toggle('is-active', Number(c.dataset.index) === index));
      const dt = new Date(d.date);
      dateLabel.textContent = `${dt.getMonth() + 1}月${dt.getDate()}日`;
      countLabel.textContent = `掲示 ${d.count}件`;
      imageEl.src = d.img;
    }
    bar.addEventListener('mousemove', (e) => {
      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const index = Math.min(heatmapData.length - 1, Math.max(0, Math.floor(ratio * heatmapData.length)));
      setActive(index);
    });
    render();
    setActive(0);
  })();

  // 8. 置き場所ミニ質問
  (function placement(){
    const buttons = document.querySelectorAll('.placement-option');
    const img = document.querySelector('[data-placement-image]');
    const cap = document.querySelector('[data-placement-caption]');
    if (!buttons.length || !img || !cap) return;
    const data = {
      entrance: { img: 'assets/place-entrance.png', text: '昇降口に置けば、登校と下校のたびに自然と目に入ります。' },
      stair: { img: 'assets/place-stair.png', text: '階段ホールなら、フロアを移動する全ての生徒が…' },
      office: { img: 'assets/place-office.png', text: '職員室前なら、先生との連絡の前後で…' },
      other: { img: 'assets/place-other.png', text: '学校ごとの「通り道」を見つけて、その近くに置くのも。' }
    };
    function setPlace(place){
      buttons.forEach(b => b.classList.toggle('is-active', b.dataset.place === place));
      const d = data[place];
      img.src = d.img; cap.textContent = d.text;
      localStorage.setItem('tsb_placement', place);
    }
    buttons.forEach(b => b.addEventListener('click', () => setPlace(b.dataset.place)));
    const stored = localStorage.getItem('tsb_placement') || 'entrance';
    setPlace(stored);
  })();

  // 9. ページローダー制御とヒント
  (function pageLoader(){
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    const hintEl = loader.querySelector('[data-loader-hint]');
    const LOADER_HINTS = [
      'ボード右上の「今日のタスク」は、担当者別に色を変えられます。',
      '行事テンプレートはドラッグ＆ドロップで週をまたいで調整 OK。',
      '放送室からの連絡は自動でボードにミラーされます。',
      '朝のホームルーム前に一括更新。夜間はサイレントモードで表示のみ。',
      '保護者アプリと連携すると、欠席連絡がリアルタイムに反映されます。',
      '体育祭モードでは天気と熱中症指数もボードに常時表示されます。',
      '廊下の照度に応じて輝度が自動調整されるので、見づらさゼロ。',
      'カードに添付した資料は 7 日後に自動アーカイブされます。',
      '担当者ごとにフィルター表示できる「ロールビュー」を活用しよう。',
      '通知を一時停止したいときは、ボード右下のベルアイコンから。'
    ];
    const setRandomHint = () => {
      if (!hintEl || !LOADER_HINTS.length) return;
      const next = LOADER_HINTS[Math.floor(Math.random() * LOADER_HINTS.length)];
      hintEl.textContent = next;
    };
    const hideLoader = () => {
      document.documentElement.classList.add('is-loaded');
      loader.setAttribute('aria-hidden', 'true');
    };
    const showLoader = () => {
      document.documentElement.classList.remove('is-loaded');
      loader.removeAttribute('aria-hidden');
      setRandomHint();
    };

    window.addEventListener('load', () => {
      setRandomHint();
      const delay = prefersReduce ? 320 : 1200;
      setTimeout(hideLoader, delay);
    });

    const shouldIntercept = (link) => {
      if (link.target && link.target !== '_self') return false;
      if (link.hasAttribute('download')) return false;
      if (link.dataset.skipLoader === 'true') return false;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return false;
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return false;
      }
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.hash) return false;
      return true;
    };

    document.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link) return;
      if (!shouldIntercept(link)) return;
      event.preventDefault();
      showLoader();
      const href = link.href;
      const delay = prefersReduce ? 240 : 700;
      setTimeout(() => { window.location.assign(href); }, delay);
    });
  })();
})();
