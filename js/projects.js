(function () {
  window.Portfolio = window.Portfolio || {};
  window.Portfolio.initProjects = function () {
    const section = document.querySelector("#projects");
    const stage = section?.querySelector("[data-projects-stage]");
    const projects = window.PORTFOLIO_CONTENT?.projects || [];
    if (!stage || !projects.length) return;
    const ui = window.Portfolio.detailUI;
    const svgNS = "http://www.w3.org/2000/svg";
    const safeUrl = (value) => {
      try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; }
      catch { return null; }
    };
    const cards = projects.map((project, index) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.theme = ["cream", "ink", "gold", "stone"].includes(project.theme) ? project.theme : "cream";
      card.setAttribute("aria-labelledby", `project-title-${index}`);
      const preview = document.createElement("img");
      preview.className = "project-card__preview";
      preview.src = project.image;
      preview.alt = "";
      preview.loading = "lazy";
      preview.decoding = "async";
      preview.addEventListener("error", () => { preview.hidden = true; }, { once: true });
      const shade = document.createElement("span");
      shade.className = "project-card__shade";
      shade.setAttribute("aria-hidden", "true");
      const inner = document.createElement("div");
      inner.className = "project-card__inner";
      const meta = document.createElement("p");
      meta.className = "project-card__meta";
      meta.textContent = `SELECTED WORK / ${String(index + 1).padStart(2, "0")}`;
      const body = document.createElement("div");
      body.className = "project-card__body";
      const title = document.createElement("h2");
      title.id = `project-title-${index}`;
      const displayTitle = ui.projectTitle(project, index);
      title.appendChild(ui.link(displayTitle, ui.projectHref(project)));
      const description = document.createElement("p");
      description.className = "project-card__description";
      description.textContent = ui.hasText(project.description) ? project.description : "Project story coming soon. Details will be added when the work is ready to share.";
      const tags = document.createElement("ul");
      tags.className = "project-card__tags";
      project.technologies.filter(ui.hasText).forEach((text) => {
        const li = document.createElement("li"); li.textContent = text; tags.appendChild(li);
      });
      body.append(title, description, tags);
      const bottom = document.createElement("div");
      bottom.className = "project-card__bottom";
      const number = document.createElement("span");
      number.className = "project-card__number";
      number.textContent = String(index + 1).padStart(2, "0");
      number.setAttribute("aria-hidden", "true");
      const action = document.createElement("div");
      action.className = "project-card__action";
      const demoUrl = safeUrl(project.url);
      const sourceUrl = safeUrl(project.repository);
      const url = demoUrl || sourceUrl;
      const link = document.createElement(url ? "a" : "button");
      link.className = "project-card__demo";
      link.setAttribute("aria-label", demoUrl ? `Open ${displayTitle} live demo` : sourceUrl ? `View ${displayTitle} source on GitHub` : "Live demo unavailable");
      if (url) { link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer"; }
      else { link.type = "button"; link.disabled = true; }
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 120 120"); svg.setAttribute("aria-hidden", "true");
      const defs = document.createElementNS(svgNS, "defs");
      const path = document.createElementNS(svgNS, "path");
      path.id = `project-orbit-${index}`;
      path.setAttribute("d", "M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0");
      defs.appendChild(path);
      const text = document.createElementNS(svgNS, "text");
      const textPath = document.createElementNS(svgNS, "textPath");
      textPath.setAttribute("href", `#${path.id}`);
      textPath.setAttribute("textLength", "275");
      textPath.textContent = sourceUrl && !demoUrl ? "VIEW SOURCE • EXPLORE CODE • " : "LIVE DEMO • VIEW PROJECT • ";
      text.appendChild(textPath); svg.append(defs, text);
      const arrow = document.createElement("span"); arrow.textContent = "↗"; arrow.setAttribute("aria-hidden", "true");
      link.append(svg, arrow);
      const note = document.createElement("small");
      note.textContent = demoUrl ? "View live project" : sourceUrl ? "View source on GitHub" : "Demo unavailable";
      action.append(link, note); bottom.append(number, action);
      const details = ui.link("Explore project →", ui.projectHref(project), false, "project-card__details");
      details.setAttribute("aria-label", `Explore ${displayTitle}`);
      body.appendChild(details);
      inner.append(meta, body, bottom); card.append(preview, inner, shade); stage.appendChild(card);
      return card;
    });
    const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => target.classList.toggle("is-visible", isIntersecting)), { threshold: .1 });
    cards.forEach((card) => observer.observe(card));
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const controls = document.createElement("nav");
    controls.className = "projects__controls";
    controls.setAttribute("aria-label", "Project navigation");
    controls.hidden = true;
    const previous = document.createElement("button");
    const next = document.createElement("button");
    previous.type = next.type = "button";
    previous.textContent = "←"; next.textContent = "→";
    previous.setAttribute("aria-label", "Previous project"); next.setAttribute("aria-label", "Next project");
    const count = document.createElement("span");
    count.setAttribute("role", "status"); count.setAttribute("aria-live", "polite");
    controls.append(previous, count, next); stage.appendChild(controls);
    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("is-stacked");
      controls.hidden = false;
      let active = -1;
      const setActive = (index) => {
        if (active === index) return;
        active = index;
        cards.forEach((card, i) => {
          card.inert = i !== index;
          card.setAttribute("aria-hidden", String(i !== index));
        });
        previous.disabled = index === 0; next.disabled = index === cards.length - 1;
        count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      };
      setActive(0);
      cards.forEach((card, index) => {
        gsap.set(card, { yPercent: index ? 100 : 0, zIndex: index + 1, transformOrigin: "50% 0%" });
      });
      const duration = cards.length - 1 + .35;
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, pin: stage, start: "top top",
          end: () => `+=${Math.round(innerHeight * duration)}`,
          scrub: .35, invalidateOnRefresh: true,
        },
        onUpdate: function () { setActive(Math.min(cards.length - 1, Math.floor(this.time() + .45))); },
      });
      cards.slice(1).forEach((card, index) => {
        timeline.to(card, { yPercent: 0, duration: 1 }, index)
          .to(cards[index], { scale: .94, duration: 1 }, index)
          .to(cards[index].querySelector(".project-card__shade"), { opacity: .5, duration: 1 }, index);
      });
      timeline.to({}, { duration: .35 });
      const go = (index) => {
        const target = Math.max(0, Math.min(cards.length - 1, index));
        const trigger = timeline.scrollTrigger;
        const top = trigger.start + (trigger.end - trigger.start) * (target / duration);
        if (window.portfolioLenis) window.portfolioLenis.scrollTo(top);
        else window.scrollTo({ top, behavior: "smooth" });
      };
      const goPrevious = () => go(active - 1);
      const goNext = () => go(active + 1);
      previous.addEventListener("click", goPrevious); next.addEventListener("click", goNext);
      return () => {
        previous.removeEventListener("click", goPrevious); next.removeEventListener("click", goNext);
        controls.hidden = true;
        section.classList.remove("is-stacked");
        cards.forEach((card) => { card.inert = false; card.removeAttribute("aria-hidden"); });
      };
    });
  };
})();
