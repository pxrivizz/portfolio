(function () {
  window.Portfolio = window.Portfolio || {};
  const svgNS = "http://www.w3.org/2000/svg";

  function graphic(id, className, viewBox = "0 0 32 32") {
    const svg = document.createElementNS(svgNS, "svg");
    const use = document.createElementNS(svgNS, "use");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", className);
    use.setAttribute("href", `assets/icons/expertise.svg?v=20261001-portrait2#${id}`);
    svg.appendChild(use);
    return svg;
  }

  function tags(items, className) {
    const list = document.createElement("ul");
    list.className = className;
    items.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    return list;
  }

  window.Portfolio.initExpertise = function () {
    const section = document.querySelector("#expertise");
    const content = window.PORTFOLIO_CONTENT?.expertise;
    if (!section || !content) return;
    section.querySelector("[data-expertise-intro]").textContent = content.introduction;
    section.querySelector("[data-expertise-tech]").replaceChildren(...tags(content.technologies, "").children);
    const list = section.querySelector("[data-expertise-list]");
    const floating = matchMedia("(min-width: 951px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let active = null;
    let pinned = false;
    const entries = [];

    const hide = () => {
      if (!active) return;
      active.row.classList.remove("is-active");
      active.button.setAttribute("aria-expanded", "false");
      active.preview.hidden = true;
      active.xTo?.tween.pause();
      active.yTo?.tween.pause();
      active = null;
      pinned = false;
    };
    const position = (entry, x, y, immediate = false) => {
      if (!floating.matches || !window.gsap) return;
      const nextX = Math.max(12, Math.min(innerWidth - entry.width - 12, x + 20));
      const nextY = Math.max(12, Math.min(innerHeight - entry.height - 12, y + 20));
      if (immediate) gsap.set(entry.preview, { x: nextX, y: nextY });
      else { entry.xTo(nextX); entry.yTo(nextY); }
    };
    const show = (entry, event) => {
      if (active !== entry) {
        hide();
        active = entry;
        entry.preview.hidden = false;
        entry.row.classList.add("is-active");
        entry.button.setAttribute("aria-expanded", "true");
        if (floating.matches && window.gsap) {
          const size = entry.preview.getBoundingClientRect();
          entry.width = size.width;
          entry.height = size.height;
          if (!entry.xTo) {
            entry.xTo = gsap.quickTo(entry.preview, "x", { duration: .22, ease: "power3.out" });
            entry.yTo = gsap.quickTo(entry.preview, "y", { duration: .22, ease: "power3.out" });
          }
        }
      }
      if (floating.matches) {
        const rect = entry.button.getBoundingClientRect();
        position(entry, event?.clientX ?? rect.left - 265, event?.clientY ?? rect.top, true);
      }
    };

    content.services.forEach((service, index) => {
      const row = document.createElement("li");
      row.className = "expertise__row";
      const heading = document.createElement("h3");
      const button = document.createElement("button");
      button.className = "expertise__trigger";
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", `expertise-preview-${index}`);
      button.setAttribute("aria-label", `${service.title} preview`);
      const number = document.createElement("span");
      number.className = "expertise__number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");
      const name = document.createElement("span");
      name.className = "expertise__name";
      name.textContent = service.title;
      const arrow = document.createElement("span");
      arrow.className = "expertise__arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      button.append(number, graphic(service.icon, "expertise__icon"), name, arrow);
      heading.appendChild(button);
      const description = document.createElement("p");
      description.className = "expertise__row-description";
      description.textContent = service.description;
      const preview = document.createElement("figure");
      preview.className = "expertise__preview";
      preview.id = `expertise-preview-${index}`;
      preview.hidden = true;
      const caption = document.createElement("figcaption");
      caption.textContent = service.caption;
      preview.append(graphic(`preview-${service.preview}`, "", "0 0 240 150"), caption);
      row.append(heading, description, tags(service.tags, "expertise__tags"), preview);
      list.appendChild(row);
      const entry = { row, button, preview, width: 230, height: 185 };
      entries.push(entry);
      row.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse" && floating.matches) show(entry, event);
      });
      row.addEventListener("pointermove", (event) => {
        if (active === entry && floating.matches && event.pointerType === "mouse") position(entry, event.clientX, event.clientY);
      }, { passive: true });
      row.addEventListener("pointerleave", () => { if (!pinned && active === entry) hide(); });
      button.addEventListener("focus", () => {
        if (button.matches(":focus-visible") && floating.matches) show(entry);
      });
      button.addEventListener("blur", () => { if (active === entry) hide(); });
      button.addEventListener("click", () => {
        if (active === entry && pinned) hide();
        else { show(entry); pinned = true; }
        window.portfolioLenis?.resize();
        window.ScrollTrigger?.refresh();
      });
    });
    section.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
    const setMode = () => {
      hide();
      section.classList.toggle("expertise--floating", floating.matches && Boolean(window.gsap));
      entries.forEach(({ preview }) => { preview.style.transform = ""; });
    };
    setMode();
    floating.addEventListener("change", setMode);
    window.addEventListener("resize", hide, { passive: true });
    window.addEventListener("scroll", () => { if (floating.matches) hide(); }, { passive: true });

    // Six small SVG layers, 30 fps maximum. No SVG filters or layout writes
    // in the render loop; one ticker subscription only while visible.
    const field = section.querySelector(".expertise__field");
    const toggle = section.querySelector(".expertise__motion-toggle");
    const motion = matchMedia("(min-width: 951px) and (prefers-reduced-motion: no-preference)");
    let isVisible = false;
    let paused = false;
    let running = false;
    let lastTime = 0;
    let elapsed = 0;
    let bounds;
    let boundsDirty = true;
    let pointer = null;
    const logoNodes = Array.from(field.querySelectorAll(".expertise__logo"));
    const logos = logoNodes.map((element, index) => ({ element, phase: index * 1.7, baseX: 0, baseY: 0, x: 0, y: 0 }));
    const measure = () => {
      bounds = field.getBoundingClientRect();
      logos.forEach((logo) => {
        logo.baseX = logo.element.offsetLeft + logo.element.offsetWidth / 2;
        logo.baseY = logo.element.offsetTop + logo.element.offsetHeight / 2;
      });
      boundsDirty = false;
    };
    const tick = (time) => {
      if (time - lastTime < 1 / 30) return;
      const dt = Math.min(time - lastTime, .065);
      lastTime = time;
      elapsed += dt;
      if (boundsDirty) measure();
      const blend = 1 - Math.exp(-dt * 6);
      logos.forEach((logo) => {
        const driftX = Math.sin(elapsed * .5 + logo.phase) * 9;
        const driftY = Math.cos(elapsed * .4 + logo.phase) * 11;
        let pushX = 0;
        let pushY = 0;
        if (pointer) {
          const dx = logo.baseX + driftX - (pointer.x - bounds.left);
          const dy = logo.baseY + driftY - (pointer.y - bounds.top);
          const distance = Math.max(1, Math.hypot(dx, dy));
          const force = Math.max(0, 1 - distance / 110) * 30;
          pushX = dx / distance * force;
          pushY = dy / distance * force;
        }
        logo.x += (driftX + pushX - logo.x) * blend;
        logo.y += (driftY + pushY - logo.y) * blend;
        logo.element.style.transform = `translate3d(${logo.x.toFixed(2)}px, ${logo.y.toFixed(2)}px, 0) rotate(${(Math.sin(elapsed * .3 + logo.phase) * 8).toFixed(2)}deg)`;
      });
    };
    const updateMotion = () => {
      const allowed = motion.matches && Boolean(window.gsap);
      toggle.hidden = !allowed;
      const shouldRun = allowed && isVisible && !paused && !document.hidden;
      if (shouldRun && !running) { lastTime = gsap.ticker.time; gsap.ticker.add(tick); }
      if (!shouldRun && running) gsap.ticker.remove(tick);
      running = shouldRun;
      field.dataset.motionState = running ? "running" : !allowed ? "static" : paused ? "paused" : "offscreen";
      if (!allowed) logoNodes.forEach((element) => { element.style.transform = ""; });
    };
    new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; updateMotion(); }, { threshold: .05 }).observe(field);
    new ResizeObserver(() => { boundsDirty = true; }).observe(field);
    field.addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse") pointer = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    field.addEventListener("pointerleave", () => { pointer = null; });
    window.addEventListener("scroll", () => { boundsDirty = true; pointer = null; }, { passive: true });
    document.addEventListener("visibilitychange", updateMotion);
    motion.addEventListener("change", updateMotion);
    toggle.addEventListener("click", () => {
      paused = !paused;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "Resume motion" : "Pause motion";
      updateMotion();
    });
    updateMotion();
  };
})();
