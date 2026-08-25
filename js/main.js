/* ==========================================================================
   MAYZAH — Maquiadora Profissional
   Interações: preloader, navegação, reveals, slider, contadores, WhatsApp
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------
     Configuração central (edite aqui o WhatsApp e o Instagram)
     -------------------------------------------------------------------- */
  var WA_NUMBER = "5594991621215";               // formato internacional, ex.: 5511999999999
  var WA_MESSAGE = "Olá, Mayzah! Quero agendar um horário de maquiagem.";
  var IG_URL = "https://www.instagram.com/mayzah_maquiadora/";

  function waHref() {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_MESSAGE);
  }

  var body = document.body;

  // Atributos no <body> têm prioridade (fácil de trocar no HTML)
  if (body.dataset.whatsapp) WA_NUMBER = body.dataset.whatsapp;
  if (body.dataset.whatsappMsg) WA_MESSAGE = body.dataset.whatsappMsg;
  if (body.dataset.instagram) IG_URL = body.dataset.instagram;

  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = waHref();
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  document.querySelectorAll("[data-ig]").forEach(function (el) {
    el.href = IG_URL;
  });

  /* --------------------------------------------------------------------
     Preloader
     -------------------------------------------------------------------- */
  var preloader = document.getElementById("preloader");
  if (preloader) {
    function hidePreloader() {
      preloader.classList.add("is-hidden");
      document.body.classList.add("is-loaded");
      setTimeout(function () { preloader.style.display = "none"; }, 1000);
    }
    if (document.readyState === "complete") {
      setTimeout(hidePreloader, 700);
    } else {
      window.addEventListener("load", function () { setTimeout(hidePreloader, 700); });
      setTimeout(hidePreloader, 3500); // segurança
    }
  }

  /* --------------------------------------------------------------------
     Navegação
     -------------------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");

  function onScroll() {
    var past = window.scrollY > 40;
    nav && nav.classList.toggle("is-solid", past);
    // No topo, textos do nav são claros; abaixo, escuros.
    if (nav) nav.style.setProperty("color", past ? "var(--ink)" : "inherit");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function toggleMenu(open) {
    var isOpen = typeof open === "boolean" ? open : !mobileMenu.classList.contains("is-open");
    mobileMenu.classList.toggle("is-open", isOpen);
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  burger && burger.addEventListener("click", function () { toggleMenu(); });

  mobileMenu && mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { toggleMenu(false); });
  });

  /* --------------------------------------------------------------------
     Reveal on scroll
     -------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Garantir reveals dentro do menu móvel nunca ficam travados
  mobileMenu && mobileMenu.querySelectorAll(".reveal").forEach(function (el) {
    el.classList.add("is-visible");
  });

  /* --------------------------------------------------------------------
     Contadores da seção Sobre
     -------------------------------------------------------------------- */
  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var dur = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = parseInt(c.dataset.count, 10).toLocaleString("pt-BR"); });
  }

  /* --------------------------------------------------------------------
     Slider de depoimentos
     -------------------------------------------------------------------- */
  var track = document.getElementById("sliderTrack");
  if (track) {
    var dotsWrap = document.getElementById("sliderDots");
    var slides = track.children;
    var index = 0;
    var count = slides.length;
    var timer = null;

    // criar dots
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
      dot.__i = i;
      dot.addEventListener("click", function () { goTo(this.__i); });
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.children;

    function goTo(n) {
      index = (n + count) % count;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      for (var i = 0; i < count; i++) {
        dots[i].classList.toggle("is-active", i === index);
      }
      restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = setInterval(function () { goTo(index + 1); }, 7000);
      }
    }

    document.getElementById("sliderPrev").addEventListener("click", function () { goTo(index - 1); });
    document.getElementById("sliderNext").addEventListener("click", function () { goTo(index + 1); });
    goTo(0);
  }

  /* --------------------------------------------------------------------
     Ano do rodapé
     -------------------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
