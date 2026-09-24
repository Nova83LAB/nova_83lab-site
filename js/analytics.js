/* ==========================================================================
   NOVA_83LAB — analytics.js
   GA4 / Microsoft Clarity の読み込みと、問い合わせ導線のクリック計測。
   IDが空のあいだは何も読み込まない(公開してもそのままで安全)。
   ========================================================================== */
(() => {
  "use strict";

  /* ---- ここにIDを入れるだけで有効になる ---- */
  const GA4_ID = "";      // 例: "G-XXXXXXXXXX"  (Googleアナリティクス → 管理 → データストリーム)
  const CLARITY_ID = "";  // 例: "abcd1234ef"    (clarity.microsoft.com → 設定 → 概要)

  // ローカル確認(file:// や localhost)では計測しない
  const isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (isLocal) return;

  /* ------------------------------ GA4 ------------------------------ */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  if (GA4_ID){
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  /* ------------------------------ Clarity ------------------------------ */
  if (CLARITY_ID){
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  /* ------------------------------ click tracking ------------------------------ */
  // 電話・メール = 問い合わせ(generate_lead)、それ以外の外部リンクは click_outbound
  function track(name, params){
    if (GA4_ID) window.gtag("event", name, params);
    if (CLARITY_ID && window.clarity) window.clarity("event", name);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    const where = a.dataset.track || location.pathname.split("/").pop() || "index.html";

    if (href.startsWith("tel:")){
      track("generate_lead", { method: "phone", link_location: where });
    } else if (href.startsWith("mailto:")){
      track("generate_lead", { method: "email", link_location: where });
    } else if (/instagram\.com/.test(href)){
      track("click_instagram", { link_url: href, link_location: where });
    } else if (a.hostname && a.hostname !== location.hostname){
      track("click_outbound", { link_url: href, link_location: where });
    } else if (/#contact$/.test(href)){
      track("click_contact_nav", { link_location: where });
    }
  }, true);
})();
