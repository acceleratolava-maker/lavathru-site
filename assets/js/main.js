/* ============================================================
   LAVA THRU — interações
   O catavento é a escova: gira sozinho, acelera com o scroll,
   dispara no hover e solta espuma no clique.
   ============================================================ */
(function () {
  "use strict";

  var reduzMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: estado ao rolar ---------- */
  var header = document.querySelector(".site-header");
  var ultimoY = window.scrollY;

  function aoRolar() {
    if (header) header.classList.toggle("rolou", window.scrollY > 24);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".menu-mobile");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      toggle.classList.toggle("aberto", aberto);
      document.body.classList.toggle("menu-aberto", aberto);
      toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
      document.body.style.overflow = aberto ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("aberto");
        toggle.classList.remove("aberto");
        document.body.classList.remove("menu-aberto");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal on scroll (com stagger) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduzMotion) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Contadores animados ---------- */
  var contadores = document.querySelectorAll("[data-count]");
  if (contadores.length && "IntersectionObserver" in window) {
    var obsNum = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          obsNum.unobserve(e.target);
          var el = e.target;
          var alvo = parseFloat(el.getAttribute("data-count"));
          var sufixo = el.getAttribute("data-suffix") || "";
          var prefixo = el.getAttribute("data-prefix") || "";
          if (reduzMotion) { el.textContent = prefixo + alvo + sufixo; return; }
          var inicio = null;
          var dur = 1400;
          function passo(ts) {
            if (!inicio) inicio = ts;
            var p = Math.min((ts - inicio) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefixo + Math.round(alvo * eased) + sufixo;
            if (p < 1) requestAnimationFrame(passo);
          }
          requestAnimationFrame(passo);
        });
      },
      { threshold: 0.6 }
    );
    contadores.forEach(function (el) { obsNum.observe(el); });
  }

  /* ---------- Catavento herói: física de escova ---------- */
  var pwHero = document.querySelector(".pw-hero .pw-rotor") || document.querySelector(".pw-hero");
  var palco = document.querySelector(".hero-palco");

  if (pwHero && !reduzMotion) {
    var angulo = 0;
    var vel = 0.18;           // graus/frame — giro de descanso
    var VEL_BASE = 0.18;
    var boost = 0;            // impulso temporário
    var hover = false;

    window.addEventListener("scroll", function () {
      var delta = Math.abs(window.scrollY - ultimoY);
      ultimoY = window.scrollY;
      boost = Math.min(boost + delta * 0.045, 16);
    }, { passive: true });

    if (palco) {
      palco.addEventListener("mouseenter", function () { hover = true; });
      palco.addEventListener("mouseleave", function () { hover = false; });
      palco.addEventListener("click", function (ev) {
        boost = Math.min(boost + 24, 34);
        soltarEspuma(ev);
      });
    }

    (function girar() {
      var alvoHover = hover ? 5.2 : 0;
      vel += ((VEL_BASE + alvoHover + boost) - vel) * 0.06;
      boost *= 0.955;
      angulo = (angulo + vel) % 360;
      pwHero.style.transform = "rotate(" + angulo + "deg)";
      requestAnimationFrame(girar);
    })();
  }

  /* ---------- Espuma (bolhas) no clique ---------- */
  function soltarEspuma(ev) {
    if (!palco || reduzMotion) return;
    var rect = palco.getBoundingClientRect();
    var cx = ev.clientX - rect.left;
    var cy = ev.clientY - rect.top;
    for (var i = 0; i < 14; i++) {
      var b = document.createElement("span");
      b.className = "bolha";
      var tam = 8 + Math.random() * 26;
      b.style.width = tam + "px";
      b.style.height = tam + "px";
      b.style.left = cx - tam / 2 + "px";
      b.style.top = cy - tam / 2 + "px";
      b.style.setProperty("--dx", (Math.random() * 260 - 130) + "px");
      b.style.setProperty("--dy", -(160 + Math.random() * 320) + "px");
      b.style.setProperty("--dur", (2.2 + Math.random() * 2.2) + "s");
      palco.appendChild(b);
      b.addEventListener("animationend", function () { this.remove(); });
    }
  }

  /* ---------- Bolhas ambiente no hero (a cada poucos segundos) ---------- */
  var hero = document.querySelector(".hero");
  if (hero && palco && !reduzMotion) {
    setInterval(function () {
      if (document.hidden) return;
      if (window.scrollY > window.innerHeight) return;
      var b = document.createElement("span");
      b.className = "bolha";
      var tam = 6 + Math.random() * 16;
      b.style.width = tam + "px";
      b.style.height = tam + "px";
      b.style.left = (10 + Math.random() * 80) + "%";
      b.style.top = (55 + Math.random() * 40) + "%";
      b.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      b.style.setProperty("--dy", -(220 + Math.random() * 260) + "px");
      b.style.setProperty("--dur", (3.5 + Math.random() * 2.5) + "s");
      palco.appendChild(b);
      b.addEventListener("animationend", function () { this.remove(); });
    }, 1700);
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
