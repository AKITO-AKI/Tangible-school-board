(function(){
  'use strict';

  // Scrollspy: ナビとサイドドットのアクティブ状態を更新
  const sections = [
    'top','features','why','tangible','future','story'
  ];
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const dots = Array.from(document.querySelectorAll('.scroll-dots .dot'));

  const map = new Map();
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) map.set(id, el);
  });

  function setActive(id){
    navLinks.forEach(a => {
      const ok = a.getAttribute('data-target') === id;
      a.classList.toggle('active', ok);
      if (ok) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    dots.forEach(d => {
      const ok = d.getAttribute('data-target') === id;
      d.classList.toggle('active', ok);
      if (ok) d.setAttribute('aria-current','location'); else d.removeAttribute('aria-current');
    });
    // 現在地バーの更新
    const label = document.getElementById('currentSectionLabel');
    if (label) {
      const mapLabel = {
        top: 'メイン', features: '機能', why: '課題', tangible: 'タンジブル', future: '将来展望', story: '制作記'
      };
      label.textContent = mapLabel[id] || 'メイン';
    }
  }

  // IntersectionObserver で現在セクションを検出
  let spyTimer = null;
  const io = new IntersectionObserver((entries) => {
    // rootMargin/thresholdにより「画面の中央〜やや上」を優先
    const candidates = entries.filter(e => e.isIntersecting);
    // 縦位置が一番上（viewportに早く入った）を優先
    candidates.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
    const chosen = candidates[0]?.target;
    if (!chosen || !chosen.id) return;
    // デバウンスでチラつき防止（150〜200ms）
    clearTimeout(spyTimer);
    spyTimer = setTimeout(() => {
      setActive(chosen.id);
      if (history && history.replaceState) {
        history.replaceState(null, '', `#${chosen.id}`);
      }
    }, 180);
  }, { threshold: 0.4, rootMargin: '-20% 0px -40% 0px' });

  map.forEach((el) => io.observe(el));

  // クリック時はスムーススクロール (CSSでscroll-behavior済み)
  // ここでは同一ページ内のアンカーだけを処理
  function onClickAnchor(e){
    const a = e.currentTarget;
    const target = a.getAttribute('href') || '';
    if (target.startsWith('#')){
      const id = target.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', onClickAnchor);
  });
  // サイドドットは<button>化されたのでキーボード操作対応
  dots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('data-href');
      if (href) { location.assign(href); return; }
      const id = btn.getAttribute('data-target');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = btn.getAttribute('data-href');
        if (href) { location.assign(href); return; }
        const id = btn.getAttribute('data-target');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 初期ハッシュ位置にスクロール時のアクティブ反映
  const initial = location.hash ? location.hash.slice(1) : null;
  if (initial) {
    const initialEl = document.getElementById(initial);
    if (initialEl) {
      initialEl.scrollIntoView({ behavior: 'instant', block: 'start' });
      setActive(initial);
    }
  }

  // ヒーローモックの軽いパララックス風（演出）
  const mockHero = document.querySelector('.mock-hero');
  // Featuresカテゴリデモ：button[data-category] と img[data-category-preview]
  const featureButtons = Array.from(document.querySelectorAll('#features button[data-category]'));
  const featureImg = document.querySelector('#features img[data-category-preview]');
  const featureDesc = document.querySelector('#features [data-category-desc]');
  const previews = {
    '全体': './assets/demo/overall.png',
    '部活動': './assets/demo/club.png',
    '委員会': './assets/demo/committee.png',
    '各学年': './assets/demo/grade.png'
  };
  const descMap = {
    '全体': '学校全体の周知。全体行事や重要連絡をひと目で。',
    '部活動': '各部の試合・体験入部・連絡を集約。',
    '委員会': '委員会ごとの作業・依頼・連絡を一覧。',
    '各学年': '学年別の連絡を整理して見やすく。'
  };
  function setFeature(category){
    featureButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-category')===category));
    if (featureImg && previews[category]) {
      featureImg.style.opacity = '0';
      setTimeout(() => {
        featureImg.src = previews[category];
        featureImg.alt = `${category}カテゴリのプレビュー`;
        featureImg.style.opacity = '1';
      }, 180);
    }
    if (featureDesc) featureDesc.textContent = descMap[category] || '';
  }
  featureButtons.forEach(b => {
    b.addEventListener('click', () => setFeature(b.getAttribute('data-category')));
    b.addEventListener('keydown', (e) => {
      if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setFeature(b.getAttribute('data-category')); }
    });
  });
  if (featureButtons.length) setFeature('全体');
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('scroll', () => {
    if (!mockHero) return;
    if (prefersReduce) return;
    const rect = mockHero.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
    mockHero.style.transform = `rotate3d(0.5, 1, 0, ${v*1.2}deg) scale(${1 + v*0.03})`;
    mockHero.style.boxShadow = `0 12px 30px rgba(148,163,184,${0.25 + v*0.15})`;
  }, { passive: true });
})();
