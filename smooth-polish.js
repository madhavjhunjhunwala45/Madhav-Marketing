/**
 * MADHAV MARKETING - CALM EDITORIAL POLISH ENGINE (smooth-polish.js)
 * Smooth inertia scroll, delayed scroll-reveals, and seamless page transitions.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    initPageTransitions();
    initScrollReveal();
    if (!prefersReducedMotion) {
      loadLenisSmoothScroll();
    }
  });

  // Restore visibility if navigating back via browser Back/Forward cache
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      document.body.classList.remove("mm-page-exiting");
    }
  });

  /* --------------------------------------------------------------------------
   * 1. INERTIA SMOOTH SCROLLING (Lenis)
   * -------------------------------------------------------------------------- */
  function loadLenisSmoothScroll() {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/lenis@1.1.20/dist/lenis.min.js";
    script.async = true;
    script.onload = () => {
      if (typeof Lenis === "undefined") return;

      const lenis = new Lenis({
        duration: 1.25, // Slightly slower, more luxurious scroll settle
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Smooth anchor scrolling (#range, #ingredients, #story, etc.)
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const targetId = this.getAttribute("href");
          if (targetId && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenis.scrollTo(targetEl, { offset: -70, duration: 1.35 });
            }
          }
        });
      });
    };
    document.head.appendChild(script);
  }

  /* --------------------------------------------------------------------------
   * 2. SMOOTH MULTI-PAGE NAVIGATION TRANSITIONS
   * -------------------------------------------------------------------------- */
  function initPageTransitions() {
    document.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href) return;

        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:") ||
          link.target === "_blank" ||
          link.hasAttribute("download") ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        try {
          const targetUrl = new URL(link.href, window.location.origin);
          if (targetUrl.origin !== window.location.origin) return;
          if (
            targetUrl.pathname === window.location.pathname &&
            targetUrl.search === window.location.search &&
            targetUrl.hash
          ) {
            return;
          }

          if (!document.startViewTransition && !prefersReducedMotion) {
            e.preventDefault();
            document.body.classList.add("mm-page-exiting");
            setTimeout(() => {
              window.location.href = targetUrl.href;
            }, 320);
          }
        } catch (err) {
          // Proceed with default navigation
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 3. SUBTLE DELAYED SCROLL REVEALS
   * -------------------------------------------------------------------------- */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    // Only animate major structural blocks, not individual cart rows or floating widgets
    const selectors = [
      "main > section",
      "section > div",
      "article",
    ];

    const elements = document.querySelectorAll(selectors.join(", "));
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
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    elements.forEach((el) => {
      // Never animate fixed floating pills ("Your cart", "Customer care") or headers
      const style = getComputedStyle(el);
      if (
        el.closest("nav, header, footer") ||
        style.position === "fixed" ||
        style.position === "sticky"
      ) {
        return;
      }

      el.classList.add("mm-reveal");

      // Gentle 90ms cascade across 4-column product grids
      const parent = el.parentElement;
      if (parent && parent.children.length > 1) {
        const index = Array.from(parent.children).indexOf(el);
        const staggerMs = (index % 4) * 90;
        el.style.setProperty("--mm-stagger", `${staggerMs}ms`);
      }

      observer.observe(el);
    });
  }
})();
