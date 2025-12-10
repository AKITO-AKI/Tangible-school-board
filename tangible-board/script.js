(function () {
  "use strict";

  const STORAGE_KEY = "tangibleBoardPosts_v1";
  const SETTINGS_KEY = "tangibleBoardSettings_v1";

  // ---------- DOM取得 ----------

  const postCategoryPill = document.getElementById("postCategoryPill");
  const postTargetEl = document.getElementById("postTarget");
  const postTitleEl = document.getElementById("postTitle");
  const postMetaEl = document.getElementById("postMeta");
  const postBodyEl = document.getElementById("postBody");
  const emptyMessageEl = document.getElementById("emptyMessage");
  const postIndexLabelEl = document.getElementById("postIndexLabel");
  const postTimeLabelEl = document.getElementById("postTimeLabel");
  const postCardEl = document.getElementById("postCard");

  const boardPanel = document.getElementById("boardPanel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const previewPrevCard = document.getElementById("previewPrevCard");
  const previewNextCard = document.getElementById("previewNextCard");
  const previewPrevTitle = document.getElementById("previewPrevTitle");
  const previewNextTitle = document.getElementById("previewNextTitle");

  const categoryChips = Array.from(
    document.querySelectorAll(".category-chip")
  );
  const tickerTrack = document.getElementById("tickerTrack");

  const writeBtn = document.getElementById("writeBtn");
  const editorSheet = document.getElementById("editorSheet");
  const editorCloseBtn = document.getElementById("editorCloseBtn");

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsSheet = document.getElementById("settingsSheet");
  const settingsCloseBtn = document.getElementById("settingsCloseBtn");

  const calendarBtn = document.getElementById("calendarBtn");
  const calendarPanel = document.getElementById("calendarPanel");
  const calendarMonthLabel = document.getElementById("calendarMonthLabel");
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarEventsList = document.getElementById("calendarEventsList");
  const calendarAddPostBtn = document.getElementById("calendarAddPostBtn");
  const calendarPrevMonthBtn = document.getElementById(
    "calendarPrevMonthBtn"
  );
  const calendarNextMonthBtn = document.getElementById(
    "calendarNextMonthBtn"
  );

  const postForm = document.getElementById("postForm");
  const inputTitle = document.getElementById("inputTitle");
  const inputCategory = document.getElementById("inputCategory");
  const inputTarget = document.getElementById("inputTarget");
  const inputBody = document.getElementById("inputBody");
  const inputUntil = document.getElementById("inputUntil");

  const autoPlaySlidesCheckbox = document.getElementById("autoPlaySlides");
  const slideIntervalSelect = document.getElementById("slideIntervalSelect");
  const autoRotateCategoriesCheckbox = document.getElementById(
    "autoRotateCategories"
  );
  const categoryIntervalSelect = document.getElementById(
    "categoryIntervalSelect"
  );

  const categoryOrder = ["all", "club", "committee", "grade"];

  // ---------- 状態 ----------

  let posts = [];
  let settings = {
    autoPlaySlides: true,
    slideIntervalMs: 8000,
    autoRotateCategories: true,
    categoryIntervalMs: 20000,
  };

  let currentCategory = "all";
  let currentIndex = 0;
  let slideTimerId = null;
  let categoryTimerId = null;

  let calendarYear;
  let calendarMonth; // 1〜12
  let calendarSelectedDate = null; // "YYYY-MM-DD"
  let currentPostDate = null; // 現在表示中カードの日付

  // ---------- データロード ----------

  function getDefaultPosts() {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return [
      {
        id: 1,
        category: "all",
        title: "避難訓練のお知らせ",
        target: "全校生徒・教職員",
        body: "今週金曜日、6限終了後に避難訓練を行います。\n\n・持ち物は不要です。\n・教室に荷物を残さず、指示に従って速やかに移動してください。\n・詳細は各クラス担任からの連絡も確認してください。",
        createdAt: todayStr + "T08:00:00",
        until: todayStr,
      },
      {
        id: 2,
        category: "club",
        title: "テニス部 体験入部のお知らせ",
        target: "1年生・テニスに興味がある人",
        body: "テニス部では、来週月〜水の放課後に体験入部を行います！\n\n・ラケット貸出あり、運動できる服装でOK\n・初心者歓迎です。\n・集合場所：テニスコート前\n\n少しでも興味があれば、ぜひ気軽に来てください！",
        createdAt: todayStr + "T09:00:00",
        until: "",
      },
      {
        id: 3,
        category: "committee",
        title: "図書委員より：読み聞かせボランティア募集",
        target: "全学年・図書館利用者",
        body: "図書委員会では、小学校との交流イベントで読み聞かせをしてくれる生徒を募集しています。\n\n・日時：来月第2土曜日 午前中\n・場所：近隣小学校 図書室\n・申込方法：図書室カウンターの申込用紙に記入\n\n人前で話す練習にもなるので、興味のある人はぜひ！",
        createdAt: todayStr + "T10:30:00",
        until: "",
      },
      {
        id: 4,
        category: "grade",
        title: "1年生：数学 小テストの再試について",
        target: "1年生",
        body: "先週実施した数学の小テストで、再試対象となった生徒は今週木曜日放課後に再試を行います。\n\n・場所：1-1教室\n・持ち物：筆記用具、ノート\n・対象者：掲示されている受験者一覧を確認してください。",
        createdAt: todayStr + "T11:15:00",
        until: "",
      },
    ];
  }

  function loadPosts() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          posts = data;
          return;
        }
      }
    } catch (e) {
      console.warn("loadPosts error:", e);
    }
    posts = getDefaultPosts();
  }

  function savePosts() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn("savePosts error:", e);
    }
  }

  function loadSettings() {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        settings = { ...settings, ...data };
      }
    } catch (e) {
      console.warn("loadSettings error:", e);
    }

    autoPlaySlidesCheckbox.checked = !!settings.autoPlaySlides;
    slideIntervalSelect.value = String(settings.slideIntervalMs);
    autoRotateCategoriesCheckbox.checked = !!settings.autoRotateCategories;
    categoryIntervalSelect.value = String(settings.categoryIntervalMs);
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("saveSettings error:", e);
    }
  }

  // ---------- ヘルパー ----------

  function getCategoryLabel(cat) {
    switch (cat) {
      case "club":
        return "部活動";
      case "committee":
        return "委員会";
      case "grade":
        return "各学年";
      case "all":
      default:
        return "全体";
    }
  }

  function getCategoryColor(cat) {
    switch (cat) {
      case "club":
        return "#22c55e";
      case "committee":
        return "#3b82f6";
      case "grade":
        return "#f97316";
      case "all":
      default:
        return "#a855f7";
    }
  }

  // 「全体」は *全投稿* を時系列で流す（バグ修正＆直感優先）
  function getFilteredPosts() {
    if (currentCategory === "all") {
      return posts
        .slice()
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    }

    return posts
      .filter((p) => p.category === currentCategory)
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  }

  function updateCategoryChips() {
    categoryChips.forEach((chip) => {
      const cat = chip.getAttribute("data-category") || "all";
      chip.classList.toggle("active", cat === currentCategory);
    });
  }

  function getPostCalendarDate(post) {
    if (!post) return null;
    if (post.until) return post.until;
    if (post.createdAt) return post.createdAt.slice(0, 10);
    return null;
  }

  // ---------- Ticker ----------

  function renderTicker() {
    if (!tickerTrack) return;
    tickerTrack.innerHTML = "";
    if (!posts.length) return;

    const sorted = posts
      .slice()
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));

    const doubled = sorted.concat(sorted);

    doubled.forEach((post) => {
      const item = document.createElement("button");
      item.className = "ticker-item";
      item.dataset.postId = String(post.id);
      item.style.setProperty(
        "--cat-color",
        getCategoryColor(post.category || "all")
      );

      const dot = document.createElement("span");
      dot.className = "ticker-dot";

      const box = document.createElement("span");
      box.style.display = "flex";
      box.style.flexDirection = "column";
      box.style.gap = "1px";

      const main = document.createElement("span");
      main.className = "ticker-text-main";
      main.textContent = post.title || "(無題)";

      const sub = document.createElement("span");
      sub.className = "ticker-text-sub";
      sub.textContent = `${getCategoryLabel(post.category)} / ${
        post.target || "全校"
      }`;

      box.appendChild(main);
      box.appendChild(sub);

      item.appendChild(dot);
      item.appendChild(box);

      item.addEventListener("click", () => {
        focusPostById(post.id);
      });

      tickerTrack.appendChild(item);
    });

    const seconds = Math.max(25, doubled.length * 4);
    tickerTrack.style.animationDuration = `${seconds}s`;
  }

  function focusPostById(id) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    currentCategory = post.category || "all";
    updateCategoryChips();
    const filtered = getFilteredPosts();
    const idx = filtered.findIndex((p) => p.id === id);
    currentIndex = idx >= 0 ? idx : 0;
    animateCard("left");
    render();
    restartSlideTimer();
    restartCategoryTimer();
  }

  // ---------- プレビューカード（バグ修正込み） ----------

  function updatePreviewCards(filtered) {
    if (!previewPrevCard || !previewNextCard) return;

    const total = filtered.length;

    if (total <= 1) {
      previewPrevCard.classList.remove("show");
      previewNextCard.classList.remove("show");
      return;
    }

    const prevIdx = (currentIndex - 1 + total) % total;
    const nextIdx = (currentIndex + 1) % total;

    const prevPost = filtered[prevIdx];
    const nextPost = filtered[nextIdx];

    // 前
    previewPrevCard.style.setProperty(
      "--cat-color",
      getCategoryColor(prevPost.category || "all")
    );
    previewPrevTitle.textContent = prevPost.title || "(無題)";
    previewPrevCard.classList.add("show");

    // 次
    previewNextCard.style.setProperty(
      "--cat-color",
      getCategoryColor(nextPost.category || "all")
    );
    previewNextTitle.textContent = nextPost.title || "(無題)";
    previewNextCard.classList.add("show");
  }

  // ---------- レンダリング ----------

  function render() {
    const filtered = getFilteredPosts();
    const total = filtered.length;

    if (!filtered.length) {
      postCardEl.style.setProperty(
        "--cat-color",
        getCategoryColor(currentCategory)
      );
      postCategoryPill.textContent = getCategoryLabel(currentCategory);
      postTargetEl.textContent = "—";
      postTitleEl.textContent = "お知らせはまだありません";
      postBodyEl.textContent = "";
      postMetaEl.innerHTML = "";
      emptyMessageEl.style.display = "block";
      postIndexLabelEl.textContent = "0 / 0";
      postTimeLabelEl.textContent = "";
      currentPostDate = null;
      updatePreviewCards([]);
      buildCalendar();
      return;
    }

    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= total) currentIndex = total - 1;

    const post = filtered[currentIndex];

    postCardEl.style.setProperty(
      "--cat-color",
      getCategoryColor(post.category || "all")
    );

    postCategoryPill.textContent = getCategoryLabel(post.category || "all");
    postTargetEl.textContent = post.target || "全校生徒";

    postTitleEl.textContent = post.title || "(無題)";
    postBodyEl.textContent = post.body || "";
    emptyMessageEl.style.display = "none";

    const metaParts = [];
    if (post.createdAt) {
      const d = new Date(post.createdAt);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        metaParts.push(`${y}年${m}月${day}日 掲示`);
      } else {
        metaParts.push(post.createdAt);
      }
    }
    if (post.until) {
      metaParts.push(`〜 ${post.until} まで表示`);
    }

    postMetaEl.innerHTML = "";
    metaParts.forEach((txt) => {
      const span = document.createElement("span");
      span.textContent = txt;
      postMetaEl.appendChild(span);
    });

    postIndexLabelEl.textContent = `${currentIndex + 1} / ${total}`;

    if (post.createdAt) {
      const d = new Date(post.createdAt);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        postTimeLabelEl.textContent = `${hh}:${mm}`;
      } else {
        postTimeLabelEl.textContent = "";
      }
    } else {
      postTimeLabelEl.textContent = "";
    }

    // カードに対応する日付をカレンダーへ伝える
    currentPostDate = getPostCalendarDate(post);
    if (currentPostDate) {
      calendarSelectedDate = currentPostDate;
      const [y, m] = currentPostDate.split("-").map(Number);
      calendarYear = y;
      calendarMonth = m;
    }

    updatePreviewCards(filtered);
    buildCalendar();
  }

  function animateCard(direction) {
    if (!postCardEl) return;
    postCardEl.classList.remove("slide-left", "slide-right");
    void postCardEl.offsetWidth;
    postCardEl.classList.add(direction === "left" ? "slide-left" : "slide-right");
  }

  // ---------- スライド操作 ----------

  function goNext(manual = false) {
    const filtered = getFilteredPosts();
    if (!filtered.length) return;
    currentIndex = (currentIndex + 1) % filtered.length;
    animateCard("left");
    render();
    if (manual) restartSlideTimer();
  }

  function goPrev(manual = false) {
    const filtered = getFilteredPosts();
    if (!filtered.length) return;
    currentIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    animateCard("right");
    render();
    if (manual) restartSlideTimer();
  }

  // ---------- スライドショー＆カテゴリ自動切替 ----------

  function startSlideTimer() {
    stopSlideTimer();
    if (!settings.autoPlaySlides) return;
    const filtered = getFilteredPosts();
    if (filtered.length <= 1) return;

    slideTimerId = window.setInterval(() => {
      goNext(false);
    }, settings.slideIntervalMs);
  }

  function stopSlideTimer() {
    if (slideTimerId !== null) {
      clearInterval(slideTimerId);
      slideTimerId = null;
    }
  }

  function restartSlideTimer() {
    stopSlideTimer();
    startSlideTimer();
  }

  function rotateCategory() {
    let idx = categoryOrder.indexOf(currentCategory);
    if (idx < 0) idx = 0;
    idx = (idx + 1) % categoryOrder.length;
    currentCategory = categoryOrder[idx];
    currentIndex = 0;
    updateCategoryChips();
    animateCard("left");
    render();
    restartSlideTimer();
  }

  function startCategoryTimer() {
    stopCategoryTimer();
    if (!settings.autoRotateCategories) return;
    categoryTimerId = window.setInterval(() => {
      rotateCategory();
    }, settings.categoryIntervalMs);
  }

  function stopCategoryTimer() {
    if (categoryTimerId !== null) {
      clearInterval(categoryTimerId);
      categoryTimerId = null;
    }
  }

  function restartCategoryTimer() {
    stopCategoryTimer();
    startCategoryTimer();
  }

  function setCategory(category) {
    currentCategory = category;
    currentIndex = 0;
    updateCategoryChips();
    animateCard("left");
    render();
    restartSlideTimer();
    restartCategoryTimer();
  }

  // ---------- シート open/close ----------

  function openEditor() {
    // 読書・入力中は自動切り替えしない
    stopSlideTimer();
    stopCategoryTimer();

    editorSheet.classList.add("is-open");
    setTimeout(() => {
      inputTitle.focus();
    }, 60);
  }

  function closeEditor() {
    editorSheet.classList.remove("is-open");
    // 閉じたら再開
    restartSlideTimer();
    restartCategoryTimer();
  }

  function openSettings() {
    stopSlideTimer();
    stopCategoryTimer();
    settingsSheet.classList.add("is-open");
  }

  function closeSettings() {
    settingsSheet.classList.remove("is-open");
    restartSlideTimer();
    restartCategoryTimer();
  }

  // ---------- カレンダー（右パネル） ----------

  function initCalendarState() {
    const now = new Date();
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth() + 1;
    calendarSelectedDate = now.toISOString().slice(0, 10);
  }

  function buildCalendar() {
    if (!calendarGrid || !calendarMonthLabel) return;

    const year = calendarYear;
    const month = calendarMonth;
    calendarMonthLabel.textContent = `${year}年${month}月`;

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    calendarGrid.innerHTML = "";
    weekdays.forEach((w) => {
      const el = document.createElement("div");
      el.className = "calendar-weekday";
      el.textContent = w;
      calendarGrid.appendChild(el);
    });

    const firstDayDate = new Date(year, month - 1, 1);
    const firstDayIndex = firstDayDate.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const eventsByDate = {};
    posts.forEach((post) => {
      const dateStr = getPostCalendarDate(post);
      if (!dateStr) return;
      const [y, m] = dateStr.split("-").map(Number);
      if (y !== year || m !== month) return;
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
      eventsByDate[dateStr].push(post);
    });

    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day empty";
      calendarGrid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      cell.dataset.date = dateStr;

      const num = document.createElement("span");
      num.className = "calendar-day-number";
      num.textContent = String(day);
      cell.appendChild(num);

      const events = eventsByDate[dateStr] || [];
      if (events.length) {
        cell.classList.add("has-events");
        const dotsWrap = document.createElement("div");
        dotsWrap.className = "calendar-dots";
        const catsUsed = new Set();
        for (const ev of events) {
          const cat = ev.category || "all";
          if (catsUsed.has(cat)) continue;
          catsUsed.add(cat);
          const dot = document.createElement("span");
          dot.className = "calendar-dot";
          dot.style.setProperty("--cat-color", getCategoryColor(cat));
          dotsWrap.appendChild(dot);
          if (catsUsed.size >= 4) break;
        }
        cell.appendChild(dotsWrap);
      }

      if (dateStr === calendarSelectedDate) {
        cell.classList.add("selected");
      }
      if (currentPostDate && dateStr === currentPostDate) {
        cell.classList.add("current-post-date");
      }

      cell.addEventListener("click", () => {
        calendarSelectedDate = dateStr;
        buildCalendar();
      });

      calendarGrid.appendChild(cell);
    }

    updateCalendarEventsList();
  }

  function updateCalendarEventsList() {
    if (!calendarEventsList) return;

    const dateStr = calendarSelectedDate;
    calendarEventsList.innerHTML = "";

    if (!dateStr) {
      calendarEventsList.textContent =
        "日付を選択すると、その日の掲示が表示されます。";
      return;
    }

    const events = posts.filter((post) => {
      const d = getPostCalendarDate(post);
      return d === dateStr;
    });

    if (!events.length) {
      calendarEventsList.textContent =
        "この日に登録された掲示はありません。";
      return;
    }

    events
      .slice()
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
      .forEach((post) => {
        const item = document.createElement("div");
        item.className = "calendar-event-item";
        item.style.setProperty(
          "--cat-color",
          getCategoryColor(post.category || "all")
        );

        const dot = document.createElement("span");
        dot.className = "calendar-event-dot";

        const text = document.createElement("div");
        text.className = "calendar-event-text";

        const title = document.createElement("div");
        title.className = "calendar-event-title";
        title.textContent = post.title || "(無題)";

        const meta = document.createElement("div");
        meta.className = "calendar-event-meta";
        meta.textContent = `${getCategoryLabel(post.category)} / ${
          post.target || "全校"
        }`;

        text.appendChild(title);
        text.appendChild(meta);

        item.appendChild(dot);
        item.appendChild(text);

        item.addEventListener("click", () => {
          focusPostById(post.id);
        });

        calendarEventsList.appendChild(item);
      });
  }

  // ---------- イベント登録など ----------

  // 前後ボタン
  prevBtn.addEventListener("click", () => goPrev(true));
  nextBtn.addEventListener("click", () => goNext(true));

  // プレビューカードもタップで移動
  if (previewPrevCard) {
    previewPrevCard.addEventListener("click", () => goPrev(true));
  }
  if (previewNextCard) {
    previewNextCard.addEventListener("click", () => goNext(true));
  }

  // Board：スワイプ操作
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = 0;

  boardPanel.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = Date.now();
    },
    { passive: true }
  );

  boardPanel.addEventListener("touchend", (e) => {
    if (touchStartX === null || touchStartY === null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    touchStartX = null;
    touchStartY = null;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(true);
      else goPrev(true);
      return;
    }

    if (dt < 350 && Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) {
        rotateCategory();
      } else {
        openEditor();
      }
    }
  });

  // カテゴリタップ
  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cat = chip.getAttribute("data-category") || "all";
      setCategory(cat);
    });
  });

  // スワイプヒントから呼ばれるグローバル関数（初回に1枚進める演出）
  window.goToNextCard = function(){
    try { goNext(true); } catch(e) {}
  };

  // ボードホバー中は自動送りを停止／離れたら再開
  boardPanel.addEventListener("mouseenter", () => {
    stopSlideTimer();
  });
  boardPanel.addEventListener("mouseleave", () => {
    restartSlideTimer();
  });

  // 書くシート
  writeBtn.addEventListener("click", openEditor);
  editorCloseBtn.addEventListener("click", closeEditor);
  editorSheet.addEventListener("click", (e) => {
    if (e.target === editorSheet) closeEditor();
  });

  // 設定シート
  settingsBtn.addEventListener("click", openSettings);
  settingsCloseBtn.addEventListener("click", closeSettings);
  settingsSheet.addEventListener("click", (e) => {
    if (e.target === settingsSheet) closeSettings();
  });

  // カレンダー：月移動ボタン
  calendarPrevMonthBtn.addEventListener("click", () => {
    calendarMonth -= 1;
    if (calendarMonth < 1) {
      calendarMonth = 12;
      calendarYear -= 1;
    }
    buildCalendar();
  });

  calendarNextMonthBtn.addEventListener("click", () => {
    calendarMonth += 1;
    if (calendarMonth > 12) {
      calendarMonth = 1;
      calendarYear += 1;
    }
    buildCalendar();
  });

  // カレンダーパネルの左右スワイプで月送り
  if (calendarPanel) {
    let calTouchX = null;
    let calTouchY = null;

    calendarPanel.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        calTouchX = t.clientX;
        calTouchY = t.clientY;
      },
      { passive: true }
    );

    calendarPanel.addEventListener("touchend", (e) => {
      if (calTouchX === null || calTouchY === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - calTouchX;
      const dy = t.clientY - calTouchY;
      calTouchX = null;
      calTouchY = null;

      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          calendarMonth += 1;
          if (calendarMonth > 12) {
            calendarMonth = 1;
            calendarYear += 1;
          }
        } else {
          calendarMonth -= 1;
          if (calendarMonth < 1) {
            calendarMonth = 12;
            calendarYear -= 1;
          }
        }
        buildCalendar();
      }
    });
  }

  // ヘッダーの「カレンダー」ボタン：今日の月＆日へジャンプ
  calendarBtn.addEventListener("click", () => {
    const now = new Date();
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth() + 1;
    calendarSelectedDate = now.toISOString().slice(0, 10);
    buildCalendar();
  });

  // カレンダー右下の「選択した日に掲示を作る」
  calendarAddPostBtn.addEventListener("click", () => {
    if (!calendarSelectedDate) return;
    inputUntil.value = calendarSelectedDate;
    openEditor();
  });

  // 設定変更
  autoPlaySlidesCheckbox.addEventListener("change", () => {
    settings.autoPlaySlides = autoPlaySlidesCheckbox.checked;
    saveSettings();
    restartSlideTimer();
  });

  slideIntervalSelect.addEventListener("change", () => {
    settings.slideIntervalMs = Number(slideIntervalSelect.value) || 8000;
    saveSettings();
    restartSlideTimer();
  });

  autoRotateCategoriesCheckbox.addEventListener("change", () => {
    settings.autoRotateCategories = autoRotateCategoriesCheckbox.checked;
    saveSettings();
    restartCategoryTimer();
  });

  categoryIntervalSelect.addEventListener("change", () => {
    settings.categoryIntervalMs =
      Number(categoryIntervalSelect.value) || 20000;
    saveSettings();
    restartCategoryTimer();
  });

  // 投稿フォーム
  postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = (inputTitle.value || "").trim();
    const category = inputCategory.value || "all";
    const target = (inputTarget.value || "").trim();
    const body = (inputBody.value || "").trim();
    const until = inputUntil.value || "";

    if (!title || !body) return;

    const createdAt = new Date().toISOString();

    const newPost = {
      id: Date.now(),
      category,
      title,
      target,
      body,
      createdAt,
      until,
    };

    posts.push(newPost);
    savePosts();

    inputTitle.value = "";
    inputCategory.value = "club";
    inputTarget.value = "";
    inputBody.value = "";
    inputUntil.value = "";

    closeEditor();

    focusPostById(newPost.id);
    renderTicker();
    // render() 内で buildCalendar が呼ばれる
  });

  // ---------- 初期化 ----------

  loadSettings();
  loadPosts();
  initCalendarState();
  updateCategoryChips();
  renderTicker();
  render();
  startSlideTimer();
  startCategoryTimer();
})();
