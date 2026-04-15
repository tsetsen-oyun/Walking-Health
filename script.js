/* ════════════════════════════════════════════════════════════
   SARANGUA — script.js
   Two independent modules:
     1. heroScrollTimeline  — GSAP ScrollTrigger animation
     2. initCarousel        — infinite-loop carousel with scroll-to-exit
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────
   Scroll-position reset — prevents mid-page start on reload
   ──────────────────────────────────────────────────────────── */
window.onbeforeunload = () => window.scrollTo(0, 0);
window.onload = () => {
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
};

/* ════════════════════════════════════════════════════════════
   MODULE 1 — HERO SCROLL TIMELINE
   ════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ── DOM refs ─────────────────────────────────────────────── */
  const heroEl       = document.querySelector(".hero");
  const navEl        = document.querySelector(".nav");
  const titleEl      = document.querySelector(".hero__title");
  const subtitleEl   = document.querySelector(".hero__subtitle");
  const ctaEl        = document.querySelector(".hero__cta");
  const waveEl       = document.querySelector(".hero__wave");
  const overlayEl    = document.querySelector(".hero__overlay");
  const gridEl       = document.querySelector(".hero__grid");

  /* ── Initial GSAP state ───────────────────────────────────── */
  gsap.set(gridEl,    { opacity: 0 });
  gsap.set(overlayEl, { opacity: 0 });
  gsap.set(waveEl,    { scaleY: 1, transformOrigin: "bottom center" });

  /* ── Helpers ──────────────────────────────────────────────── */

  /**
   * Maximum clip-path radius needed to cover the full viewport
   * from its centre point (corner-to-centre diagonal).
   */
  function getMaxClipRadius() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return Math.sqrt((vw / 2) ** 2 + (vh / 2) ** 2) + 10;
  }

  /**
   * Compute the scaleY multiplier needed for the wave element
   * to fill the full viewport height (with a small overshoot).
   */
  function getWaveFillScale() {
    const waveHeight = waveEl ? waveEl.offsetHeight : 220;
    return Math.ceil((window.innerHeight + 100) / waveHeight);
  }

  /* ── Timeline builder ─────────────────────────────────────── */
  /*
    Scroll budget (px):
      0    – 1100   hero copy fades out
      1100 – 1800   wave fills the screen (scaleY grows)
      1700 – 1900   solid overlay fades in
      2100 – 2200   grid container becomes visible
      2200 – 2800   circular clip-path reveal opens
      2800 – 3800   grid dwell (pinned)
  */
  const SCROLL_TOTAL = 3800;

  let heroTimeline = null;

  function buildHeroTimeline() {
    /* Kill previous instance on resize */
    if (heroTimeline) {
      heroTimeline.scrollTrigger && heroTimeline.scrollTrigger.kill();
      heroTimeline.kill();
    }

    const maxRadius  = getMaxClipRadius();
    const fillScale  = getWaveFillScale();

    heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start:   "top top",
        end:     `+=${SCROLL_TOTAL}`,
        scrub:   1,           /* slight smoothing for a buttery feel */
        pin:     true,
        anticipatePin: 1,
        onUpdate(self) {
          /* Disable hero interactivity once wave fully covers screen (≈ 47 % progress) */
          const isCovered = self.progress >= 0.47;
          const pointer   = isCovered ? "none" : "";
          navEl.style.pointerEvents      = pointer;
          titleEl.style.pointerEvents    = pointer;
          ctaEl.style.pointerEvents      = pointer;
          subtitleEl.style.pointerEvents = pointer;
        }
      },
      defaults: { ease: "none" }
    });

    /* Wave SVG inner scale (for visual squash effect) */
    heroTimeline.to(".hero__wave svg", {
      scaleY: 9,
      transformOrigin: "bottom center",
      duration: 700,
    }, 1100);

    /* Wave container scaleY — rises to fill viewport */
    heroTimeline.to(waveEl, {
      scaleY: fillScale,
      transformOrigin: "bottom center",
      duration: 700,
    }, 1100);

    /* Hero copy fades out */
    heroTimeline.to(subtitleEl, { opacity: 0, duration: 100 }, 1800);
    heroTimeline.to(ctaEl,      { opacity: 0, duration: 100 }, 1800);
    heroTimeline.to(titleEl,    { opacity: 0, duration: 100 }, 1800);

    /* Background video fades out as wave rises */
    heroTimeline.to(".hero__video", { opacity: 0, duration: 400 }, 1300);

    /* Solid overlay fades in over nav + hero */
    heroTimeline.to(overlayEl, { opacity: 1, duration: 200 }, 1700);

    /* Grid becomes visible just before clip-path opens */
    heroTimeline.to(gridEl, { opacity: 1, duration: 100 }, 2100);

    /* Circular clip-path reveal */
    heroTimeline.fromTo(gridEl, {
      clipPath: `circle(0px at 50% 50%)`,
    }, {
      clipPath: `circle(${maxRadius}px at 50% 50%)`,
      duration: 600,
    }, 2200);

    /* Grid dwell */
    heroTimeline.to(gridEl, { opacity: 1, duration: 1000 }, 2800);
  }

  buildHeroTimeline();

  /* Rebuild timeline on resize (debounced 200 ms) */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildHeroTimeline, 200);
  });
});

/* ════════════════════════════════════════════════════════════
   MODULE 2 — CAROUSEL
   Infinite-loop carousel with scroll-wheel exit logic.
   ════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const carouselEl = document.querySelector(".carousel");
  const trackEl    = document.querySelector(".carousel__track");
  const prevBtn    = document.querySelector(".carousel__btn--prev");
  const nextBtn    = document.querySelector(".carousel__btn--next");

  if (!trackEl || !prevBtn || !nextBtn) return;

  /* ── Infinite-loop cloning ────────────────────────────────── */
  const originalCards = Array.from(trackEl.querySelectorAll(".carousel__card"));
  const total         = originalCards.length;

  /* Prepend reversed clones before first card */
  originalCards
    .map(c => c.cloneNode(true))
    .reverse()
    .forEach(c => trackEl.insertBefore(c, trackEl.firstChild));

  /* Append clones after last card */
  originalCards
    .map(c => c.cloneNode(true))
    .forEach(c => trackEl.appendChild(c));

  const allCards = Array.from(trackEl.querySelectorAll(".carousel__card"));
  let currentIndex = total;   /* start at first real card */
  let isAnimating  = false;

  /* ── Layout helpers ───────────────────────────────────────── */
  function getScrollOffset() {
    const cardWidth      = allCards[0].offsetWidth;
    const gap            = parseFloat(getComputedStyle(trackEl).gap) || 0;
    const containerWidth = carouselEl.offsetWidth;
    return (currentIndex * (cardWidth + gap)) - (containerWidth / 2) + (cardWidth / 2);
  }

  function updateCarousel(animate = true) {
    trackEl.style.transition = animate
      ? "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
      : "none";
    trackEl.style.transform = `translateX(-${getScrollOffset()}px)`;
  }

  /* Seamless loop: jump index without animation when crossing boundaries */
  trackEl.addEventListener("transitionend", () => {
    if (currentIndex >= total * 2) { currentIndex -= total; updateCarousel(false); }
    if (currentIndex <  total)     { currentIndex += total; updateCarousel(false); }
    isAnimating = false;
  });

  /* ── Core advance ─────────────────────────────────────────── */
  function advance(direction) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += direction;
    updateCarousel(true);
  }

  /* ── Scroll-wheel support with "exit" after N slides ─────── */
  const SCROLL_EXIT_THRESHOLD = 3; /* slides before releasing page scroll */
  let scrollCount = 0;

  carouselEl.addEventListener("wheel", (e) => {
    /* Release page scroll once threshold is reached in that direction */
    if (scrollCount >= SCROLL_EXIT_THRESHOLD && e.deltaY > 0) return;
    if (scrollCount <= -SCROLL_EXIT_THRESHOLD && e.deltaY < 0) return;

    e.preventDefault();

    if (!isAnimating) {
      /* Prefer horizontal delta (trackpad swipe), fall back to vertical */
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 10) return;

      scrollCount += delta > 0 ? 1 : -1;
      advance(delta > 0 ? 1 : -1);
    }
  }, { passive: false });

  /* Reset exit counter when cursor leaves the carousel */
  carouselEl.addEventListener("mouseleave", () => { scrollCount = 0; });

  /* ── Button controls ──────────────────────────────────────── */
  prevBtn.addEventListener("click", () => { scrollCount = 0; advance(-1); });
  nextBtn.addEventListener("click", () => { scrollCount = 0; advance(+1); });

  /* ── Touch / swipe support ────────────────────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;

  carouselEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  carouselEl.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    /* Only fire for clearly horizontal swipes ≥ 40 px */
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      advance(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ── Init ─────────────────────────────────────────────────── */
  updateCarousel(false);
  window.addEventListener("resize", () => updateCarousel(false));
})();