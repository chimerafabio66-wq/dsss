/* =========================================================
   DASUL VIDROS — main.js
   ---------------------------------------------------------
   >>> CONFIG: substitua os valores abaixo pelos dados reais <<<
   ========================================================= */
const CONFIG = {
  // Somente números, com DDI + DDD. Ex.: "5554991234567"
  whatsappNumber: "5554999999999",

  // Mensagem padrão dos botões de WhatsApp
  whatsappMessage:
    "Olá! Vim pelo site da DASUL VIDROS e gostaria de solicitar um orçamento.",

  // Número exibido no rodapé (WhatsApp e telefone)
  whatsappDisplay: "(54) 99999-9999",
  phoneDisplay: "(54) 3333-0000",
  phoneHref: "tel:+555433330000",

  // Endereço exibido no rodapé
  address: "Caxias do Sul · RS",
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const whatsappUrl = (message) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    message || CONFIG.whatsappMessage
  )}`;

/* ---------- Config aplicada na página ---------- */
function applyConfig() {
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.setAttribute("href", whatsappUrl());
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  const phoneLinks = document.querySelectorAll("[data-phone-link]");
  phoneLinks.forEach((el) => el.setAttribute("href", CONFIG.phoneHref));

  const waDisplay = document.querySelector("[data-wa-display]");
  if (waDisplay) waDisplay.textContent = CONFIG.whatsappDisplay;

  const phoneDisplay = document.querySelector("[data-phone-display]");
  if (phoneDisplay) phoneDisplay.textContent = CONFIG.phoneDisplay;

  const address = document.querySelector("[data-address]");
  if (address) address.textContent = CONFIG.address;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Anos de atuação contados a partir de 2001
  const years = document.querySelector("[data-years]");
  if (years) years.textContent = String(new Date().getFullYear() - 2001);
}

/* ---------- Header ---------- */
function initHeader() {
  const header = document.getElementById("header");
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (!header) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const solid = window.scrollY > 24;
      header.classList.toggle("is-scrolled", solid);
      ticking = false;
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!toggle || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("no-scroll", open);
  };

  toggle.addEventListener("click", () =>
    setOpen(!header.classList.contains("nav-open"))
  );

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setOpen(false))
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setOpen(false);
  });
}

/* ---------- Reveal ao rolar ---------- */
function initReveal() {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  items.forEach((el) => {
    const delay = Number(el.getAttribute("data-delay") || 0);
    if (delay) el.style.setProperty("--reveal-delay", String(delay));
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Contadores ---------- */
function initCounters() {
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  if (!counters.length) return;

  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const run = (el) => {
    const target = Number(el.getAttribute("data-count"));
    const from = Number(el.getAttribute("data-from") || 0);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const plain = el.hasAttribute("data-plain");
    const duration = 1700;

    const format = (value) =>
      plain
        ? String(Math.round(value))
        : Math.round(value).toLocaleString("pt-BR");

    if (prefersReducedMotion) {
      el.textContent = prefix + format(target) + suffix;
      return;
    }

    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = from + (target - from) * easeOutExpo(progress);
      el.textContent = prefix + format(value) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- Parallax leve ---------- */
function initParallax() {
  const layers = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!layers.length) return;

  const enabled = () => !prefersReducedMotion && window.innerWidth > 900;

  const reset = (el) => {
    el.style.transform = "";
    el.style.translate = "";
  };

  let ticking = false;

  const update = () => {
    ticking = false;
    if (!enabled()) {
      layers.forEach(reset);
      return;
    }

    const viewport = window.innerHeight;
    layers.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = Number(el.getAttribute("data-speed") || 0.05);
      const offset = (viewport / 2 - (rect.top + rect.height / 2)) * speed;
      const shift = `${offset.toFixed(2)}px`;

      // Imagens usam a propriedade `translate` para não conflitar
      // com o `transform: scale()` do hover.
      if (el.tagName === "IMG") {
        el.style.translate = `0 ${shift}`;
      } else {
        el.style.transform = `translate3d(0, ${shift}, 0)`;
      }
    });
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
}

/* ---------- Máscara de telefone ---------- */
function initPhoneMask() {
  const input = document.getElementById("telefone");
  if (!input) return;

  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "").slice(0, 11);
    let out = digits;

    if (digits.length > 10) {
      out = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 6) {
      out = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
      out = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      out = `(${digits}`;
    }

    input.value = out;
  });
}

/* ---------- Formulário -> WhatsApp ---------- */
function initForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const note = document.getElementById("formNote");

  const setError = (field, message) => {
    const wrapper = field.closest(".field");
    const error = wrapper ? wrapper.querySelector(".field-error") : null;
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message || "";
  };

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => setError(field, ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = form.elements.nome;
    const telefone = form.elements.telefone;
    const descricao = form.elements.descricao;

    let valid = true;

    if (nome.value.trim().length < 2) {
      setError(nome, "Informe seu nome.");
      valid = false;
    }
    if (telefone.value.replace(/\D/g, "").length < 10) {
      setError(telefone, "Informe um telefone com DDD.");
      valid = false;
    }
    if (descricao.value.trim().length < 5) {
      setError(descricao, "Descreva brevemente o que você precisa.");
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector(".field.has-error input, .field.has-error textarea");
      if (firstError) firstError.focus();
      if (note) {
        note.classList.remove("is-ok");
        note.textContent = "Confira os campos destacados para continuar.";
      }
      return;
    }

    const message = [
      "*Orçamento — DASUL VIDROS*",
      `*Nome:* ${nome.value.trim()}`,
      `*Telefone:* ${telefone.value.trim()}`,
      `*Projeto:* ${descricao.value.trim()}`,
    ].join("\n");

    window.open(whatsappUrl(message), "_blank", "noopener");

    if (note) {
      note.classList.add("is-ok");
      note.textContent =
        "Pronto! Abrimos o WhatsApp com sua mensagem. Se não abrir, use o botão verde na tela.";
    }
    form.reset();
  });
}

/* ---------- Init ---------- */
function init() {
  applyConfig();
  initHeader();
  initReveal();
  initCounters();
  initParallax();
  initPhoneMask();
  initForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
