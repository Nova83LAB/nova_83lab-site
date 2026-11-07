// 今日の愛車運ランキング（fortune.html）
// 順位とラッキー整備は Threads ボット（threads-bot/src/fortune.mjs）と同じ計算。日付（日本時間）から決まるので、毎朝 Threads と同じ順位になる。
// ひとこと・ラッキーアイテムはサイト版だけの内容（日付と星座から決まる）。
(function () {
  "use strict";

  var SIGNS = [
    ["♈", "おひつじ座"], ["♉", "おうし座"], ["♊", "ふたご座"], ["♋", "かに座"],
    ["♌", "しし座"], ["♍", "おとめ座"], ["♎", "てんびん座"], ["♏", "さそり座"],
    ["♐", "いて座"], ["♑", "やぎ座"], ["♒", "みずがめ座"], ["♓", "うお座"]
  ];
  // ↓ この2つは threads-bot/src/fortune.mjs の LUCKY_CARE と同じ並び・同じ文にしておく
  var LUCKY_CARE = [
    "タイヤの空気圧チェック", "ワイパーの拭き取り確認", "ライトの点灯チェック", "エンジンオイルの量を見る",
    "窓ガラスの内側を拭く", "ウォッシャー液の残りを確認", "タイヤの溝とひび割れを見る", "バッテリー端子のまわりを見る"
  ];
  // ラッキー整備 → 解説ページ（LUCKY_CARE の番号ごと。2026-11-07 に tips-28〜31 を足して8つ全部につながった）
  var CARE_LINK = {
    0: "tips-15.html", 1: "tips-28.html", 2: "tips-29.html", 3: "tips-30.html",
    4: "tips-31.html", 5: "tips-15.html", 6: "tips-15.html", 7: "tips-15.html"
  };

  var WORDS = [
    // 1〜3位
    ["遠出に最高の日。気になっていた道へ", "思い切ってドライブの予定を立てて吉", "寄り道した先にうれしい発見", "洗車をすると運気がさらに上向き", "久しぶりの人を乗せると楽しい一日に", "朝いちばんの運転で頭がすっきり"],
    // 4〜6位
    ["いつもと違う道で小さな発見", "お気に入りの音楽でドライブが快適に", "車内の片付けで気分が軽くなる", "給油は早めにすると流れに乗れる", "同乗者との会話がはずむ日", "夕方の景色がきれいに見えそう"],
    // 7〜9位
    ["いつもの道をのんびり運転が吉", "出発前に5分の余裕を持って", "駐車は少し広めの場所を選んで", "暗くなる前の早めのライト点灯を", "休憩をはさむと集中力が戻る", "近場の用事をまとめて片付けると吉"],
    // 10〜12位
    ["急がず車間はたっぷりと", "今日は安全運転に徹して運気回復", "無理せず早めの帰宅が吉", "出かける前に忘れ物チェックを", "交差点ではひと呼吸おいて", "雨や風の日はスピード控えめに"]
  ];
  var ITEMS = [
    "マイクロファイバークロス", "タイヤの空気圧ゲージ", "お気に入りのプレイリスト", "ガラスクリーナー", "軍手",
    "小さなLEDライト", "洗車スポンジ", "スマホの充電ケーブル", "サングラス", "ひざかけ",
    "保温マグ", "折りたたみ傘", "ウェットティッシュ", "車用の芳香剤", "ドリンクホルダー", "撥水スプレー"
  ];

  function seeded(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    var a = h >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function todayJst() {
    var d = new Date(Date.now() + 9 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }
  function ranking(date) {
    var rand = seeded("nova83lab-fortune-" + date);
    var list = SIGNS.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }
  function luckyCare(date) {
    return Math.floor(seeded("nova83lab-lucky-" + date)() * LUCKY_CARE.length);
  }
  // 日付ごとに並べ替えたコピー（同じ日に同じ文・同じアイテムが重ならないように、上から順に使う）
  function shuffled(arr, key) {
    var rand = seeded(key), out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }
  function stars(rank) {
    var n = rank <= 3 ? 5 : rank <= 6 ? 4 : rank <= 9 ? 3 : 2;
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  // その日の12星座の行（順位・星・ひとこと・ラッキーアイテム）とラッキー整備
  function build(date) {
    var words = WORDS.map(function (w, k) { return shuffled(w, date + "-words-" + k); });
    var items = shuffled(ITEMS, date + "-items");
    var careIdx = luckyCare(date);
    return {
      date: date,
      careIdx: careIdx,
      care: LUCKY_CARE[careIdx],
      careLink: CARE_LINK[careIdx] || "",
      rows: ranking(date).map(function (s, i) {
        var rank = i + 1;
        return {
          mark: s[0], name: s[1], rank: rank, stars: stars(rank),
          word: words[Math.floor(i / 3)][i % 3],
          item: items[i]
        };
      })
    };
  }
  // 1年の愛車運（fortune-2027.html など。元日の Threads 投稿と同じ計算: threads-bot/src/fortune.mjs の yearRanking / luckyMonth）
  var YEAR_WORDS = [
    "遠出の計画がどんどん当たる1年。行きたかった場所へ",
    "愛車との相性が深まる1年。手をかけるほど応えてくれる",
    "新しい道・新しい景色に縁がある1年",
    "こまめな点検が運を呼ぶ1年。小さな気づきが大きな安心に",
    "同乗者との時間が宝になる1年。ドライブの予定を増やして",
    "季節ごとの準備がうまくいく1年。早め早めが吉",
    "いつもの道にこそ発見がある1年。寄り道を楽しんで",
    "片付け上手で運気が整う1年。車内をすっきりと",
    "落ち着いたペースが吉の1年。急がずゆとりを持って",
    "安全運転がそのまま運気アップにつながる1年",
    "早めの相談が流れを変える1年。気になる音は放っておかないで",
    "守りを固めると後半に伸びる1年。点検を味方に"
  ];
  function buildYear(year) {
    var rand = seeded("nova83lab-fortune-year-" + year);
    var list = SIGNS.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    // ラッキー月は12か月を並べ替えて、星座ごとに別の月を1つずつ（SIGNS の並び順で割り当てる）
    var months = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "nova83lab-year-month-" + year);
    return list.map(function (s, i) {
      var rank = i + 1;
      var k = 0;
      SIGNS.forEach(function (x, n) { if (x[1] === s[1]) k = n; });
      return { mark: s[0], name: s[1], rank: rank, stars: stars(rank), word: YEAR_WORDS[i], month: months[k] };
    });
  }

  // 毎朝の投稿画像づくり（.claude/skills/work-page/scripts/fortune-images.js）からも同じ計算を使う
  window.NovaFortune = { build: build, buildYear: buildYear, todayJst: todayJst };

  var yearRoot = document.getElementById("fortune-year");
  if (yearRoot) {
    var yRows = buildYear(Number(yearRoot.getAttribute("data-year")));
    var yKey = "nova-fortune-sign";
    var ySaved = null;
    try { ySaved = localStorage.getItem(yKey); } catch (e) { /* 保存できない環境 */ }
    yearRoot.innerHTML = yRows.map(function (x) {
      return '<li class="fortune-row' + (x.name === ySaved ? " is-mine" : "") + '">' +
        '<span class="fortune-rank">' + x.rank + "位</span>" +
        '<span class="fortune-name"><span class="fortune-mark">' + x.mark + "</span>" + esc(x.name) + "</span>" +
        '<span class="fortune-word">' + esc(x.word) + "</span>" +
        '<span class="fortune-item">🗓 ラッキー月：' + x.month + "月</span></li>";
    }).join("");
  }

  var root = document.getElementById("fortune");
  if (!root) return;
  var date = todayJst();
  var parts = date.split("-");
  var today = build(date);
  var careIdx = today.careIdx;
  var rows = today.rows;

  document.getElementById("fortune-date").textContent = Number(parts[1]) + "月" + Number(parts[2]) + "日";
  var care = LUCKY_CARE[careIdx];
  var careEl = document.getElementById("fortune-care");
  careEl.innerHTML = CARE_LINK[careIdx]
    ? '<a href="' + CARE_LINK[careIdx] + '" data-track="fortune.html#care">' + esc(care) + "</a>"
    : esc(care);

  var picker = document.getElementById("fortune-picker");
  var card = document.getElementById("fortune-card");
  var list = document.getElementById("fortune-list");
  var KEY = "nova-fortune-sign";
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* 保存できない環境 */ }

  picker.innerHTML = SIGNS.map(function (s) {
    return '<button type="button" class="fortune-sign" data-sign="' + s[1] + '"><span class="fortune-mark">' + s[0] + "</span>" + s[1] + "</button>";
  }).join("");

  function render(sign) {
    var r = null;
    rows.forEach(function (x) { if (x.name === sign) r = x; });
    Array.prototype.forEach.call(picker.children, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-sign") === sign ? "true" : "false");
    });
    if (r) {
      card.hidden = false;
      card.innerHTML =
        '<p class="fortune-card-rank"><span class="fortune-mark">' + r.mark + "</span>" + esc(r.name) + "は <strong>" + r.rank + "位</strong></p>" +
        '<p class="fortune-stars" aria-label="5段階で' + (r.stars.split("★").length - 1) + '">' + r.stars + "</p>" +
        '<p class="fortune-word">' + esc(r.word) + "</p>" +
        '<p class="fortune-item">ラッキーアイテム：' + esc(r.item) + "</p>";
    } else {
      card.hidden = true;
    }
    list.innerHTML = rows.map(function (x) {
      return '<li class="fortune-row' + (x.name === sign ? " is-mine" : "") + '">' +
        '<span class="fortune-rank">' + x.rank + "位</span>" +
        '<span class="fortune-name"><span class="fortune-mark">' + x.mark + "</span>" + esc(x.name) + "</span>" +
        '<span class="fortune-word">' + esc(x.word) + "</span>" +
        '<span class="fortune-item">🎁 ' + esc(x.item) + "</span></li>";
    }).join("");
  }

  picker.addEventListener("click", function (e) {
    var b = e.target.closest(".fortune-sign");
    if (!b) return;
    var sign = b.getAttribute("data-sign");
    try { localStorage.setItem(KEY, sign); } catch (err) { /* 保存できない環境 */ }
    render(sign);
    if (window.dataLayer) window.dataLayer.push({ event: "fortune_sign", fortune_sign: sign });
  });
  render(saved);
})();
