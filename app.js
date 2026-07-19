/**
 * TTN — entry point
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for the first ticker price fetch so news ticker chips (and the
  // market summary) can show live data immediately instead of waiting
  // for the next refresh cycle.
  await TTNTickers.init();
  await TTNNews.init();

  if (typeof TTNMarketSummary !== "undefined") {
    TTNMarketSummary.render();
    setInterval(TTNMarketSummary.render, 60000);
  }
});
