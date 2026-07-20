# TTN — Market Watch

Статичний сайт-експеримент у стилі Yahoo Finance: темна тема,
live-котирування 6 активів, інтерактивні графіки TradingView,
агрегація фінансових новин з авто-визначенням тікерів у статтях.

## Структура проєкту

```
ttn-finance/
├── index.html          # головна сторінка
├── about.html           # про нас
├── privacy.html          # політика конфіденційності
├── css/
│   └── style.css
└── js/
    ├── config.js         # ключі API та джерела даних
    ├── chart.js          # панель графіка TradingView
    ├── tickers.js         # live-ціни у верхній панелі
    ├── news.js            # агрегація новин + визначення тікерів
    └── app.js              # точка входу
```

Чистий HTML/CSS/JS без збірки (build step) — можна відкрити
`index.html` напряму в браузері або задеплоїти як є.

## Джерела даних

| Дані | Джерело | Потрібен ключ? |
|---|---|---|
| Bitcoin, Ethereum | CoinGecko API | Ні (ключ підвищує ліміт) |
| EUR/USD | Frankfurter.app | Ні |
| S&P 500, Nasdaq, Gold | Twelve Data | Так (безкоштовний рівень) |
| Графіки і панель тікерів | TradingView Widget | Ні |
| Новини | rss2json.com (6 RSS-джерел) + Finnhub (додатково) | Бажано, але не обов'язково |
| Фото для новин без власної картинки | Pexels API | Бажано (без нього — іконка-заглушка) |

**Без ключів сайт повністю робочий** — тікери без ключа Twelve Data
показують демо-дані з позначкою `DEMO`, а картки новин без власного
фото показують чисту іконку замість фото, якщо не додати ключ Pexels.

### Отримати безкоштовні ключі

1. Twelve Data (S&P 500 / Nasdaq / Gold): https://twelvedata.com/pricing → Basic (free), вставити в `TTN_CONFIG.TWELVE_DATA_KEY`
2. CoinGecko Demo (стабільніші ціни BTC/ETH): https://www.coingecko.com/en/api/pricing → Demo (free), вставити в `TTN_CONFIG.COINGECKO_KEY`
3. Finnhub (додаткове джерело новин): https://finnhub.io/register → безкоштовно, вставити в `TTN_CONFIG.FINNHUB_KEY`
4. rss2json (підвищує ліміт новин): https://rss2json.com/ → вставити в `TTN_CONFIG.RSS2JSON_KEY`
5. Pexels (гарантовані фото для новин без власної картинки): https://www.pexels.com/api/ → безкоштовно, вставити в `TTN_CONFIG.PEXELS_KEY`

## Розгортання через GitHub Pages

1. Створіть новий репозиторій на GitHub, наприклад `ttn-finance`.
2. Завантажте вміст цієї папки в корінь репозиторію:
   ```bash
   git init
   git add .
   git commit -m "Init TTN"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ttn-finance.git
   git push -u origin main
   ```
3. У репозиторії відкрийте **Settings → Pages**.
4. У полі **Source** оберіть гілку `main` і папку `/ (root)`.
5. Збережіть — сайт з'явиться за адресою
   `https://USERNAME.github.io/ttn-finance/` протягом 1–2 хвилин.

### Альтернатива: Vercel / Netlify

Просто підключіть репозиторій на vercel.com або netlify.com —
build-команда не потрібна (static site), достатньо вказати корінь
проєкту як output directory.

## Наступні кроки (не входить у базову версію)

- Рекламні слоти (`.ad-slot`) вже розмічені в CSS/HTML — залишається
  вставити код Google AdSense / банери партнерських програм.
- Cookie-consent банер для GDPR (обов'язково перед підключенням AdSense у ЄС).
- Заміна rss2json на власний backend-проксі, якщо потрібен вищий ліміт запитів.
