(function () {
  window.Portfolio = window.Portfolio || {};

  window.Portfolio.initWork = function () {
    const section = document.querySelector("#work");
    const content = window.PORTFOLIO_CONTENT?.workTransition;
    if (!section || !content) return;
    const stage = section.querySelector(".work__stage");
    const toggle = section.querySelector(".work__motion-toggle");
    const bands = Array.from(section.querySelectorAll("[data-work-band]"), (element, index) => ({
      element,
      track: element.querySelector(".work__track"),
      items: content[element.dataset.workBand],
      width: 0,
      offset: 0,
      speed: index ? 38 : -18,
    }));
    const populate = () => {
      bands.forEach((band) => {
        band.element.setAttribute("aria-label", band.items.join(" · "));
        const group = document.createElement("div");
        group.className = "work__group";
        const appendItems = () => band.items.forEach((text) => {
          const item = document.createElement("span");
          item.className = "work__item";
          item.textContent = text;
          group.appendChild(item);
        });
        appendItems();
        band.track.replaceChildren(group);
        // Make one repeat at least as wide as the viewport before duplicating
        // it. This keeps a continuous seam at every supported screen width.
        const minimum = stage.clientWidth;
        const initialWidth = group.getBoundingClientRect().width;
        if (initialWidth > 0) {
          const repeats = Math.ceil(minimum / initialWidth);
          for (let i = 1; i < repeats; i += 1) appendItems();
        }
        band.width = group.getBoundingClientRect().width;
        band.track.appendChild(group.cloneNode(true));
        band.offset = 0;
        band.track.style.transform = "translate3d(0, 0, 0)";
      });
    };
    populate();
    if (!window.gsap || !window.ScrollTrigger) {
      section.classList.add("is-static");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      section.classList.remove("is-static");
      toggle.hidden = false;
      let paused = false;
      let visible = false;
      let running = false;
      let lastTime = 0;
      let boost = 0;
      const drops = section.querySelectorAll(".work__drop");
      const order = [0, .22, .1, .38, .28, .48];
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: .25,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            section.dataset.scrollProgress = self.progress.toFixed(3);
          },
        },
      });
      drops.forEach((drop, index) => {
        timeline
          .fromTo(drop, { opacity: 0, attr: { cy: 288 } }, { opacity: 1, duration: .06 }, order[index])
          .to(drop, { attr: { cy: 318, ry: 23 }, duration: .2 }, order[index])
          .to(drop, { attr: { cy: 447, ry: 13 }, duration: .56, ease: "power2.in" }, order[index] + .2)
          .to(drop, { opacity: 0, duration: .12 }, order[index] + .64);
      });

      const ticker = (time) => {
        if (time - lastTime < 1 / 30) return;
        const dt = Math.min(time - lastTime, .065);
        lastTime = time;
        // Speed is capped and eases back after a wheel/touch burst.
        const velocity = Math.min(Math.abs(velocityTrigger.getVelocity()) / 1400, 2.5);
        boost += (velocity - boost) * (1 - Math.exp(-dt * 5));
        bands.forEach((band) => {
          if (!band.width) return;
          band.offset = (band.offset + band.speed * (1 + boost) * dt) % band.width;
          const x = -((band.offset + band.width) % band.width);
          band.track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        });
        stage.dataset.marqueeSpeed = (1 + boost).toFixed(2);
      };
      const velocityTrigger = ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top" });
      const update = () => {
        const shouldRun = visible && !paused && !document.hidden;
        if (shouldRun && !running) { lastTime = gsap.ticker.time; gsap.ticker.add(ticker); }
        if (!shouldRun && running) gsap.ticker.remove(ticker);
        running = shouldRun;
        stage.dataset.motionState = running ? "running" : paused ? "paused" : "offscreen";
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      }, { threshold: .01 });
      observer.observe(section);
      const pause = () => {
        paused = !paused;
        toggle.setAttribute("aria-pressed", String(paused));
        toggle.textContent = paused ? "Resume motion" : "Pause motion";
        section.classList.toggle("is-paused", paused);
        update();
      };
      toggle.addEventListener("click", pause);
      document.addEventListener("visibilitychange", update);
      return () => {
        observer.disconnect();
        gsap.ticker.remove(ticker);
        toggle.removeEventListener("click", pause);
        document.removeEventListener("visibilitychange", update);
        section.classList.remove("is-paused");
        toggle.hidden = true;
        toggle.setAttribute("aria-pressed", "false");
        toggle.textContent = "Pause motion";
        stage.dataset.motionState = "static";
        bands.forEach((band) => { band.track.style.transform = ""; });
      };
    });
    let width = stage.clientWidth;
    let timer;
    new ResizeObserver(() => {
      if (width === stage.clientWidth) return;
      width = stage.clientWidth;
      clearTimeout(timer);
      timer = setTimeout(() => { populate(); ScrollTrigger.refresh(); }, 180);
    }).observe(stage);
    document.fonts.ready.then(() => { populate(); ScrollTrigger.refresh(); window.portfolioLenis?.resize(); });
  };
})();
