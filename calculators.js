/**
 * TTN — фінансові калькулятори
 */
document.addEventListener("DOMContentLoaded", () => {
  const fmt = (v) =>
    v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- 1. Compound interest ---------- */
  function calcCompound() {
    const principal = parseFloat(document.getElementById("ci-principal").value) || 0;
    const monthly = parseFloat(document.getElementById("ci-monthly").value) || 0;
    const rate = (parseFloat(document.getElementById("ci-rate").value) || 0) / 100;
    const years = parseFloat(document.getElementById("ci-years").value) || 0;

    const monthlyRate = rate / 12;
    const months = years * 12;
    let balance = principal;
    let totalContributed = principal;

    for (let i = 0; i < months; i++) {
      balance = balance * (1 + monthlyRate) + monthly;
      totalContributed += monthly;
    }

    const growth = balance - totalContributed;
    document.getElementById("ci-result").textContent = `$${fmt(balance)}`;
    document.getElementById("ci-sub").textContent =
      `Внесено: $${fmt(totalContributed)} · Приріст: $${fmt(growth)}`;
  }
  ["ci-principal", "ci-monthly", "ci-rate", "ci-years"].forEach((id) =>
    document.getElementById(id).addEventListener("input", calcCompound)
  );
  calcCompound();

  /* ---------- 2. Currency converter (live via Frankfurter) ---------- */
  let fxRateCache = {}; // "EUR_USD" -> rate

  async function calcFx() {
    const amount = parseFloat(document.getElementById("fx-amount").value) || 0;
    const from = document.getElementById("fx-from").value;
    const to = document.getElementById("fx-to").value;
    const subEl = document.getElementById("fx-sub");
    const resultEl = document.getElementById("fx-result");

    if (from === to) {
      resultEl.textContent = `${fmt(amount)} ${to}`;
      subEl.textContent = "Rate 1:1 (same currency)";
      return;
    }

    const cacheKey = `${from}_${to}`;
    if (fxRateCache[cacheKey]) {
      resultEl.textContent = `${fmt(amount * fxRateCache[cacheKey])} ${to}`;
      subEl.textContent = `1 ${from} = ${fxRateCache[cacheKey].toFixed(4)} ${to}`;
      return;
    }

    subEl.textContent = "Loading rate…";
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      const data = await res.json();
      const rate = data.rates[to];
      fxRateCache[cacheKey] = rate;
      resultEl.textContent = `${fmt(amount * rate)} ${to}`;
      subEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    } catch (e) {
      subEl.textContent = "Rate temporarily unavailable";
      resultEl.textContent = "—";
    }
  }
  ["fx-amount", "fx-from", "fx-to"].forEach((id) =>
    document.getElementById(id).addEventListener("input", calcFx)
  );
  document.getElementById("fx-swap").addEventListener("click", () => {
    const from = document.getElementById("fx-from");
    const to = document.getElementById("fx-to");
    [from.value, to.value] = [to.value, from.value];
    calcFx();
  });
  calcFx();

  /* ---------- 3. Crypto P&L ---------- */
  function calcPnl() {
    const entry = parseFloat(document.getElementById("pnl-entry").value) || 0;
    const current = parseFloat(document.getElementById("pnl-current").value) || 0;
    const amount = parseFloat(document.getElementById("pnl-amount").value) || 0;
    const leverage = parseFloat(document.getElementById("pnl-leverage").value) || 1;

    if (entry <= 0) return;
    const priceChangePct = (current - entry) / entry;
    const pnl = amount * priceChangePct * leverage;
    const pnlPct = priceChangePct * leverage * 100;

    const resultEl = document.getElementById("pnl-result");
    resultEl.textContent = `${pnl >= 0 ? "+" : ""}$${fmt(pnl)}`;
    resultEl.style.color = pnl >= 0 ? "var(--up)" : "var(--down)";
    document.getElementById("pnl-sub").textContent =
      `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}% · Плече ${leverage}x`;
  }
  ["pnl-entry", "pnl-current", "pnl-amount", "pnl-leverage"].forEach((id) =>
    document.getElementById(id).addEventListener("input", calcPnl)
  );
  calcPnl();

  /* ---------- 4. Loan / EMI calculator ---------- */
  function calcLoan() {
    const principal = parseFloat(document.getElementById("loan-amount").value) || 0;
    const annualRate = (parseFloat(document.getElementById("loan-rate").value) || 0) / 100;
    const months = parseFloat(document.getElementById("loan-term").value) || 1;

    const monthlyRate = annualRate / 12;
    let payment;
    if (monthlyRate === 0) {
      payment = principal / months;
    } else {
      payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }
    const totalPaid = payment * months;
    const totalInterest = totalPaid - principal;

    document.getElementById("loan-result").textContent = `$${fmt(payment)}`;
    document.getElementById("loan-sub").textContent =
      `Загалом: $${fmt(totalPaid)} · Переплата: $${fmt(totalInterest)}`;
  }
  ["loan-amount", "loan-rate", "loan-term"].forEach((id) =>
    document.getElementById(id).addEventListener("input", calcLoan)
  );
  calcLoan();
});
