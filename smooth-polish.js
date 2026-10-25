/**
 * MADHAV MARKETING - NON-DESTRUCTIVE UI POLISH ENGINE (smooth-polish.js)
 * Drop-in script: Inertia scrolling, page transitions, scroll reveals & 3D hover tilt
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    initScrollProgressBar();
    initPageTransitions();
    initScrollReveal();
    initCutout3DTilt();
    if (!prefersReducedMotion) {
      loadLenisSmoothScroll();
    }
  });

  // Restore page visibility if user navigates back via browser Back/Forward cache
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      document.body.classList.remove("mm-page-exiting");
    }
  });

  /* --------------------------------------------------------------------------
   * 1. INERTIA SMOOTH SCROLLING (Auto-loads Lenis via CDN)
   * -------------------------------------------------------------------------- */
  function loadLenisSmoothScroll() {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/lenis@1.1.20/dist/lenis.min.js";
    script.async = true;
    script.onload = () => {
      if (typeof Lenis === "undefined") return;

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Smooth anchor scrolling (#benefits, #ingredients, #products, etc.)
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const targetId = this.getAttribute("href");
          if (targetId && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenis.scrollTo(targetEl, { offset: -80 });
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

        // Ignore anchor links, external links, new tabs, mailto, tel, whatsapp, or downloads
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

          // If browser doesn't support native View Transitions API, use CSS exit fade
          if (!document.startViewTransition && !prefersReducedMotion) {
            e.preventDefault();
            document.body.classList.add("mm-page-exiting");
            setTimeout(() => {
              window.location.href = targetUrl.href;
            }, 280);
          }
        } catch (err) {
          // Proceed with default navigation if URL parsing fails
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 3. AUTO-DETECT SCROLL REVEAL WITH STAGGERING
   * -------------------------------------------------------------------------- */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const selectors = [
      "section > *",
      "article",
      ".card",
      "[class*='card']",
      "[class*='product']",
      "[class*='benefit']",
      "[class*='ingredient']",
      "img[src*='cutouts']",
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
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => {
      // Skip fixed/sticky headers or navbars
      if (el.closest("nav, header") || getComputedStyle(el).position === "fixed") return;

      el.classList.add("mm-reveal");

      // Calculate sibling stagger delay for grid items (cards, products, benefits)
      const parent = el.parentElement;
      if (parent && parent.children.length > 1) {
        const index = Array.from(parent.children).indexOf(el);
        const staggerMs = (index % 4) * 85;
        el.style.setProperty("--mm-stagger", `${staggerMs}ms`);
      }

      observer.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
   * 4. SUBTLE 3D HOVER TILT ON PRODUCT CUTOUTS
   * -------------------------------------------------------------------------- */
  function initCutout3DTilt() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    const cutouts = document.querySelectorAll('img[src*="cutouts"], .product-cutout');
    cutouts.forEach((img) => {
      img.addEventListener("mousemove", (e) => {
        const rect = img.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.transform = `perspective(600px) translateY(-6px) scale(1.04) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
      });

      img.addEventListener("mouseleave", () => {
        img.style.transform = "";
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 5. TOP SCROLL PROGRESS INDICATOR
   * -------------------------------------------------------------------------- */
  function initScrollProgressBar() {
    const bar = document.createElement("div");
    bar.className = "mm-scroll-progress";
    document.body.appendChild(bar);

    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      },
      { passive: true }
    );
  }
})();
