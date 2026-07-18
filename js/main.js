/* ==========================================================================
   NOVA_83LAB — main.js
   ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------ boot sequence ------------------------------ */
  const bootScreen = document.getElementById("boot-screen");
  const bootLines = document.getElementById("boot-lines");
  const bootSkip = document.getElementById("boot-skip");

  const BOOT_SEQUENCE = [
    { text: "> INITIALIZING NOVA_83LAB KERNEL...", delay: 25 },
    { text: "> LOADING EXPERIMENTS MODULE...", delay: 20 },
    { text: "> LOADING WORKS INDEX...", delay: 20 },
    { text: "> CALIBRATING NEON SUBSYSTEM...", delay: 20 },
    { text: "> ACCESS GRANTED", delay: 15, ok: true },
  ];

  function typeLine(lineEl, text, speed = 12){
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        lineEl.textContent = text.slice(0, i);
        i++;
        if (i <= text.length){
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  async function runBoot(){
    if (!bootLines) return finishBoot();
    for (const step of BOOT_SEQUENCE){
      const line = document.createElement("div");
      if (step.ok) line.classList.add("ok");
      bootLines.appendChild(line);
      await typeLine(line, step.text, 10);
      await new Promise(r => setTimeout(r, step.delay));
    }
    await new Promise(r => setTimeout(r, 250));
    finishBoot();
  }

  function finishBoot(){
    if (!bootScreen || bootScreen.classList.contains("hidden")) return;
    bootScreen.classList.add("hidden");
    document.body.style.overflow = "";
  }

  if (bootScreen){
    document.body.style.overflow = "hidden";
    bootSkip && bootSkip.addEventListener("click", finishBoot);
    // safety net: never trap the user
    setTimeout(finishBoot, 4500);
    runBoot();
  }

  /* ------------------------------ custom cursor ------------------------------ */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (cursorDot && cursorRing && !isCoarsePointer){
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = "a, button, .service-card, .stat, .shop-info, .lightbox-trigger";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.remove("is-hover");
    });
  }

  /* ------------------------------ header state ------------------------------ */
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  if (navToggle && siteNav){
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    siteNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------ reveal on scroll ------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in-view"));
  }

  /* ------------------------------ stat counters ------------------------------ */
  const statNums = document.querySelectorAll(".stat-num");
  function animateCount(el){
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (statNums.length && "IntersectionObserver" in window){
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(el => statIo.observe(el));
  }

  /* ------------------------------ terminal typing (about) ------------------------------ */
  const terminalBody = document.getElementById("terminal-body");
  const TERMINAL_LINES = [
    { prompt: "$ ", text: "whoami", cls: "val" },
    { prompt: "> ", text: "nova_83lab // mechanic, developer & designer", cls: "comment" },
    { prompt: "$ ", text: "cat mission.txt", cls: "val" },
    { prompt: "> ", text: "好奇心を実装に変える。クルマも、コードも、デザインも。", cls: "comment" },
    { prompt: "$ ", text: "services --list", cls: "val" },
    { prompt: "> ", text: "整備 / 車検 / 改造 / デザイン制作", cls: "comment" },
    { prompt: "$ ", text: "status --check", cls: "val" },
    { prompt: "> ", text: "BUILDING SOMETHING NEW...", cls: "ok-text" },
  ];

  async function typeTerminal(){
    if (!terminalBody) return;
    for (const line of TERMINAL_LINES){
      const row = document.createElement("div");
      const promptSpan = document.createElement("span");
      promptSpan.className = "prompt";
      promptSpan.textContent = line.prompt;
      const textSpan = document.createElement("span");
      textSpan.className = line.cls || "";
      row.appendChild(promptSpan);
      row.appendChild(textSpan);
      terminalBody.appendChild(row);
      await typeLine(textSpan, line.text, 22);
      await new Promise(r => setTimeout(r, 200));
    }
    const cursorRow = document.createElement("div");
    cursorRow.innerHTML = '<span class="prompt">$ </span><span class="blink-cursor"></span>';
    terminalBody.appendChild(cursorRow);
  }

  if (terminalBody && "IntersectionObserver" in window){
    const termIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          typeTerminal();
          termIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    termIo.observe(terminalBody);
  }

  /* ------------------------------ lightbox ------------------------------ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  if (lightbox && lightboxImg){
    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lightboxImg.src = "";
    };

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".lightbox-trigger");
      if (trigger){
        const img = trigger.querySelector("img");
        openLightbox(trigger.dataset.full || img?.src, img?.alt);
        return;
      }
      if (e.target === lightbox) closeLightbox();
    });
    lightboxClose && lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ------------------------------ visitor counter ------------------------------ */
  const counterValue = document.getElementById("counter-value");
  if (counterValue){
    fetch("https://abacus.jasoncameron.dev/hit/nova83lab-site/visits")
      .then(res => res.json())
      .then(data => {
        const n = String(data.value).padStart(6, "0");
        counterValue.textContent = n;
      })
      .catch(() => {
        counterValue.textContent = "------";
      });
  }

  /* ------------------------------ particle network background ------------------------------ */
  const canvas = document.getElementById("bg-canvas");
  if (canvas && canvas.getContext){
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    let mouse = { x: null, y: null };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const density = Math.min(90, Math.floor((w * h) / 22000));
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseout", () => { mouse.x = null; mouse.y = null; });

    resize();

    function step(){
      ctx.clearRect(0, 0, w, h);

      for (const p of particles){
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.x !== null){
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140){
            const force = (140 - dist) / 140 * 0.02;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        // gentle speed clamp
        p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
        p.vy = Math.max(-0.6, Math.min(0.6, p.vy));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255,0.55)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++){
        for (let j = i + 1; j < particles.length; j++){
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130){
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(123,47,247,${(1 - dist / 130) * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) requestAnimationFrame(step);
    }
    step();
  }

})();
