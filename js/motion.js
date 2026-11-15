/* Al-Mabrur Hajj & Umrah — animation layer built on Motion (the vanilla-JS edition of Framer Motion).
   Loaded as a module. With reduced motion or no JS, every element is already visible and static. */
import { animate, scroll, inView, stagger, hover } from "https://cdn.jsdelivr.net/npm/motion@14.3.0/+esm";

const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24 };
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

setupHeroVideo();

if (reduceMotion) {
  root.classList.remove("m-pending");
} else {
  root.classList.add("motion");
  intro();
  revealOnScroll();
  counters();
  parallax();
  progressBar();
  hoverEffects();
  packageTabs();
  faqAccordion();
}

/* ---------- Hero video: fade in once playing, pause off-screen, user toggle ---------- */
function setupHeroVideo() {
  const video = $("[data-hero-video]");
  if (!video) return;
  const toggle = $("[data-video-toggle]");
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduceMotion || saveData || !video.querySelector("source")) {
    video.remove();
    toggle?.remove();
    return;
  }
  let userPaused = false;
  const show = () => {
    video.classList.add("is-playing");
    animate(video, { opacity: [0, 1] }, { duration: 1.2, ease: EASE });
    if (toggle) toggle.hidden = false;
  };
  if (!video.paused && video.readyState > 2) show();
  else video.addEventListener("playing", show, { once: true });
  video.play().catch(() => {});

  toggle?.addEventListener("click", () => {
    userPaused = !video.paused;
    if (userPaused) video.pause(); else video.play();
    toggle.setAttribute("aria-pressed", String(userPaused));
    toggle.querySelector(".sr-only").textContent = userPaused ? "ব্যাকগ্রাউন্ড ভিডিও চালু করুন" : "ব্যাকগ্রাউন্ড ভিডিও থামান";
  });
  inView(video, () => {
    if (!userPaused) video.play().catch(() => {});
    return () => video.pause();
  });
}

/* ---------- Split a heading into word spans that rise in (text stays intact for SEO/screen readers) ---------- */
function splitWords(el) {
  const words = [];
  const wrap = (node) => {
    const outer = document.createElement("span");
    outer.className = "m-word";
    const inner = document.createElement("span");
    inner.className = "m-word__inner";
    outer.appendChild(inner);
    node.replaceWith(outer);
    inner.appendChild(node);
    words.push(inner);
  };
  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement("span");
        outer.className = "m-word";
        outer.innerHTML = '<span class="m-word__inner"></span>';
        outer.firstChild.textContent = part;
        frag.appendChild(outer);
        words.push(outer.firstChild);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      wrap(node);
    }
  });
  return words;
}

/* ---------- Above-the-fold entrance ---------- */
function intro() {
  const hero = $(".hero");
  const pageHero = $(".page-hero");
  const copy = hero ? $(".hero__copy", hero) : pageHero ? $(".page-hero__copy", pageHero) : null;
  if (!copy) { root.classList.remove("m-pending"); return; }

  const title = $("h1", copy);
  const words = title ? splitWords(title) : [];
  const rest = Array.from(copy.children).filter((el) => el !== title);
  const media = hero ? $(".hero__media", hero) : pageHero ? $(".page-hero__media", pageHero) : null;
  const arch = media && $(".arch", media);
  const archImg = arch && $("img", arch);
  const ring = media && $(".hero__arch-ring, .page-hero__ring", media);
  const cards = hero ? $$(".float-card", hero) : [];
  const calli = hero && $(".hero__calli", hero);
  const finder = hero && $(".finder", hero);

  // Set start states, then lift the CSS guard so nothing flashes
  words.forEach((w) => (w.style.transform = "translateY(110%)"));
  rest.forEach((el) => (el.style.opacity = "0"));
  [ring, calli, finder, ...cards].forEach((el) => el && (el.style.opacity = "0"));
  if (arch) arch.style.clipPath = "inset(100% 0% 0% 0%)";
  root.classList.remove("m-pending");

  if (title) title.style.opacity = "1";
  animate(words, { y: ["110%", "0%"] }, { duration: 0.9, ease: EASE, delay: stagger(0.06, { startDelay: 0.1 }) });
  animate(rest, { opacity: [0, 1], y: [22, 0], filter: ["blur(6px)", "blur(0px)"] }, { duration: 0.8, ease: EASE, delay: stagger(0.08, { startDelay: 0.35 }) });

  if (arch) {
    animate(arch, { clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] }, { duration: 1.2, ease: EASE, delay: 0.15 });
    if (archImg) animate(archImg, { scale: [1.12, 1] }, { duration: 1.6, ease: EASE, delay: 0.15 }); // on top of the CSS parallax scale
  }
  if (ring) animate(ring, { opacity: [0, 0.7], scale: [0.94, 1] }, { duration: 1.2, ease: EASE, delay: 0.5 });
  if (calli) animate(calli, { opacity: [0, 1], y: [16, 0] }, { duration: 1, ease: EASE, delay: 1.1 });
  cards.forEach((card, i) => {
    animate(card, { opacity: [0, 1], scale: [0.7, 1], y: [24, 0] }, { type: "spring", bounce: 0.45, visualDuration: 0.7, delay: 0.9 + i * 0.18 })
      .then(() => animate(card, { y: [0, -8, 0] }, { duration: 6, ease: "easeInOut", repeat: Infinity, delay: i * 1.5 }));
  });
  if (finder) animate(finder, { opacity: [0, 1], y: [40, 0] }, { duration: 0.9, ease: EASE, delay: 0.55 });
}

/* ---------- Scroll reveals: each group staggers its children in ---------- */
function revealOnScroll() {
  const groups = [
    [".section-head, .faq__head, .dates__intro, .why__intro, .guide__body, .contact__copy, .cta-band__copy", ":scope > *"],
    [".trust__list", ":scope > li"],
    [".answer", null],
    [".tabs__list", null],
    [".family-strip, .section-more, .feature-link, .table-wrap, .map", null],
    [".bento", ":scope > *"],
    [".stats", ":scope > *"],
    [".steps", ":scope > *"],
    [".rites", ":scope > *"],
    [".docs", ":scope > *"],
    [".timeline", ":scope > li"],
    [".team", ":scope > *"],
    [".reviews", ":scope > *"],
    [".gallery", ":scope > *"],
    [".chips", ":scope > li"],
    [".faq__list", ":scope > details"],
    [".posts", ":scope > *"],
    [".pkg-grid--static", ":scope > *"],
    [".values", ":scope > li"],
    [".form, .aside-card, .cta-band__actions, .article__cover", null],
  ];
  const firstPanel = $(".tabs__panel");
  if (firstPanel) groups.push([`#${firstPanel.id}`, ":scope > *"]);

  const seen = new Set();
  groups.forEach(([selector, childSel]) => {
    $$(selector).forEach((group) => {
      if (group.closest(".hero, .page-hero")) return;
      const items = childSel ? Array.from(group.querySelectorAll(childSel)) : [group];
      const fresh = items.filter((el) => !seen.has(el));
      if (!fresh.length) return;
      fresh.forEach((el) => { seen.add(el); el.style.opacity = "0"; });
      inView(group, () => {
        animate(fresh, { opacity: [0, 1], y: [36, 0] }, { duration: 0.85, ease: EASE, delay: stagger(0.08) });
      }, { margin: "0px 0px -12% 0px" });
    });
  });

  // Images "unveil" from the bottom like the hero arch
  $$(".guide__media .arch, .bento__item--image").forEach((el) => {
    el.style.clipPath = "inset(100% 0% 0% 0%)";
    inView(el, () => {
      animate(el, { clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] }, { duration: 1.2, ease: EASE });
    }, { margin: "0px 0px -15% 0px" });
  });
}

/* ---------- Count-up numbers ---------- */
function counters() {
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    // Bangla digits with Bangladeshi grouping (১২,০০০)
    const format = (n) => n.toLocaleString("bn-BD", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    el.textContent = format(0);
    inView(el, () => {
      animate(0, target, { duration: 1.8, ease: EASE, onUpdate: (v) => (el.textContent = format(v)) });
    });
  });
}

/* ---------- Parallax on large imagery ---------- */
function parallax() {
  const targets = [".hero__arch", ".page-hero__arch", ".contact__bg", ".bento__item--image", ".guide__media .arch"];
  $$(targets.join(",")).forEach((frame) => {
    const image = $("img", frame);
    if (!image) return;
    frame.setAttribute("data-parallax", "");
    scroll(animate(image, { y: ["-6%", "6%"] }, { ease: "linear" }), { target: frame, offset: ["start end", "end start"] });
  });
}

/* ---------- Thin gold reading-progress bar in the header ---------- */
function progressBar() {
  const bar = $(".m-progress");
  if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: "linear" }));
}

/* ---------- Hover: spring lift on cards, gentle 3D tilt on packages, magnetic CTAs ---------- */
function hoverEffects() {
  if (!finePointer) return;
  hover(".bento__item, .review, .member, .post__link, .docs__card, .step, .rite, .values li", (el) => {
    animate(el, { y: -6 }, SPRING);
    return () => animate(el, { y: 0 }, SPRING);
  });
  $$(".pkg").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      animate(card, { rotateY: px * 6, rotateX: -py * 6, y: -8, transformPerspective: 900 }, SPRING);
    });
    card.addEventListener("pointerleave", () => animate(card, { rotateY: 0, rotateX: 0, y: 0 }, SPRING));
  });
  $$(".hero__ctas .btn, .finder__submit, .cta-band__actions .btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      animate(btn, { x: (e.clientX - r.left - r.width / 2) * 0.15, y: (e.clientY - r.top - r.height / 2) * 0.25 }, SPRING);
    });
    btn.addEventListener("pointerleave", () => animate(btn, { x: 0, y: 0 }, SPRING));
  });
}

/* ---------- Package tabs: stagger the cards of the newly selected panel ---------- */
function packageTabs() {
  $$(".tabs__radio").forEach((radio) => {
    radio.addEventListener("change", () => {
      const panel = $(`#p-${radio.id.replace("t-", "")}`);
      if (!panel) return;
      animate(Array.from(panel.children), { opacity: [0, 1], y: [30, 0], scale: [0.97, 1] }, { duration: 0.6, ease: EASE, delay: stagger(0.07) });
    });
  });
}

/* ---------- FAQ: animate <details> open and close ---------- */
function faqAccordion() {
  $$(".faq__item").forEach((item) => {
    const summary = $("summary", item);
    const answer = $("p", item);
    if (!summary || !answer) return;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (item.open) {
        animate(answer, { height: [`${answer.offsetHeight}px`, "0px"], opacity: [1, 0] }, { duration: 0.3, ease: EASE })
          .then(() => { item.open = false; answer.style.height = ""; answer.style.opacity = ""; });
      } else {
        item.open = true;
        const h = answer.offsetHeight;
        animate(answer, { height: ["0px", `${h}px`], opacity: [0, 1] }, { duration: 0.4, ease: EASE })
          .then(() => { answer.style.height = ""; });
      }
    });
  });
}
