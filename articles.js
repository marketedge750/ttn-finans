/**
 * TTN — original analysis articles
 * These are written in-house (not aggregated from RSS), so unlike the
 * news feed, the full text lives here and can be shown on-site directly.
 */
const TTN_ARTICLES = [
  {
    id: "fed-policy-2026",
    title: "How Fed Policy Shifts Ripple Through Stocks, Bonds, and Crypto",
    dek: "A look at why interest-rate decisions move nearly every asset class TTN tracks — and how to read the signals.",
    author: "TTN Research Desk",
    date: "2026-07-15",
    tickers: ["S&P 500", "NASDAQ", "BTC"],
    body: [
      "Interest rate decisions from the Federal Reserve are one of the few events that reliably move stocks, bonds, gold, and crypto on the same day. Understanding the mechanism helps explain why markets react so sharply to a single sentence in a press conference.",
      "When the Fed raises or signals it will hold rates higher for longer, borrowing becomes more expensive across the economy. Growth-oriented stocks — the kind that make up a large share of the Nasdaq — are especially sensitive, because their valuations lean heavily on future earnings that get discounted more harshly when rates rise. That's typically why tech-heavy indices swing more than broader benchmarks like the S&P 500 around Fed meetings.",
      "Gold's relationship with rates is more indirect. Since gold pays no yield, higher interest rates on cash and bonds make it relatively less attractive, which can pressure prices. But gold also tends to catch a bid when rate decisions come bundled with signs of economic stress or inflation surprises, since it's viewed as a hedge against both.",
      "Crypto's link to Fed policy has strengthened noticeably over the past few years. Bitcoin and Ethereum increasingly trade like risk assets — rallying on dovish signals (rate cuts, pauses) and selling off on hawkish surprises, similar to how growth stocks behave, though usually with larger swings in either direction.",
      "For anyone tracking TTN's ticker strip, the practical takeaway is this: Fed announcement days are when correlations across very different assets — a tech stock, a gold ETF, and Bitcoin — can suddenly move in the same direction, because they're all repricing off the same discount-rate assumption. That's worth watching if you hold a mix of these assets, since diversification benefits can shrink exactly when you need them most.",
    ],
  },
  {
    id: "bitcoin-halving-cycles",
    title: "What Bitcoin's Halving Cycles Actually Tell Us — and What They Don't",
    dek: "Bitcoin's supply schedule is one of the most-discussed patterns in crypto. Here's what the historical pattern shows, and where the theory runs into limits.",
    author: "TTN Research Desk",
    date: "2026-06-28",
    tickers: ["BTC", "ETH"],
    body: [
      "Roughly every four years, Bitcoin's block reward — the amount of new BTC paid to miners — is cut in half. This 'halving' is written into Bitcoin's code and happens automatically based on block count, not market conditions.",
      "The pattern that gets the most attention: in Bitcoin's history so far, price has tended to rise substantially in the 12–18 months following a halving. The simple explanation is supply and demand — new coin issuance drops sharply while demand, at least historically, kept growing, and reduced new supply hitting the market can support price if buying pressure stays constant or increases.",
      "But it's worth being precise about what this pattern does and doesn't prove. Bitcoin has only had a handful of halvings, which is a very small sample size to draw firm conclusions from — three or four data points isn't enough to call something a reliable law of markets. Each halving also happened alongside other major shifts: growing institutional adoption, new regulatory frameworks, and macro conditions that had nothing to do with the halving itself. Untangling how much of any post-halving rally came from reduced supply versus these other factors is genuinely difficult, and probably impossible to do with confidence.",
      "There's also a case that markets are efficient enough by now to have priced in a scheduled, publicly known event well in advance — a halving isn't a surprise, so in theory its effects should already be reflected in the price before it happens, at least partially.",
      "The honest summary: halvings are a real, mechanical change to Bitcoin's supply issuance, and the historical correlation with price increases is worth knowing. But treating it as a guaranteed formula ignores both the small sample size and the many other forces moving crypto markets at the same time.",
    ],
  },
  {
    id: "gold-hedge-explainer",
    title: "Is Gold Still a Hedge? What the Metal Actually Protects Against",
    dek: "Gold's reputation as a 'safe haven' gets repeated often — but a hedge against what, exactly? Breaking down the three scenarios where gold tends to hold up.",
    author: "TTN Research Desk",
    date: "2026-06-10",
    tickers: ["GOLD", "EUR/USD"],
    body: [
      "\"Gold is a hedge\" is one of the most repeated lines in finance, but it's rarely explained what it's actually a hedge against. There are three distinct scenarios worth separating.",
      "The first is inflation. Because gold can't be printed or created by a central bank, it has historically held purchasing power over very long time horizons better than cash. This doesn't mean gold rises every time inflation ticks up month to month — short-term correlation is inconsistent — but over decades, gold has generally kept pace with or outpaced inflation, which cash sitting in a low-yield account has not.",
      "The second is currency weakness. Gold is priced in US dollars globally, so when the dollar weakens against other currencies, gold often becomes cheaper for foreign buyers, which can support demand and price. This is one reason gold and the dollar index frequently move in opposite directions, and it's part of why gold-watchers also keep an eye on pairs like EUR/USD.",
      "The third, and the one gold is best known for, is crisis demand. During periods of acute financial stress, geopolitical conflict, or banking instability, gold tends to see a flight-to-safety bid as investors move out of riskier assets. This is the scenario where gold's 'safe haven' reputation is most consistently earned.",
      "What gold is not particularly good at is protecting against ordinary stock market volatility — it doesn't reliably rise every time equities fall on a normal down day. Treating gold as a hedge against inflation, currency risk, and acute crises — rather than a hedge against everything — is a more accurate way to think about its role in a portfolio.",
    ],
  },
];
