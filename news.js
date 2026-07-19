/**
 * TTN — модуль новин
 * Агрегує реальні RSS-стрічки (через rss2json.com), показує
 * заголовок + короткий опис ІЗ ДЖЕРЕЛА + посилання на оригінал.
 * Ніякого автоматичного "рерайту" — лише агрегація з атрибуцією.
 */
const TTNNews = (() => {
  let allItems = [];

  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return (tmp.textContent || tmp.innerText || "").trim();
  }

  function detectTickers(text) {
    const lower = text.toLowerCase();
    const found = [];
    TTN_CONFIG.TICKER_DICTIONARY.forEach((entry) => {
      const hit = entry.match.some((kw) => lower.includes(kw));
      if (hit && !found.some((f) => f.label === entry.label)) {
        found.push(entry);
      }
    });
    return found.slice(0, 5);
  }

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} хв тому`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} год тому`;
    return `${Math.floor(hrs / 24)} дн тому`;
  }

  async function fetchFeed(feed) {
    const proxy = "https://api.rss2json.com/v1/api.json";
    const keyParam = TTN_CONFIG.RSS2JSON_KEY ? `&api_key=${TTN_CONFIG.RSS2JSON_KEY}` : "";
    const url = `${proxy}?rss_url=${encodeURIComponent(feed.url)}${keyParam}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "ok") return [];
      return data.items.map((item) => ({
        title: item.title,
        desc: stripHtml(item.description).slice(0, 220),
        link: item.link,
        image: item.thumbnail || item.enclosure?.link || null,
        pubDate: item.pubDate,
        source: feed.name,
      }));
    } catch (e) {
      return [];
    }
  }

  async function fetchFinnhub() {
    if (!TTN_CONFIG.FINNHUB_KEY) return [];
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${TTN_CONFIG.FINNHUB_KEY}`
      );
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.slice(0, 25).map((item) => ({
        title: item.headline,
        desc: stripHtml(item.summary || "").slice(0, 220),
        link: item.url,
        image: item.image || null,
        pubDate: new Date(item.datetime * 1000).toISOString(),
        source: item.source ? `Finnhub · ${item.source}` : "Finnhub",
      }));
    } catch (e) {
      return [];
    }
  }

  function tickerTagsHtml(item) {
    const tickers = detectTickers(`${item.title} ${item.desc}`);
    if (!tickers.length) return "";
    return `<div class="article-tickers">${tickers
      .map((t) => `<span class="article-ticker-tag" data-tv="${t.tvSymbol}" data-label="${t.label}">${t.label}</span>`)
      .join("")}</div>`;
  }

  function attachTagHandlers(root) {
    root.querySelectorAll(".article-ticker-tag").forEach((tag) => {
      tag.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        TTNChart.open(tag.dataset.tv, tag.dataset.label);
        document.getElementById("chart-panel")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function renderFeatured(item) {
    const el = document.getElementById("featured-article");
    if (!item) {
      el.innerHTML = `<div class="featured-body"><p>Немає доступних новин. Перевірте підключення до інтернету.</p></div>`;
      return;
    }
    el.innerHTML = `
      ${item.image ? `<img class="featured-img" src="${item.image}" alt="">` : ""}
      <div class="featured-body">
        <div class="featured-meta"><span class="source">${item.source}</span> · ${timeAgo(item.pubDate)}</div>
        <h1><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h1>
        <p class="dek">${item.desc}${item.desc.length >= 220 ? "…" : ""}</p>
        ${tickerTagsHtml(item)}
        <p style="margin-top:12px;"><a href="${item.link}" target="_blank" rel="noopener" style="color:var(--accent);font-size:13px;">Читати оригінал статті →</a></p>
      </div>`;
    attachTagHandlers(el);
  }

  function renderFeed(items) {
    const el = document.getElementById("news-feed");
    if (!items.length) {
      el.innerHTML = `<p style="color:var(--text-dim);">Новини тимчасово недоступні.</p>`;
      return;
    }
    el.innerHTML = items
      .map(
        (item) => `
      <article class="news-item">
        <div class="news-meta"><span class="source">${item.source}</span><span>${timeAgo(item.pubDate)}</span></div>
        <h3><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h3>
        <p>${item.desc}${item.desc.length >= 220 ? "…" : ""}</p>
        ${tickerTagsHtml(item)}
      </article>`
      )
      .join("");
    attachTagHandlers(el);
  }

  function renderTrending() {
    const counts = {};
    allItems.forEach((item) => {
      detectTickers(`${item.title} ${item.desc}`).forEach((t) => {
        counts[t.label] = (counts[t.label] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const el = document.getElementById("trending-list");
    if (!sorted.length) {
      el.innerHTML = `<li style="color:var(--text-faint);font-size:13px;">Поки що немає даних</li>`;
      return;
    }
    el.innerHTML = sorted
      .map(([label, count]) => {
        const entry = TTN_CONFIG.TICKER_DICTIONARY.find((d) => d.label === label);
        return `<li><a href="#" class="trending-tag" data-tv="${entry.tvSymbol}" data-label="${label}">${label} <span style="color:var(--text-faint);">· ${count} згадок</span></a></li>`;
      })
      .join("");
    el.querySelectorAll(".trending-tag").forEach((tag) => {
      tag.addEventListener("click", (e) => {
        e.preventDefault();
        TTNChart.open(tag.dataset.tv, tag.dataset.label);
      });
    });
  }

  function applySearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      renderFeatured(allItems[0]);
      renderFeed(allItems.slice(1));
      return;
    }
    const filtered = allItems.filter((item) => {
      const tickers = detectTickers(`${item.title} ${item.desc}`).map((t) => t.label.toLowerCase());
      return (
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        tickers.some((t) => t.includes(q))
      );
    });
    renderFeatured(filtered[0]);
    renderFeed(filtered.slice(1));
  }

  async function init() {
    const [feedResults, finnhubResults] = await Promise.all([
      Promise.all(TTN_CONFIG.NEWS_FEEDS.map(fetchFeed)),
      fetchFinnhub(),
    ]);
    allItems = [...feedResults.flat(), ...finnhubResults]
      .filter((i) => i.title)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    if (!allItems.length) {
      allItems = fallbackItems();
    }

    renderFeatured(allItems[0]);
    renderFeed(allItems.slice(1, 13));
    renderTrending();

    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", (e) => applySearch(e.target.value));
  }

  function fallbackItems() {
    // Показується лише якщо всі RSS-джерела недоступні (напр. немає мережі)
    const now = new Date().toISOString();
    return [
      {
        title: "Новини тимчасово недоступні",
        desc: "Не вдалося завантажити фінансові новини. Перевірте підключення до інтернету або налаштування RSS-джерел у js/config.js.",
        link: "#",
        image: null,
        pubDate: now,
        source: "TTN",
      },
    ];
  }

  return { init, applySearch };
})();
