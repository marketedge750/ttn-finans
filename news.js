/**
 * TTN — news module
 * Aggregates real RSS feeds (via rss2json.com) plus Finnhub, shows
 * headline + short excerpt FROM THE SOURCE + a link to the original.
 * No automatic "rewriting" — aggregation with attribution only.
 */
const TTNNews = (() => {
  let allItems = [];
  let itemsIndex = {}; // link -> item, used to open the in-site modal
  const tickerPriceCache = {}; // label -> changePct (number) | null

  async function resolveTickerPrices(items) {
    const needed = new Map(); // label -> dictionary entry
    items.forEach((item) => {
      detectTickers(`${item.title} ${item.desc}`).forEach((entry) => {
        if (!(entry.label in tickerPriceCache) && !needed.has(entry.label)) {
          needed.set(entry.label, entry);
        }
      });
    });
    if (!needed.size) return;

    const coingeckoIds = [];
    const finnhubEntries = [];

    needed.forEach((entry, label) => {
      if (entry.trackedId) {
        const pct = TTNTickers.getChangePct(entry.trackedId);
        tickerPriceCache[label] = pct;
      } else if (entry.coingeckoId) {
        coingeckoIds.push(entry);
      } else if (TTN_CONFIG.FINNHUB_KEY) {
        finnhubEntries.push(entry);
      } else {
        tickerPriceCache[label] = null; // no data source available — chip shows without %
      }
    });

    if (coingeckoIds.length) {
      try {
        const ids = coingeckoIds.map((e) => e.coingeckoId).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await res.json();
        coingeckoIds.forEach((e) => {
          tickerPriceCache[e.label] = data[e.coingeckoId]?.usd_24h_change ?? null;
        });
      } catch (e) {
        coingeckoIds.forEach((e) => (tickerPriceCache[e.label] = null));
      }
    }

    if (finnhubEntries.length) {
      const symbol = (tv) => tv.split(":")[1]?.replace(".", "-") || tv;
      await Promise.all(
        finnhubEntries.slice(0, 8).map(async (e) => {
          try {
            const res = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol(e.tvSymbol))}&token=${TTN_CONFIG.FINNHUB_KEY}`
            );
            const data = await res.json();
            tickerPriceCache[e.label] = typeof data.dp === "number" ? data.dp : null;
          } catch (err) {
            tickerPriceCache[e.label] = null;
          }
        })
      );
    }
  }

  function ensureModal() {
    let modal = document.getElementById("news-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "news-modal";
    modal.className = "news-modal";
    modal.innerHTML = `
      <div class="news-modal-overlay" id="news-modal-overlay"></div>
      <div class="news-modal-panel">
        <button class="news-modal-close" id="news-modal-close" aria-label="Close">×</button>
        <div id="news-modal-body"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector("#news-modal-overlay").addEventListener("click", closeModal);
    modal.querySelector("#news-modal-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
    return modal;
  }

  function closeModal() {
    const modal = document.getElementById("news-modal");
    if (modal) modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  function openModal(link) {
    const item = itemsIndex[link];
    if (!item) return;
    const modal = ensureModal();
    document.getElementById("news-modal-body").innerHTML = `
      ${thumbHtml(item, "lg")}
      <div class="news-modal-meta"><span class="source">${item.source}</span> · ${timeAgo(item.pubDate)}</div>
      <h2>${item.title}</h2>
      <p>${item.desc}${item.desc.length >= 220 ? "…" : ""}</p>
      ${tickerTagsHtml(item)}
      <a href="${item.link}" target="_blank" rel="noopener" class="news-modal-source-link">Read full article on ${item.source} →</a>
      <p class="news-modal-note">We show the original headline and a short excerpt with full attribution. The complete article stays on the publisher's own site, in line with copyright and licensing terms.</p>
    `;
    attachTagHandlers(modal);
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }

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
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} d ago`;
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
      .map((t) => {
        const pct = tickerPriceCache[t.label];
        const pctHtml =
          typeof pct === "number"
            ? `<span class="${pct >= 0 ? "up" : "down"}">${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%</span>`
            : "";
        return `<span class="article-ticker-tag" data-tv="${t.tvSymbol}" data-label="${t.label}"><b>${t.label}</b>${pctHtml}</span>`;
      })
      .join("")}</div>`;
  }

  const TREND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,17 9,11 13,15 21,5"/><polyline points="15,5 21,5 21,11"/></svg>`;

  function categoryFor(item) {
    const tickers = detectTickers(`${item.title} ${item.desc}`);
    if (!tickers.length) return "general";
    const sym = tickers[0].tvSymbol;
    if (sym.startsWith("BINANCE:")) return "crypto";
    if (sym.startsWith("FX:")) return "forex";
    if (sym === "TVC:GOLD" || sym === "TVC:USOIL") return "gold";
    return "stocks";
  }

  function thumbHtml(item, size) {
    const cls = size === "lg" ? "featured-img" : "news-item-thumb";
    if (item.image) {
      return `<img class="${cls}" src="${item.image}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${
        size === "lg" ? "featured-img" : "news-item-thumb-fallback"
      } thumb-${categoryFor(item)}',innerHTML:'${TREND_ICON.replace(/'/g, "\\'")}'}))">`;
    }
    const fallbackCls = size === "lg" ? "featured-img" : "news-item-thumb-fallback";
    return `<div class="${fallbackCls} thumb-${categoryFor(item)}">${TREND_ICON}</div>`;
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

  function attachOpenHandlers(root) {
    root.querySelectorAll(".open-article").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(link.dataset.link);
      });
    });
  }

  function indexItems(items) {
    items.forEach((item) => {
      itemsIndex[item.link] = item;
    });
  }

  function renderFeatured(item) {
    const el = document.getElementById("featured-article");
    if (!item) {
      el.innerHTML = `<div class="featured-body"><p>No news available right now. Please check your internet connection.</p></div>`;
      return;
    }
    indexItems([item]);
    el.innerHTML = `
      ${thumbHtml(item, "lg")}
      <div class="featured-body">
        <div class="featured-meta"><span class="source">${item.source}</span> · ${timeAgo(item.pubDate)}</div>
        <h1><a href="#" class="open-article" data-link="${item.link}">${item.title}</a></h1>
        <p class="dek">${item.desc}${item.desc.length >= 220 ? "…" : ""}</p>
        ${tickerTagsHtml(item)}
        <p style="margin-top:12px;"><a href="#" class="open-article" data-link="${item.link}" style="color:var(--accent);font-size:13px;">Read this story →</a></p>
      </div>`;
    attachTagHandlers(el);
    attachOpenHandlers(el);
  }

  function renderFeed(items) {
    const el = document.getElementById("news-feed");
    if (!items.length) {
      el.innerHTML = `<p style="color:var(--text-dim);">News is temporarily unavailable.</p>`;
      return;
    }
    indexItems(items);
    el.innerHTML = items
      .map(
        (item) => `
      <article class="news-item">
        <div class="news-meta"><span class="source">${item.source}</span><span>${timeAgo(item.pubDate)}</span></div>
        <h3><a href="#" class="open-article" data-link="${item.link}">${item.title}</a></h3>
        <p>${item.desc}${item.desc.length >= 220 ? "…" : ""}</p>
        ${tickerTagsHtml(item)}
      </article>`
      )
      .join("");
    attachTagHandlers(el);
    attachOpenHandlers(el);
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
      el.innerHTML = `<li style="color:var(--text-faint);font-size:13px;">No data yet</li>`;
      return;
    }
    el.innerHTML = sorted
      .map(([label, count]) => {
        const entry = TTN_CONFIG.TICKER_DICTIONARY.find((d) => d.label === label);
        return `<li><a href="#" class="trending-tag" data-tv="${entry.tvSymbol}" data-label="${label}">${label} <span style="color:var(--text-faint);">· ${count} mentions</span></a></li>`;
      })
      .join("");
    el.querySelectorAll(".trending-tag").forEach((tag) => {
      tag.addEventListener("click", (e) => {
        e.preventDefault();
        TTNChart.open(tag.dataset.tv, tag.dataset.label);
      });
    });
  }

  async function applySearch(query) {
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
    await resolveTickerPrices(filtered.slice(0, 13));
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

    await resolveTickerPrices(allItems.slice(0, 13));
    renderFeatured(allItems[0]);
    renderFeed(allItems.slice(1, 13));
    renderTrending();

    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", (e) => applySearch(e.target.value));
  }

  function fallbackItems() {
    // Only shown if every news source is unreachable (e.g. no internet)
    const now = new Date().toISOString();
    return [
      {
        title: "News temporarily unavailable",
        desc: "Could not load financial news. Please check your internet connection or the RSS source settings in config.js.",
        link: "#",
        image: null,
        pubDate: now,
        source: "TTN",
      },
    ];
  }

  return { init, applySearch };
})();
