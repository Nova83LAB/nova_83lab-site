/* ==========================================================================
   NOVA_83LAB — quote.js
   車検の見積りフォーム(shaken.html)とトップのお問い合わせフォーム(index.html)。
   サーバーは使わず、入力内容を文章にしてメール(mailto)で開くか、
   コピーして LINE WORKS を開く。LINE WORKS はリンクで本文を渡せないので、
   貼り付けてもらう。
   フォームは form[data-compose] で、件名・計測用の場所・メール末尾の一言は
   data-subject / data-location / data-mail-note、各項目の見出しは data-label。
   ========================================================================== */
(() => {
  "use strict";

  // Assembled here so the address doesn't sit in the HTML for scrapers.
  const MAIL = ["recto.ad.finem", "gmail.com"].join("@");
  const LINE_URL = "https://works.do/FA5CcUJ";

  function track(method, where){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "generate_lead", method: method, link_location: where });
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

  function setup(form){
    const subject = form.dataset.subject;
    const where = form.dataset.location;
    const mailNote = form.dataset.mailNote || "";
    const error = form.querySelector(".quote-error");
    const status = form.querySelector(".quote-status");

    function buildText(){
      const lines = ["【" + subject + "】"];
      form.querySelectorAll("[data-label]").forEach((el) => {
        const v = el.value.trim();
        if (v) lines.push(el.dataset.label + "：" + v);
      });
      return lines.join("\n");
    }

    form.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-send]");
      if (!btn) return;

      const missing = Array.from(form.querySelectorAll("[required]")).find((el) => !el.value.trim());
      if (missing){
        error.hidden = false;
        missing.focus();
        return;
      }
      error.hidden = true;

      const text = buildText();
      const en = document.documentElement.lang === "en";

      if (btn.dataset.send === "mail"){
        track("email", where);
        location.href = "mailto:" + MAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(text + (mailNote ? "\n\n" + mailNote : ""));
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
        a.dataset.track = where;
        a.textContent = en ? "Open LINE WORKS" : "LINE WORKSを開く";
        status.appendChild(a);
      }
    });
  }

  document.querySelectorAll("form[data-compose]").forEach(setup);
})();
