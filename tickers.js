/**
 * TTN — live ticker price module
 */
const TTNTickers = (() => {
  const state = {}; // id -> { price, changePct, demo }

  function renderStrip() {
    const strip = document.getElementById("ticker-strip");
    strip.innerHTML = TTN_CONFIG.TICKERS.map(
      (t) => `
      <div class="ticker-cell" data-id="${t.id}" data-tv="${t.tvSymbol}" data-label="${t.label}">
        <div class="ticker-label"><span>${t.label}</span><span>${t.symbol}</span></div>
        <div class="ticker-price skeleton skel-line" id="price-${t.id}" style="width:70%"></div>
        <div class="ticker-change" id="change-${t.id}"></div>
      </div>`
    ).join("");

    strip.querySelectorAll(".ticker-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        strip.querySelectorAll(".ticker-cell").forEach((c) => c.classList.remove("active"));
        const wasOpenForThis = cell.classList.contains("active");
        cell.classList.add("active");
        TTNChart.open(cell.dataset.tv, cell.dataset.label);
      });
    });
  }

  function fmtPrice(v, opts = {}) {
    if (v == null || isNaN(v)) return "—";
    const decimals = opts.decimals ?? (v >= 1000 ? 2 : v >= 1 ? 2 : 4);
    return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function applyUpdate(id, price, changePct, isDemo) {
    const prev = state[id]?.price;
    state[id] = { price, changePct, demo: isDemo };

    const priceEl = document.getElementById(`price-${id}`);
    const changeEl = document.getElementById(`change-${id}`);
    if (!priceEl || !changeEl) return;

    priceEl.classList.remove("skeleton", "skel-line");
    priceEl.textContent = fmtPrice(price);
    if (isDemo) {
      priceEl.innerHTML += `<span class="badge-demo">DEMO</span>`;
    }

    if (prev != null) {
      priceEl.classList.remove("flash-up", "flash-down");
      void priceEl.offsetWidth; // reflow to restart animation
      priceEl.classList.add(price >= prev ? "flash-up" : "flash-down");
    }

    const dir = changePct >= 0 ? "up" : "down";
    changeEl.className = `ticker-change ${dir}`;
    changeEl.textContent = `${changePct >= 0 ? "▲" : "▼"} ${Math.abs(changePct).toFixed(2)}%`;
  }

  async function fetchCrypto() {
    const cryptoTickers = TTN_CONFIG.TICKERS.filter((t) => t.type === "crypto");
    if (!cryptoTickers.length) return;
    const ids = cryptoTickers.map((t) => t.coingeckoId).join(",");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await res.json();
      cryptoTickers.forEach((t) => {
        const d = data[t.coingeckoId];
        if (d) applyUpdate(t.id, d.usd, d.usd_24h_change ?? 0, false);
        else applyUpdate(t.id, ...demoValue(t), true);
      });
    } catch (e) {
      cryptoTickers.forEach((t) => applyUpdate(t.id, ...demoValue(t), true));
    }
  }

  async function fetchForex() {
    const fx = TTN_CONFIG.TICKERS.find((t) => t.type === "forex");
    if (!fx) return;
    let rate = null;
    let changePct = 0;
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=${fx.frankfurterPair.from}&to=${fx.frankfurterPair.to}`
      );
      const data = await res.json();
      rate = data.rates[fx.frankfurterPair.to];
    } catch (e) {
      applyUpdate(fx.id, ...demoValue(fx), true);
      return;
    }
    // Change % is best-effort — if it fails, still show the real current rate
    try {
      const prevRes = await fetch(
        `https://api.frankfurter.app/${shiftDate(-3)}?from=${fx.frankfurterPair.from}&to=${fx.frankfurterPair.to}`
      );
      const prevData = await prevRes.json();
      const prevRate = Object.values(prevData.rates)[0] ?? rate;
      changePct = ((rate - prevRate) / prevRate) * 100;
    } catch (e) {
      changePct = 0;
    }
    applyUpdate(fx.id, rate, changePct, false);
  }

  function shiftDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  async function fetchTwelveData() {
    const symbols = TTN_CONFIG.TICKERS.filter((t) => t.twelveDataSymbol);
    if (!symbols.length) return;
    if (!TTN_CONFIG.TWELVE_DATA_KEY) {
      symbols.forEach((t) => applyUpdate(t.id, ...demoValue(t), true));
      return;
    }
    for (const t of symbols) {
      try {
        const res = await fetch(
          `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
            t.twelveDataSymbol
          )}&apikey=${TTN_CONFIG.TWELVE_DATA_KEY}`
        );
        const data = await res.json();
        if (data.close) {
          applyUpdate(t.id, parseFloat(data.close), parseFloat(data.percent_change ?? 0), false);
        } else {
          applyUpdate(t.id, ...demoValue(t), true);
        }
      } catch (e) {
        applyUpdate(t.id, ...demoValue(t), true);
      }
    }
  }

  function demoValue(t) {
    const base = t.demoBase || 100;
    const drift = (Math.sin(Date.now() / 90000 + base) * 0.6) / 100; // small oscillation
    const price = base * (1 + drift);
    const changePct = drift * 100;
    return [price, changePct];
  }

  async function refreshAll() {
    await Promise.all([fetchCrypto(), fetchForex(), fetchTwelveData()]);
  }

  function init() {
    renderStrip();
    const firstLoad = refreshAll();
    setInterval(refreshAll, TTN_CONFIG.PRICE_REFRESH_MS);
    return firstLoad;
  }

  function getChangePct(id) {
    return state[id]?.changePct ?? null;
  }

  return { init, fmtPrice, getChangePct };
})();
