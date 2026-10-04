(function () {
  let smoothTick;
  const applyContent = () => {
    const content = window.PORTFOLIO_CONTENT || {};
    document.title = `${content.name} — ${content.role}`;
    document.querySelector('meta[name="description"]').content = `${content.name} — ${content.role}. C#, Flutter, React and AI architectures.`;
    document.querySelectorAll("[data-content]").forEach((element) => {
      const key = element.dataset.content;
      if (Object.hasOwn(content, key)) element.textContent = content[key];
    });
  };

  const initSmoothScroll = () => {
    if (smoothTick && window.gsap) gsap.ticker.remove(smoothTick);
    window.portfolioLenis?.destroy();
    window.portfolioLenis = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", ScrollTrigger.update);
    smoothTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(smoothTick);
    gsap.ticker.lagSmoothing(0);
    window.portfolioLenis = lenis;
  };

  const revealHero = (reducedMotion = false) => {
    document.querySelector("main").inert = false;
    window.Portfolio?.animateAbout?.();
    window.portfolioLenis?.resize();
    window.ScrollTrigger?.refresh();
    if (!window.gsap) {
      document.querySelectorAll(".hero-reveal, .hero__word").forEach((element) => {
        element.style.visibility = "visible";
      });
      return;
    }

    if (reducedMotion) {
      gsap.set(".hero-reveal, .hero__word", { autoAlpha: 1 });
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    timeline
      .fromTo(
        ".hero__word",
        { autoAlpha: 0, yPercent: 110, rotate: 1.2 },
        { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.11 },
      )
      .fromTo(
        ".hero-reveal",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.055 },
        "-=0.58",
      );
  };

  const refreshScroll = (() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        window.portfolioLenis?.resize();
        window.ScrollTrigger?.refresh();
      }, 180);
    };
  })();

  window.addEventListener("DOMContentLoaded", () => {
    applyContent();
    document.querySelector("main").inert = true;
    window.Portfolio?.initAbout?.();
    window.Portfolio?.initExpertise?.();
    window.Portfolio?.initWork?.();
    window.Portfolio?.initProjects?.();
    window.Portfolio?.initContact?.();
    initSmoothScroll();
    window.Portfolio?.initLiquidType?.();
    window.Portfolio?.initLoader?.(revealHero);

    const menu = document.querySelector("#site-menu");
    const menuToggle = document.querySelector(".menu-toggle");
    const journal = document.querySelector("#journal");
    journal.querySelector("h2").textContent = window.PORTFOLIO_CONTENT.journal.heading;
    journal.querySelector("[data-journal-message]").textContent = window.PORTFOLIO_CONTENT.journal.message;
    const syncDialog = () => {
      const open = menu.open || journal.open;
      document.body.classList.toggle("has-open-dialog", open);
      menuToggle.setAttribute("aria-expanded", String(menu.open));
      menuToggle.setAttribute("aria-label", menu.open ? "Close menu" : "Open menu");
      if (open) window.portfolioLenis?.stop();
      else window.portfolioLenis?.start();
    };
    menuToggle.addEventListener("click", () => { menu.showModal(); syncDialog(); });
    document.querySelector("[data-close-menu]").addEventListener("click", () => menu.close());
    document.querySelector("[data-close-journal]").addEventListener("click", () => journal.close());
    [menu, journal].forEach((dialog) => {
      dialog.addEventListener("close", syncDialog);
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      });
    });
    const navigate = (href, focus = true) => {
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      if (menu.open) menu.close();
      if (target === journal) { journal.showModal(); syncDialog(); return; }
      syncDialog();
      if (focus) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
      if (window.portfolioLenis) window.portfolioLenis.scrollTo(target);
      else target.scrollIntoView({ behavior: "auto" });
    };
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute("href");
      if (!document.getElementById(href.slice(1))) return;
      event.preventDefault();
      navigate(href);
      if (href !== "#journal") history.pushState(null, "", href);
    });
    window.addEventListener("popstate", () => navigate(location.hash || "#hero", false));
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => {
      initSmoothScroll(); syncDialog(); refreshScroll();
    });

    window.addEventListener("resize", refreshScroll, { passive: true });
    document.fonts?.ready.then(refreshScroll);
  });
})();
