/**
 * TTN — lightweight cookie consent banner
 * Stores the user's choice in localStorage so the banner only shows once.
 * This is a basic notice, not a full CMP — replace with a proper consent
 * management platform if you need granular ad-personalization controls
 * (e.g. for stricter GDPR/UK compliance once real ad tags are added).
 */
(function () {
  const STORAGE_KEY = "ttn_cookie_consent";
  if (localStorage.getItem(STORAGE_KEY)) return;

  const bar = document.createElement("div");
  bar.id = "cookie-consent";
  bar.innerHTML = `
    <p>
      We use cookies for analytics and to serve ads (including via Google AdSense).
      By continuing to use TTN, you agree to our
      <a href="privacy.html">Privacy Policy</a>.
    </p>
    <div class="cookie-consent-actions">
      <button id="cookie-accept">Accept</button>
      <button id="cookie-decline">Decline</button>
    </div>`;
  document.body.appendChild(bar);

  function dismiss(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    bar.remove();
  }
  document.getElementById("cookie-accept").addEventListener("click", () => dismiss("accepted"));
  document.getElementById("cookie-decline").addEventListener("click", () => dismiss("declined"));
})();
