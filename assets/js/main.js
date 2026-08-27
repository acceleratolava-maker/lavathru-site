/* ============================================================
   LAVA THRU — interações
   O catavento é a escova: gira sozinho, acelera com o scroll,
   dispara no hover e SOLTA ESPUMA enquanto gira rápido —
   as bolhas voam das pontas das gotas, na direção do giro.
   ============================================================ */
(function () {
  "use strict";

  var reduzMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Intro: chantili lava a tela (1x por visita) ----------
     O gate está inline no HTML (decide rodar/pular ANTES do primeiro paint);
     aqui fica só a limpeza. */
  var intro = document.getElementById("introEspuma");
  if (intro && intro.classList.contains("intro-vai")) {
    try { sessionStorage.setItem("lt_intro", "1"); } catch (e) {}
    var encerrarIntro = function () {
      if (!intro) return;
      intro.remove();
      intro = null;
      document.body.classList.remove("intro-rodando");
      document.dispatchEvent(new CustomEvent("lt:intro-fim"));
    };
    intro.querySelector(".intro-fluxo").addEventListener("animationend", encerrarIntro);
    intro.addEventListener("click", encerrarIntro); // pular
    setTimeout(encerrarIntro, 3400);                // guarda anti-travamento
  } else if (intro) {
    intro.remove();
    intro = null;
  }

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

  /* ============================================================
     Catavento herói: física de escova + emissão de espuma
     ============================================================ */
  var pwSvg = document.querySelector(".pw-hero");
  var palco = document.querySelector(".hero-palco");

  if (pwSvg && palco && !reduzMotion) {
    var angulo = 0;
    var vel = 0.28;            // graus/frame
    var VEL_BASE = 0.28;       // giro de descanso
    /* flourish de chegada: se a intro estiver rodando, espera a espuma escorrer */
    var boost = document.body.classList.contains("intro-rodando") ? 3 : 34;
    document.addEventListener("lt:intro-fim", function () { boost = 34; }, { once: true });
    var hover = false;
    var emitAcc = 0;
    var bolhasAtivas = 0;

    window.addEventListener("scroll", function () {
      var delta = Math.abs(window.scrollY - ultimoY);
      ultimoY = window.scrollY;
      boost = Math.min(boost + delta * 0.06, 24);
    }, { passive: true });

    palco.addEventListener("mouseenter", function () { hover = true; });
    palco.addEventListener("mouseleave", function () { hover = false; });
    palco.addEventListener("click", function (ev) {
      boost = Math.min(boost + 30, 46);
      var rect = palco.getBoundingClientRect();
      explodirEspuma(ev.clientX - rect.left, ev.clientY - rect.top);
    });

    var criarBolha = function (x, y, tam, dx, dy, dur) {
      if (bolhasAtivas > 120) return;
      var b = document.createElement("span");
      b.className = "bolha";
      b.style.width = tam + "px";
      b.style.height = tam + "px";
      b.style.left = x - tam / 2 + "px";
      b.style.top = y - tam / 2 + "px";
      b.style.setProperty("--dx", dx + "px");
      b.style.setProperty("--dy", dy + "px");
      b.style.setProperty("--dur", dur + "s");
      bolhasAtivas++;
      palco.appendChild(b);
      b.addEventListener("animationend", function () { this.remove(); bolhasAtivas--; });
    };

    var explodirEspuma = function (cx, cy) {
      for (var i = 0; i < 28; i++) {
        criarBolha(
          cx, cy,
          9 + Math.random() * 28,
          Math.random() * 260 - 130,
          -(160 + Math.random() * 320),
          2.2 + Math.random() * 2.2
        );
      }
    };

    /* espuma voando das pontas das gotas, tangente ao giro (horário) */
    var espumaDaEscova = function (forca) {
      var pr = palco.getBoundingClientRect();
      var sr = pwSvg.getBoundingClientRect();
      var cx = sr.left - pr.left + sr.width / 2;
      var cy = sr.top - pr.top + sr.height / 2;
      var raio = sr.width / 2;
      var th = Math.random() * Math.PI * 2;
      var px = cx + Math.cos(th) * raio * (0.80 + Math.random() * 0.18);
      var py = cy + Math.sin(th) * raio * (0.80 + Math.random() * 0.18);
      var k = 30 + forca * 11 + Math.random() * 30;   // arremesso tangencial
      var fora = 24 + Math.random() * 40;             // empurrão pra fora
      var dx = -Math.sin(th) * k + Math.cos(th) * fora;
      var dy = Math.cos(th) * k + Math.sin(th) * fora - (70 + Math.random() * 150);
      criarBolha(px, py, 9 + Math.random() * 21, dx, dy, 1.3 + Math.random() * 1.2);
    };

    (function girar() {
      var alvoHover = hover ? 11 : 0;
      vel += ((VEL_BASE + alvoHover + boost) - vel) * 0.06;
      boost *= 0.965;
      angulo = (angulo + vel) % 360;
      pwSvg.style.transform = "rotate(" + angulo + "deg)";

      /* quanto mais rápido a escova gira, mais espuma sai — em tufos */
      if (vel > 1.0 && !document.hidden) {
        emitAcc += vel - 0.7;
        if (emitAcc > 14) {
          emitAcc = 0;
          var jato = vel > 6 ? 4 : 2;
          for (var j = 0; j < jato; j++) espumaDaEscova(Math.min(vel, 12));
        }
      }
      requestAnimationFrame(girar);
    })();

    /* bolhas ambientes espaçadas, pra cena nunca ficar morta */
    setInterval(function () {
      if (document.hidden || window.scrollY > window.innerHeight) return;
      criarBolha(
        palco.clientWidth * (0.1 + Math.random() * 0.8),
        palco.clientHeight * (0.55 + Math.random() * 0.4),
        8 + Math.random() * 18,
        Math.random() * 120 - 60,
        -(220 + Math.random() * 260),
        3.5 + Math.random() * 2.5
      );
    }, 1500);
  }

  /* ---------- Tilt 3D nos cards de plano ---------- */
  if (!reduzMotion && temHover) {
    document.querySelectorAll(".plano").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
