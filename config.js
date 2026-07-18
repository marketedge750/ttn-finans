/**
 * TTN — конфігурація сайту
 * ------------------------------------------------------------
 * Тут зберігаються всі ключі та джерела даних.
 * Безкоштовні API не потребують ключа. Для акцій/індексів/золота
 * рекомендується безкоштовний ключ Twelve Data (800 запитів/день):
 * https://twelvedata.com/pricing  -> "Basic" (free)
 *
 * Якщо ключ не вказано — ці тікери показують демо-дані
 * (позначені бейджем DEMO), сайт при цьому повністю робочий.
 * ------------------------------------------------------------
 */

const TTN_CONFIG = {
  // Безкоштовний ключ Twelve Data (для S&P 500, Nasdaq, Gold)
  TWELVE_DATA_KEY: "", // <-- встав свій ключ сюди

  // Безкоштовний ключ rss2json.com (підвищує ліміт запитів новин)
  // Без ключа теж працює, але з меншим лімітом на день
  RSS2JSON_KEY: "", // <-- встав свій ключ сюди (необов'язково)

  // Інтервал оновлення цін (мс)
  PRICE_REFRESH_MS: 45000,

  // Тікери у верхній панелі
  TICKERS: [
    {
      id: "btc",
      label: "Bitcoin",
      symbol: "BTC",
      type: "crypto",
      coingeckoId: "bitcoin",
      tvSymbol: "BINANCE:BTCUSDT",
    },
    {
      id: "eth",
      label: "Ethereum",
      symbol: "ETH",
      type: "crypto",
      coingeckoId: "ethereum",
      tvSymbol: "BINANCE:ETHUSDT",
    },
    {
      id: "spx",
      label: "S&P 500",
      symbol: "SPX",
      type: "index",
      twelveDataSymbol: "SPX",
      tvSymbol: "SP:SPX",
      demoBase: 6280,
    },
    {
      id: "ndx",
      label: "Nasdaq",
      symbol: "NDX",
      type: "index",
      twelveDataSymbol: "NDX",
      tvSymbol: "NASDAQ:NDX",
      demoBase: 22950,
    },
    {
      id: "gold",
      label: "Gold",
      symbol: "XAU/USD",
      type: "commodity",
      twelveDataSymbol: "XAU/USD",
      tvSymbol: "TVC:GOLD",
      demoBase: 3380,
    },
    {
      id: "eurusd",
      label: "EUR/USD",
      symbol: "FX",
      type: "forex",
      // Frankfurter — безкоштовний, без ключа, з CORS
      frankfurterPair: { from: "EUR", to: "USD" },
      tvSymbol: "FX:EURUSD",
      demoBase: 1.16,
    },
  ],

  // RSS-джерела фінансових новин (агрегуються, не переписуються)
  NEWS_FEEDS: [
    { name: "CNBC Markets", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/" },
    { name: "Investing.com", url: "https://www.investing.com/rss/news_25.rss" },
  ],

  // Словник тікерів для авто-визначення у заголовках/описах новин
  TICKER_DICTIONARY: [
    { match: ["bitcoin", "btc"], label: "BTC", tvSymbol: "BINANCE:BTCUSDT" },
    { match: ["ethereum", "eth", "ether"], label: "ETH", tvSymbol: "BINANCE:ETHUSDT" },
    { match: ["tesla", "tsla"], label: "TSLA", tvSymbol: "NASDAQ:TSLA" },
    { match: ["apple", "aapl"], label: "AAPL", tvSymbol: "NASDAQ:AAPL" },
    { match: ["nvidia", "nvda"], label: "NVDA", tvSymbol: "NASDAQ:NVDA" },
    { match: ["microsoft", "msft"], label: "MSFT", tvSymbol: "NASDAQ:MSFT" },
    { match: ["amazon", "amzn"], label: "AMZN", tvSymbol: "NASDAQ:AMZN" },
    { match: ["meta platforms", "meta ", "facebook"], label: "META", tvSymbol: "NASDAQ:META" },
    { match: ["google", "alphabet", "googl"], label: "GOOGL", tvSymbol: "NASDAQ:GOOGL" },
    { match: ["s&p 500", "s&p500", "sp500"], label: "S&P 500", tvSymbol: "SP:SPX" },
    { match: ["nasdaq"], label: "NASDAQ", tvSymbol: "NASDAQ:NDX" },
    { match: ["dow jones", "dow "], label: "DOW", tvSymbol: "DJ:DJI" },
    { match: ["gold"], label: "GOLD", tvSymbol: "TVC:GOLD" },
    { match: ["oil", "crude"], label: "OIL", tvSymbol: "TVC:USOIL" },
    { match: ["euro", "eur/usd", "eurusd"], label: "EUR/USD", tvSymbol: "FX:EURUSD" },
    { match: ["dogecoin", "doge"], label: "DOGE", tvSymbol: "BINANCE:DOGEUSDT" },
    { match: ["solana", "sol "], label: "SOL", tvSymbol: "BINANCE:SOLUSDT" },
    { match: ["ripple", "xrp"], label: "XRP", tvSymbol: "BINANCE:XRPUSDT" },
  ],
};
