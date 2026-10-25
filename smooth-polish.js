/**
 * MADHAV MARKETING - ULTRA-LIGHT 60FPS POLISH (smooth-polish.js)
 * Zero scroll-hijacking, automatic pill-button detection, and clean reveals.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    protectPillButtonsFromUnderline();
    initSmoothAnchorScroll();
    initLightScrollReveal();
  });

  /* --------------------------------------------------------------------------
   * 1. AUTO-DETECT PILL BUTTONS ("Talk to us") & REMOVE UNDERLINES
   * -------------------------------------------------------------------------- */
  function protectPillButtonsFromUnderline() {
    document.querySelectorAll("header a, nav a").forEach((link) => {
      const style = window.getComputedStyle(link);
      const hasBackground =
        style.backgroundColor &&
        style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        style.backgroundColor !== "transparent";
      const hasBorder = parseFloat(style.borderTopWidth) > 0;
      const isRounded = parseFloat(style.borderTopLeftRadius) > 8;

      // If the nav link is styled like a pill or button, never underline it
      if (hasBackground || hasBorder || isRounded) {
        link.classList.add("mm-no-underline");
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 2. NATIVE SMOOTH ANCHOR SCROLLING (With Sticky Header Offset)
   * -------------------------------------------------------------------------- */
  function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 3. NON-OVERLAPPING, GPU-FRIENDLY SCROLL REVEAL
   * -------------------------------------------------------------------------- */
  function initLightScrollReveal() {
    if (prefersReducedMotion) return;

    // Only target individual product cards and top-level sections that aren't already in view
    const candidates = document.querySelectorAll("article, main > section");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mm-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    candidates.forEach((el) => {
      // Never hide elements already visible above the fold on initial page load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        return;
      }

      // Prevent nested animations (if an article is inside a section, don't animate both)
      if (el.tagName === "SECTION" && el.querySelector("article")) {
        return;
      }

      el.classList.add("mm-reveal");

      if (el.tagName === "ARTICLE" && el.parentElement) {
        const siblings = Array.from(el.parentElement.children);
        const index = siblings.indexOf(el);
        el.style.setProperty("--mm-stagger", `${(index % 4) * 50}ms`);
      }

      observer.observe(el);
    });
  }
})();
