/* ==========================================================================
   NOVA_83LAB — quote.js
   車検の見積りフォーム(shaken.html)とトップのお問い合わせフォーム(index.html)。
   サーバーは使わず、入力内容を文章にしてメール(mailto)で開くか、
   LINE公式アカウントのトークを本文入りで開く(oaMessage)。
   LINE アプリが開かない環境のために、本文はコピーもしておく。
   フォームは form[data-compose] で、件名・計測用の場所・メール末尾の一言は
   data-subject / data-location / data-mail-note、各項目の見出しは data-label。
   ========================================================================== */
(() => {
  "use strict";

  // Assembled here so the address doesn't sit in the HTML for scrapers.
  const MAIL = ["recto.ad.finem", "gmail.com"].join("@");
  const LINE_URL = "https://line.me/R/ti/p/@841vmhwq";
  // Opens the chat with the text already typed in; "@" must be written as %40 here.
  const LINE_MESSAGE_URL = "https://line.me/R/oaMessage/%40841vmhwq/?";

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
        status.textContent = en ? "Your mail app should open. If it doesn't, use the LINE button instead."
                                : "メールアプリが開きます。開かない場合は「LINEで送る」をお使いください。";
      } else {
        // Copy first as a fallback, then open the chat with the text filled in.
        // Same-tab navigation (not window.open) isn't blocked after the await.
        const ok = await copy(text);
        track("line_official", where);
        status.textContent = ok
          ? (en ? "Opening LINE with your message filled in — just tap send. If LINE doesn't open, add us as a friend and paste the copied text. "
                : "LINEが開いて、入力した内容がトークに入ります。そのまま送信してください。開かない場合は、友だち追加してコピー済みの内容を貼り付けてください。")
          : (en ? "Opening LINE with your message filled in — just tap send. If LINE doesn't open, add us as a friend and type the details. "
                : "LINEが開いて、入力した内容がトークに入ります。そのまま送信してください。開かない場合は、友だち追加して内容を入力してください。");
        const a = document.createElement("a");
        a.href = LINE_URL;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "btn btn-primary quote-open-line";
        a.textContent = en ? "Add us on LINE" : "LINEで友だち追加";
        status.appendChild(a);
        location.href = LINE_MESSAGE_URL + encodeURIComponent(text);
      }
    });
  }

  document.querySelectorAll("form[data-compose]").forEach(setup);
})();
