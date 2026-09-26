/* ==========================================================================
   NOVA_83LAB — quote.js
   車検ページの見積りフォーム。サーバーは使わず、入力内容を文章にして
   メール(mailto)で開くか、コピーして LINE WORKS を開く。
   LINE WORKS はリンクで本文を渡せないので、貼り付けてもらう。
   ========================================================================== */
(() => {
  "use strict";

  const form = document.getElementById("quote-form");
  if (!form) return;

  const MAIL = "recto.ad.finem@gmail.com";
  const LINE_URL = "https://works.do/FA5CcUJ";
  const error = document.getElementById("quote-error");
  const status = document.getElementById("quote-status");

  const LABELS = [
    ["model", "車種・型式"],
    ["year", "年式"],
    ["expiry", "車検満了日"],
    ["mileage", "走行距離"],
    ["notes", "気になる所・ご要望"],
    ["name", "お名前"],
  ];

  function buildText(){
    const lines = ["【車検のお見積り依頼】"];
    LABELS.forEach(([key, label]) => {
      const v = form.elements[key].value.trim();
      if (v) lines.push(label + "：" + v);
    });
    return lines.join("\n");
  }

  function track(method){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", method: method, link_location: "shaken-quote-form" });
  }

  async function copy(text){
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e){
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e2){}
      ta.remove();
      return ok;
    }
  }

  form.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-send]");
    if (!btn) return;

    const model = form.elements.model;
    if (!model.value.trim()){
      error.hidden = false;
      model.focus();
      return;
    }
    error.hidden = true;

    const text = buildText();
    const en = document.documentElement.lang === "en";

    if (btn.dataset.send === "mail"){
      track("email");
      location.href = "mailto:" + MAIL +
        "?subject=" + encodeURIComponent("車検のお見積り依頼") +
        "&body=" + encodeURIComponent(text + "\n\n※車検証の写真があれば添付してください。");
      status.textContent = en ? "Your mail app should open. If it doesn't, use the LINE WORKS button instead."
                              : "メールアプリが開きます。開かない場合は「コピーしてLINE WORKSに貼る」をお使いください。";
    } else {
      // Open LINE WORKS from a second tap: opening it after the async copy
      // gets eaten by popup blockers (iOS Safari). That link's click is
      // counted as generate_lead by analytics.js, so no track() here.
      const ok = await copy(text);
      status.textContent = ok
        ? (en ? "Copied. Open LINE WORKS, paste it into the chat and send. " : "コピーしました。LINE WORKSを開いて、トーク画面に貼り付けて送信してください。")
        : (en ? "Couldn't copy automatically. Please type the details into LINE WORKS. " : "自動でコピーできませんでした。お手数ですが、LINE WORKSに内容を入力して送ってください。");
      const a = document.createElement("a");
      a.href = LINE_URL;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn btn-primary quote-open-line";
      a.dataset.track = "shaken-quote-form";
      a.textContent = en ? "Open LINE WORKS" : "LINE WORKSを開く";
      status.appendChild(a);
    }
  });
})();
