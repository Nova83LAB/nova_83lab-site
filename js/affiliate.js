/* ==========================================================================
   NOVA_83LAB — affiliate.js
   豆知識記事の「この作業で使う道具」枠に、Amazon・楽天・Yahoo!ショッピングのリンクを組み立てる。
   商品は各HTMLの .gear-item[data-q] に検索キーワードとして書いてある
   (型番リンクにしないのは、廃番やリンク切れで枠が死なないようにするため)。
   ID が全部空なら枠ごと消え、空の ID のボタンは出ないので、未登録のまま公開しても何も表示されない。
   ========================================================================== */
(() => {
  "use strict";

  /* ---- ここにIDを入れるだけで有効になる ---- */
  const AMAZON_TAG = "nova83lab-22";  // 例: "nova83lab-22"  (アソシエイト・セントラル → トラッキングID)
  const RAKUTEN_ID = "57e8ffe7.6382209b.57e8ffe8.339c5c74";  // 例: "1a2b3c4d.5e6f7a8b.1a2b3c4d.5e6f7a8b"  (楽天アフィリエイト → アフィリエイトID)
  // Yahoo!ショッピングはバリューコマース経由。MyLink で作ったリンクの sid= と pid= の数字を入れる
  const YAHOO_SID = "3783450";  // 例: "3712345"
  const YAHOO_PID = "892720716";  // 例: "891234567"

  const page = location.pathname.split("/").pop() || "index.html";

  function amazonUrl(q){
    return "https://www.amazon.co.jp/s?k=" + encodeURIComponent(q) + "&tag=" + encodeURIComponent(AMAZON_TAG);
  }
  function rakutenUrl(q){
    const target = encodeURIComponent("https://search.rakuten.co.jp/search/mall/" + encodeURIComponent(q) + "/");
    return "https://hb.afl.rakuten.co.jp/hgc/" + RAKUTEN_ID + "/?pc=" + target + "&m=" + target;
  }
  function yahooUrl(q){
    const target = "https://shopping.yahoo.co.jp/search?p=" + encodeURIComponent(q);
    return "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=" + encodeURIComponent(YAHOO_SID) +
      "&pid=" + encodeURIComponent(YAHOO_PID) + "&vc_url=" + encodeURIComponent(target);
  }
  function link(href, label){
    const a = document.createElement("a");
    a.href = href;
    a.className = "gear-link";
    a.target = "_blank";
    a.rel = "sponsored noopener";
    a.dataset.track = page + "#gear";
    a.textContent = label;
    return a;
  }

  document.querySelectorAll(".gear-box").forEach(box => {
    const yahoo = YAHOO_SID && YAHOO_PID;
    if (!AMAZON_TAG && !RAKUTEN_ID && !yahoo){ box.remove(); return; }
    box.querySelectorAll(".gear-item[data-q]").forEach(item => {
      const q = item.dataset.q;
      const slot = item.querySelector(".gear-links");
      if (AMAZON_TAG) slot.appendChild(link(amazonUrl(q), "Amazon"));
      if (RAKUTEN_ID) slot.appendChild(link(rakutenUrl(q), "楽天市場"));
      if (yahoo) slot.appendChild(link(yahooUrl(q), "Yahoo!"));
    });
    const amazonNote = box.querySelector(".gear-disclosure-amazon");
    if (amazonNote && !AMAZON_TAG) amazonNote.remove();
  });
})();
