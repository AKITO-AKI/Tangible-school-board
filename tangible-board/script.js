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
  const boardDotsEl = document.getElementById("boardDots");
  const nextPeekBtn = document.getElementById("nextPeekBtn");
  const nextPeekTitleEl = document.getElementById("nextPeekTitle");
  const nextPeekMetaEl = document.getElementById("nextPeekMeta");

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

  const metricTotalPosts = document.getElementById("metricTotalPosts");
  const metricTotalMeta = document.getElementById("metricTotalMeta");
  const metricTodayPosts = document.getElementById("metricTodayPosts");
  const metricTodayMeta = document.getElementById("metricTodayMeta");
  const metricExpiringPosts = document.getElementById("metricExpiringPosts");
  const metricExpiringMeta = document.getElementById("metricExpiringMeta");
  const metricActiveCategories = document.getElementById(
    "metricActiveCategories"
  );
  const metricCategoryMeta = document.getElementById("metricCategoryMeta");

  const boardContextLabel = document.getElementById("boardContextLabel");
  const recentPostsList = document.getElementById("recentPostsList");
  const dashboardEmpty = document.getElementById("dashboardEmpty");
  const upcomingList = document.getElementById("upcomingList");
  const upcomingEmpty = document.getElementById("upcomingEmpty");
  const categoryBreakdownEl = document.getElementById("categoryBreakdown");

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
    const dateKey = (offsetDays = 0) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };
    const iso = (offsetDays = 0, time = "09:00") =>
      `${dateKey(offsetDays)}T${time}:00`;

    return [
      {
        id: 1,
        category: "club",
        title: "テニス部 モーニングラリー体験",
        target: "1年生・ラケットスポーツ希望者",
        body: "来週の公式戦に向け、朝練体験を開放します。\n\n・日時：火曜・木曜 7:15集合\n・場所：第1テニスコート\n・貸し出しラケットあり、体操服で参加可能です。",
        createdAt: iso(-8, "07:45"),
        until: dateKey(2),
      },
      {
        id: 2,
        category: "committee",
        title: "図書委員 読み聞かせリハーサル",
        target: "図書委員・朗読担当者",
        body: "交流先小学校での読み聞かせに向けた練習を実施します。\n\n・日時：今週金曜 16:00〜\n・会場：図書室 奥スペース\n・原稿チェックは当日13:00までに提出してください。",
        createdAt: iso(-5, "12:20"),
        until: dateKey(0),
      },
      {
        id: 3,
        category: "all",
        title: "生活安全週間スタート",
        target: "全校生徒・教職員",
        body: "今週は生活安全週間です。登下校のマナーや校内での安全行動を改めて確認してください。\n\n・期間：今週月曜〜金曜\n・生徒指導部からの配布資料をホームルームで確認\n・気づいた点は生活委員または教職員へ共有してください。",
        createdAt: iso(-2, "08:05"),
        until: dateKey(5),
      },
      {
        id: 4,
        category: "grade",
        title: "1年生：理科見学レポート提出",
        target: "1年生",
        body: "理科見学のレポートは指定フォーマットで提出してください。\n\n・提出先：理科準備室前ポスト\n・締切：今週水曜 17:00\n・未提出者は担任へ相談してください。",
        createdAt: iso(-1, "13:10"),
        until: dateKey(1),
      },
      {
        id: 5,
        category: "all",
        title: "全校朝礼：配布アンケートの提出",
        target: "全校生徒",
        body: "全校朝礼で配布した改善アンケートはクラス委員が回収します。\n\n・提出期限：明日の朝ホームルーム\n・未提出者は昼休みに職員室へ届けてください。\n・質問は生活指導室まで。",
        createdAt: iso(1, "09:00"),
        until: dateKey(2),
      },
      {
        id: 6,
        category: "club",
        title: "吹奏楽部 ホールリハーサル日程",
        target: "吹奏楽部",
        body: "定期演奏会に向けてホールリハーサルを行います。\n\n・日時：来週月曜 17:00集合\n・会場：市民文化ホール リハーサル室\n・持ち物：楽器一式と譜面ファイル\n開始30分前までに音出しを済ませてください。",
        createdAt: iso(3, "16:30"),
        until: dateKey(10),
      },
      {
        id: 7,
        category: "committee",
        title: "環境委員 クリーンデイ担当区域",
        target: "環境委員会",
        body: "6月分の清掃担当エリアを更新しました。\n\n・第1週：昇降口周辺\n・第2週：中庭と温室\n・第3週：特別教室棟\n・第4週：体育館裏通路\n担当班は前日の終礼で確認してください。",
        createdAt: iso(4, "15:10"),
        until: dateKey(14),
      },
      {
        id: 8,
        category: "grade",
        title: "2年生：職場体験 事前ミーティング",
        target: "2年生",
        body: "職場体験に向けた事前ミーティングを実施します。\n\n・日時：来週水曜 15:40〜\n・場所：視聴覚室\n・持ち物：配布済みワークシートと筆記用具\n・グループ発表の担当割を決定します。",
        createdAt: iso(6, "07:50"),
        until: dateKey(20),
      },
      {
        id: 9,
        category: "all",
        title: "スクールカフェ 勉強サポートデイ",
        target: "全校生徒",
        body: "試験前の放課後に学習サポートスペースを開放します。\n\n・期間：来週月〜木 16:00〜19:00\n・場所：生徒ホール特設席\n・軽食とドリンクを先着順で提供します。",
        createdAt: iso(9, "11:00"),
        until: dateKey(12),
      },
      {
        id: 10,
        category: "club",
        title: "美術部 オープンアトリエ",
        target: "美術部・アートに興味がある人",
        body: "外部講師を招いた公開制作を行います。\n\n・日時：来週土曜 13:00〜16:00\n・体験内容：アクリル画と作品講評\n・汚れてもよい服装で参加してください。",
        createdAt: iso(12, "14:00"),
        until: dateKey(14),
      },
      {
        id: 11,
        category: "committee",
        title: "生徒会：模擬国連参加者募集",
        target: "全学年・興味のある人",
        body: "夏休みの模擬国連オンライン大会に参加する代表生徒を募集します。\n\n・応募締切：今月末\n・応募方法：生徒会メールフォームより\n・説明会：今月20日 17:00 生徒会室\nディベート経験がなくても歓迎します。",
        createdAt: iso(15, "08:40"),
        until: dateKey(30),
      },
      {
        id: 12,
        category: "grade",
        title: "3年生：進路面談準備会",
        target: "3年生",
        body: "進路面談で使用する自己分析シートの書き方を共有します。\n\n・日時：来週金曜 16:10〜\n・場所：進路指導室\n・配布資料を事前に記入しておくとスムーズです。",
        createdAt: iso(18, "10:15"),
        until: dateKey(25),
      },
      {
        id: 13,
        category: "all",
        title: "地域清掃ボランティア募集",
        target: "全校生徒・希望者",
        body: "地域連携推進会が朝の清掃活動に参加する生徒を募集中です。\n\n・実施日：来月第1土曜 7:30集合\n・集合場所：正門前\n・持ち物：軍手、動きやすい服装\n参加希望者は総務部前の申込用紙に記入してください。",
        createdAt: iso(24, "08:20"),
        until: dateKey(32),
      },
      {
        id: 14,
        category: "club",
        title: "陸上部 夏合宿説明会",
        target: "陸上部員・マネージャー",
        body: "夏合宿の参加可否を確認します。\n\n・日時：来月18日 17:20〜\n・場所：第二会議室\n・提出物：保護者同意書の下書き\nマネージャーも参加してください。",
        createdAt: iso(27, "17:20"),
        until: dateKey(34),
      },
      {
        id: 15,
        category: "club",
        title: "サイエンス部 星見の集い",
        target: "サイエンス部・天文に興味がある人",
        body: "夏の星座観察会を校庭で実施します。\n\n・日時：来月15日 19:30集合\n・参加対象：サイエンス部と参加希望生徒\n・望遠鏡は学校で準備しますが、防寒具を持参してください。",
        createdAt: iso(30, "17:00"),
        until: dateKey(31),
      },
      {
        id: 16,
        category: "committee",
        title: "保健委員 健康測定講習",
        target: "保健委員・クラス健康担当",
        body: "新しい体組成計の使い方講習を行います。\n\n・日時：来月20日 16:00〜\n・場所：保健室\n・各クラス2名は参加必須です。\n欠席の場合は代理を立ててください。",
        createdAt: iso(35, "09:30"),
        until: dateKey(37),
      },
      {
        id: 17,
        category: "grade",
        title: "1年生：夏の林間学校説明会",
        target: "1年生・保護者",
        body: "林間学校の行程と班編成を説明します。\n\n・日時：来月25日 15:30〜\n・場所：体育館\n・提出物：健康調査票（当日回収）\n保護者向け資料も配布します。",
        createdAt: iso(42, "15:40"),
        until: dateKey(45),
      },
      {
        id: 18,
        category: "all",
        title: "図書館 ナイトスタディデイ",
        target: "全校生徒・自習希望者",
        body: "テスト直前週に図書館を21時まで開放します。\n\n・期間：来月最終週の水・金曜\n・入退室記録を必ず記入\n・軽食と飲み物は指定のエリアでのみ可\n静かな学習環境づくりに協力してください。",
        createdAt: iso(50, "12:15"),
        until: dateKey(52),
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

  // ---------- ボード補助UI（ドット & 次の掲示） ----------

  function updateBoardSupport(filtered) {
    if (!boardDotsEl || !nextPeekBtn || !nextPeekTitleEl || !nextPeekMetaEl) {
      return;
    }

    boardDotsEl.innerHTML = "";
    const total = filtered.length;

    if (!total) {
      nextPeekBtn.disabled = true;
      nextPeekBtn.setAttribute("aria-disabled", "true");
      nextPeekBtn.setAttribute("aria-label", "次の掲示はありません");
      nextPeekTitleEl.textContent = "—";
      nextPeekMetaEl.textContent = "他の掲示はありません";
      return;
    }

    const activeIndex = Math.min(Math.max(currentIndex, 0), total - 1);

    filtered.forEach((post, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "board-dot";
      if (idx === activeIndex) {
        dot.classList.add("is-active");
        dot.setAttribute("aria-current", "true");
      }
      dot.setAttribute(
        "aria-label",
        `${idx + 1}件目: ${post.title || "(無題)"}`
      );
      dot.style.setProperty(
        "--dot-color",
        getCategoryColor(post.category || "all")
      );
      dot.addEventListener("click", () => {
        goToIndex(idx);
      });
      boardDotsEl.appendChild(dot);
    });

    if (total <= 1) {
      nextPeekBtn.disabled = true;
      nextPeekBtn.setAttribute("aria-disabled", "true");
      nextPeekBtn.setAttribute("aria-label", "次の掲示はありません");
      nextPeekTitleEl.textContent = "—";
      nextPeekMetaEl.textContent = "他の掲示はありません";
      return;
    }

    const nextIndex = (activeIndex + 1) % total;
    const nextPost = filtered[nextIndex];

    nextPeekBtn.disabled = false;
    nextPeekBtn.removeAttribute("aria-disabled");
    nextPeekBtn.setAttribute(
      "aria-label",
      `${nextIndex + 1}件目へ移動: ${nextPost.title || "(無題)"}`
    );
    nextPeekTitleEl.textContent = nextPost.title || "(無題)";
    nextPeekMetaEl.textContent = `${getCategoryLabel(
      nextPost.category || "all"
    )} ・ ${nextPost.target || "全校"}`;
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

  const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
  const MS_IN_DAY = 24 * 60 * 60 * 1000;

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function getDateKeyFromISO(iso) {
    if (!iso || iso.length < 10) return "";
    return iso.slice(0, 10);
  }

  function formatDateKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getTodayKey() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return formatDateKey(now);
  }

  function parseLocalDate(str) {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
    const dt = new Date(y, m, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  function formatDateJP(str) {
    const dt = parseLocalDate(str);
    if (!dt) return str || "";
    const label = `${dt.getMonth() + 1}/${dt.getDate()}`;
    const weekday = WEEKDAY_LABELS[dt.getDay()] || "";
    return `${label}(${weekday})`;
  }

  function formatDateTimeLabel(iso) {
    if (!iso) return "";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "";
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${month}/${day} ${hh}:${mm}`;
  }

  function describeDueDifference(targetStr, baseStr) {
    const target = parseLocalDate(targetStr);
    const base = parseLocalDate(baseStr);
    if (!target || !base) return "";
    const diffDays = Math.round(
      (target.setHours(0, 0, 0, 0) - base.setHours(0, 0, 0, 0)) / MS_IN_DAY
    );
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}日前に締切超過`;
    }
    if (diffDays === 0) return "今日が期限";
    if (diffDays === 1) return "明日まで";
    if (diffDays <= 7) return `${diffDays}日後に締切`;
    return `${diffDays}日後`;
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
  function updateDashboardPanels(filtered) {
    const totalPosts = posts.length;
    const todayKey = getTodayKey();
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartKey = formatDateKey(weekStart);

    let todayCount = 0;
    let weekCount = 0;
    let latestTodayIso = "";
    const activeCategories = new Set();

    for (const post of posts) {
      const cat = post.category || "all";
      activeCategories.add(cat);

      const createdKey = getDateKeyFromISO(post.createdAt || "");
      if (!createdKey) continue;

      if (createdKey === todayKey) {
        todayCount += 1;
        if (!latestTodayIso || (post.createdAt || "") > latestTodayIso) {
          latestTodayIso = post.createdAt || latestTodayIso;
        }
      }

      if (createdKey >= weekStartKey && createdKey <= todayKey) {
        weekCount += 1;
      }
    }

    setText(metricTotalPosts, String(totalPosts));
    if (metricTotalMeta) {
      metricTotalMeta.textContent = totalPosts
        ? `直近7日：${weekCount}件追加`
        : "掲示はまだありません";
    }

    setText(metricTodayPosts, String(todayCount));
    if (metricTodayMeta) {
      if (todayCount > 0) {
        const latestLabel = formatDateTimeLabel(latestTodayIso);
        metricTodayMeta.textContent = latestLabel
          ? `${latestLabel} 更新`
          : "今日登録された掲示";
      } else {
        metricTodayMeta.textContent = "新しい掲示はありません";
      }
    }

    const todayDate = parseLocalDate(todayKey);
    const upcomingThreshold = todayDate
      ? new Date(todayDate.getTime() + 7 * MS_IN_DAY)
      : null;

    const upcoming = posts
      .map((post) => ({
        post,
        dueKey: post.until || "",
        dueDate: parseLocalDate(post.until || ""),
      }))
      .filter((item) => item.dueDate && todayDate && item.dueDate >= todayDate)
      .filter((item) =>
        upcomingThreshold ? item.dueDate <= upcomingThreshold : true
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));

    setText(metricExpiringPosts, String(upcoming.length));
    if (metricExpiringMeta) {
      metricExpiringMeta.textContent = upcoming.length
        ? `${formatDateJP(upcoming[0].dueKey)} まで`
        : "7日以内の締切なし";
    }

    setText(metricActiveCategories, String(activeCategories.size));
    if (metricCategoryMeta) {
      metricCategoryMeta.textContent = totalPosts
        ? `${activeCategories.size} / 4カテゴリ稼働中`
        : "全カテゴリ未稼働";
    }

    if (boardContextLabel) {
      if (!filtered.length) {
        boardContextLabel.textContent = `${getCategoryLabel(
          currentCategory
        )}カテゴリの掲示はありません`;
      } else {
        const label = getCategoryLabel(currentCategory);
        boardContextLabel.textContent = `${label} / ${filtered.length}件中 ${
          Math.min(currentIndex + 1, filtered.length)
        }件目`;
      }
    }

    renderRecentPosts();
    renderUpcomingTimeline(upcoming, todayKey);
    renderCategoryBreakdown(totalPosts);
  }

  function renderRecentPosts() {
    if (!recentPostsList) return;

    recentPostsList.innerHTML = "";
    const sorted = posts
      .slice()
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    const subset = sorted.slice(0, 5);

    if (!subset.length) {
      recentPostsList.style.display = "none";
      if (dashboardEmpty) dashboardEmpty.style.display = "block";
      return;
    }

    recentPostsList.style.display = "";
    if (dashboardEmpty) dashboardEmpty.style.display = "none";

    subset.forEach((post) => {
      const listItem = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "insight-item";
      button.dataset.postId = String(post.id);
      button.style.setProperty(
        "--cat-color",
        getCategoryColor(post.category || "all")
      );

      const header = document.createElement("div");
      header.className = "insight-row-header";

      const headerLeft = document.createElement("div");
      headerLeft.style.display = "flex";
      headerLeft.style.alignItems = "center";
      headerLeft.style.gap = "8px";

      const dot = document.createElement("span");
      dot.className = "insight-dot";
      const title = document.createElement("span");
      title.textContent = post.title || "(無題)";

      headerLeft.appendChild(dot);
      headerLeft.appendChild(title);
      header.appendChild(headerLeft);

      const updatedAt = formatDateTimeLabel(post.createdAt || "");
      if (updatedAt) {
        const time = document.createElement("span");
        time.className = "insight-row-time";
        time.textContent = updatedAt;
        header.appendChild(time);
      }

      const meta = document.createElement("div");
      meta.className = "insight-row-meta";
      meta.textContent = `${getCategoryLabel(post.category || "all")} ・ ${
        post.target || "全校"
      }`;

      const footer = document.createElement("div");
      footer.className = "insight-row-footer";
      footer.textContent = post.until
        ? `${formatDateJP(post.until)} まで`
        : "期限なし";

      button.appendChild(header);
      button.appendChild(meta);
      button.appendChild(footer);

      button.addEventListener("click", () => {
        focusPostById(post.id);
      });

      listItem.appendChild(button);
      recentPostsList.appendChild(listItem);
    });
  }

  function renderUpcomingTimeline(upcoming, todayKey) {
    if (!upcomingList) return;

    upcomingList.innerHTML = "";

    if (!upcoming.length) {
      upcomingList.style.display = "none";
      if (upcomingEmpty) upcomingEmpty.style.display = "block";
      return;
    }

    upcomingList.style.display = "";
    if (upcomingEmpty) upcomingEmpty.style.display = "none";

    upcoming.slice(0, 6).forEach(({ post, dueKey }) => {
      const listItem = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "insight-item";
      button.style.setProperty(
        "--cat-color",
        getCategoryColor(post.category || "all")
      );

      const header = document.createElement("div");
      header.className = "insight-row-header";

      const headerLeft = document.createElement("div");
      headerLeft.style.display = "flex";
      headerLeft.style.alignItems = "center";
      headerLeft.style.gap = "8px";

      const dot = document.createElement("span");
      dot.className = "insight-dot";
      const title = document.createElement("span");
      title.textContent = post.title || "(無題)";
      headerLeft.append(dot, title);
      header.appendChild(headerLeft);

      const dueLabel = formatDateJP(dueKey);
      if (dueLabel) {
        const due = document.createElement("span");
        due.className = "insight-row-time";
        due.textContent = dueLabel;
        header.appendChild(due);
      }

      const meta = document.createElement("div");
      meta.className = "insight-row-meta";
      meta.textContent = `${getCategoryLabel(post.category || "all")} ・ ${
        post.target || "全校"
      }`;

      const footer = document.createElement("div");
      footer.className = "insight-row-footer";
      footer.textContent = describeDueDifference(dueKey, todayKey) || "";

      button.append(header, meta, footer);

      button.addEventListener("click", () => {
        focusPostById(post.id);
      });

      listItem.appendChild(button);
      upcomingList.appendChild(listItem);
    });
  }

  function renderCategoryBreakdown(totalPosts) {
    if (!categoryBreakdownEl) return;

    categoryBreakdownEl.innerHTML = "";

    if (!totalPosts) {
      const empty = document.createElement("p");
      empty.className = "panel-empty";
      empty.textContent = "掲示が登録されるとカテゴリ内訳が表示されます。";
      categoryBreakdownEl.appendChild(empty);
      return;
    }

    const categories = [
      { id: "all", label: getCategoryLabel("all") },
      { id: "club", label: getCategoryLabel("club") },
      { id: "committee", label: getCategoryLabel("committee") },
      { id: "grade", label: getCategoryLabel("grade") },
    ];

    const counts = new Map();
    categories.forEach((cat) => counts.set(cat.id, 0));

    posts.forEach((post) => {
      const cat = post.category || "all";
      if (!counts.has(cat)) {
        counts.set(cat, 0);
        categories.push({ id: cat, label: getCategoryLabel(cat) });
      }
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });

    categories.forEach((cat) => {
      const count = counts.get(cat.id) || 0;
      const rawPercent = totalPosts ? (count / totalPosts) * 100 : 0;
      const percentLabel =
        rawPercent <= 0
          ? "0"
          : rawPercent >= 10
          ? rawPercent.toFixed(0)
          : rawPercent.toFixed(1);
      const row = document.createElement("div");
      row.className = "category-breakdown-row";

      const head = document.createElement("div");
      head.className = "category-breakdown-head";

      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "8px";

      const dot = document.createElement("span");
      dot.className = "insight-dot";
      dot.style.setProperty("--cat-color", getCategoryColor(cat.id));

      const label = document.createElement("span");
      label.textContent = cat.label;

      left.append(dot, label);

      const value = document.createElement("span");
      value.textContent = `${count}件 (${percentLabel}%)`;

      head.append(left, value);

      const bar = document.createElement("div");
      bar.className = "category-breakdown-bar";

      const barInner = document.createElement("span");
      const width = rawPercent > 0 ? Math.max(rawPercent, 6) : 0;
      barInner.style.width = `${Math.min(width, 100)}%`;
      const color = getCategoryColor(cat.id);
      barInner.style.background = `linear-gradient(90deg, ${color}, ${color})`;

      bar.appendChild(barInner);
      row.append(head, bar);

      categoryBreakdownEl.appendChild(row);
    });
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
      updateBoardSupport([]);
      buildCalendar();
      updateDashboardPanels(filtered);
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

    updateBoardSupport(filtered);
    buildCalendar();
    updateDashboardPanels(filtered);
  }

  function animateCard(direction) {
    if (!postCardEl) return;
    postCardEl.classList.remove("slide-left", "slide-right");
    void postCardEl.offsetWidth;
    postCardEl.classList.add(direction === "left" ? "slide-left" : "slide-right");
  }

  // ---------- スライド操作 ----------

  function goToIndex(targetIndex, manual = true) {
    const filtered = getFilteredPosts();
    if (!filtered.length) return;
    const total = filtered.length;
    const clamped = Math.max(0, Math.min(targetIndex, total - 1));
    const previous = currentIndex;
    if (clamped === previous) return;
    currentIndex = clamped;
    animateCard(clamped > previous ? "left" : "right");
    render();
    if (manual) restartSlideTimer();
  }

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

  if (nextPeekBtn) {
    nextPeekBtn.addEventListener("click", () => goNext(true));
  }

  // Board：スワイプ操作
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = 0;

  if (boardPanel) {
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

    boardPanel.addEventListener("mouseenter", () => {
      stopSlideTimer();
    });
    boardPanel.addEventListener("mouseleave", () => {
      restartSlideTimer();
    });
  }

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
