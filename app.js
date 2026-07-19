/**
 * TTN — entry point
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for the first ticker price fetch so news ticker chips can show
  // a live % change immediately instead of on the next refresh cycle.
  await TTNTickers.init();
  TTNNews.init();
});
