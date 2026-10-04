(function () {
  window.Portfolio = window.Portfolio || {};

  window.Portfolio.initPortraitTilt = function (card) {
    const layer = card.querySelector(".portrait-card__tilt");
    if (!layer) return () => {};
    const motion = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let bounds = null;
    let frame = 0;
    let pointer = null;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      bounds = null;
      layer.style.transform = "";
    };
    const render = () => {
      frame = 0;
      if (!pointer || !motion.matches || !card.classList.contains("is-open")) return;
      // Measure the stationary hit area, never the animated photo.
      if (!bounds) bounds = card.getBoundingClientRect();
      const clamp = (value) => Math.max(-1, Math.min(1, value));
      const x = clamp((pointer.x - bounds.left) / Math.max(1, bounds.width) * 2 - 1);
      const y = clamp((pointer.y - bounds.top) / Math.max(1, bounds.height) * 2 - 1);
      layer.style.transform = `rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    };
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || !motion.matches || !card.classList.contains("is-open")) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true });
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("resize", reset, { passive: true });
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    return reset;
  };

  window.Portfolio.initAbout = function () {
    const section = document.querySelector("#about");
    const content = window.PORTFOLIO_CONTENT;
    if (!section || !content?.about) return;
    window.Portfolio.renderExperience?.(section.querySelector("[data-about-experience]"), "h4", true);
    const headline = section.querySelector("[data-about-headline]");
    const paragraphs = section.querySelector("[data-about-paragraphs]");
    const facts = section.querySelector("[data-about-facts]");
    const card = section.querySelector(".portrait-card");
    const textBlocks = [{ element: headline, segments: content.about.headline }];

    content.about.paragraphs.forEach((text) => {
      const element = document.createElement("p");
      paragraphs.appendChild(element);
      textBlocks.push({ element, segments: [{ text }] });
    });
    content.about.facts.forEach(({ label, value }) => {
      const cell = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      cell.className = "about__fact";
      term.textContent = label;
      description.textContent = value;
      cell.append(term, description);
      facts.appendChild(cell);
    });
    section.querySelectorAll("[data-portrait]").forEach((image) => {
      image.src = content.portrait;
      image.alt = content.portraitAlt;
      image.decoding = "async";
    });
    section.querySelector("[data-portrait-label]").textContent = content.portraitAlt;
    card.setAttribute("aria-label", `Reveal ${content.name}'s name`);
    const resetTilt = window.Portfolio.initPortraitTilt(card);
    const setOpen = (open) => {
      if (!open) resetTilt();
      card.classList.toggle("is-open", open);
      card.setAttribute("aria-expanded", String(open));
    };
    let pinnedOpen = false;
    const hover = matchMedia("(hover: hover) and (pointer: fine)");
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && hover.matches) setOpen(true);
    });
    card.addEventListener("pointerleave", () => setOpen(pinnedOpen));
    card.addEventListener("click", () => { pinnedOpen = !pinnedOpen; setOpen(pinnedOpen); });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { pinnedOpen = false; setOpen(false); }
    });
    card.addEventListener("blur", () => { pinnedOpen = false; setOpen(false); });
    hover.addEventListener("change", () => { pinnedOpen = false; setOpen(false); });

    // Build from content.js only; never insert user copy as HTML.
    const makeWords = ({ element, segments }) => {
      element.replaceChildren();
      const words = [];
      const visual = document.createElement("span");
      visual.setAttribute("aria-hidden", "true");
      element.setAttribute("aria-label", segments.map(({ text }) => text).join(" "));
      segments.forEach(({ text, accent }) => {
        text.split(/\s+/).filter(Boolean).forEach((word) => {
          const span = document.createElement("span");
          span.className = `about__word${accent ? " about__accent" : ""}`;
          span.textContent = word;
          if (words.length) visual.append(" ");
          visual.appendChild(span);
          words.push(span);
        });
      });
      element.appendChild(visual);
      return { visual, words };
    };
    textBlocks.forEach(makeWords);

    window.Portfolio.animateAbout = function () {
      if (!window.gsap || !window.ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);
      let animations;
      const media = gsap.matchMedia();
      const build = () => {
        animations?.revert();
        // Read every word position before writing line wrappers.
        const blocks = textBlocks.map(makeWords).map(({ visual, words }) => ({
          visual,
          rows: words.reduce((rows, word) => {
            const top = word.offsetTop;
            if (!rows.length || Math.abs(rows[rows.length - 1].top - top) > 2) {
              rows.push({ top, words: [] });
            }
            rows[rows.length - 1].words.push(word);
            return rows;
          }, []),
        }));
        blocks.forEach(({ visual, rows }) => {
          visual.replaceChildren();
          rows.forEach(({ words }) => {
            const line = document.createElement("span");
            const inner = document.createElement("span");
            line.className = "about__line";
            inner.className = "about__line-inner";
            words.forEach((word, index) => {
              if (index) inner.append(" ");
              inner.appendChild(word);
            });
            line.appendChild(inner);
            visual.appendChild(line);
          });
        });
        animations = gsap.context(() => {
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          section.querySelectorAll(".about__line-inner").forEach((line) => {
            // Already-passed copy stays visible when a resize reflows lines.
            if (line.getBoundingClientRect().top < 0) return;
            gsap.from(line, {
              yPercent: 105, opacity: 0, duration: .75, ease: "power3.out",
              scrollTrigger: { trigger: line.parentElement, start: "top 94%", once: true },
            });
          });
          [section.querySelector(".about__header"), section.querySelector(".about__portrait"), facts].forEach((element) => {
            if (element.getBoundingClientRect().top < 0) return;
            gsap.from(element, {
              y: 24, opacity: 0, duration: .8, ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 94%", once: true },
            });
          });
        }, section);
        window.portfolioLenis?.resize();
        ScrollTrigger.refresh();
      };
      // Rebuild for font metrics and actual container width, not height changes
      // caused by the mobile browser's address bar.
      let width = section.clientWidth;
      let timer;
      new ResizeObserver(() => {
        if (width === section.clientWidth) return;
        width = section.clientWidth;
        clearTimeout(timer);
        timer = setTimeout(build, 180);
      }).observe(section);
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", build);
      document.fonts.ready.then(build);

      media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const zone = section.querySelector(".about__string");
        const path = zone.querySelector("path");
        const point = { x: 500, y: 50 };
        let bounds;
        let frame = 0;
        let target;
        let returnTween;
        const draw = () => path.setAttribute("d", `M 0 50 Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} 1000 50`);
        const moveX = gsap.quickTo(point, "x", { duration: .18, onUpdate: draw });
        const moveY = gsap.quickTo(point, "y", { duration: .18, onUpdate: draw });
        const enter = () => { bounds = zone.getBoundingClientRect(); };
        const move = (event) => {
          if (!bounds) enter();
          target = {
            x: Math.max(40, Math.min(960, (event.clientX - bounds.left) / bounds.width * 1000)),
            y: Math.max(-28, Math.min(128, 50 + ((event.clientY - bounds.top) / bounds.height - .5) * 160)),
          };
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            returnTween?.kill();
            moveX(target.x);
            moveY(target.y);
          });
        };
        const leave = () => {
          cancelAnimationFrame(frame); frame = 0;
          moveX.tween.pause(); moveY.tween.pause();
          returnTween?.kill();
          returnTween = gsap.to(point, { x: 500, y: 50, duration: 1.05, ease: "elastic.out(1, 0.32)", onUpdate: draw });
        };
        zone.addEventListener("pointerenter", enter);
        zone.addEventListener("pointermove", move, { passive: true });
        zone.addEventListener("pointerleave", leave);
        return () => {
          cancelAnimationFrame(frame);
          gsap.killTweensOf(point);
          zone.removeEventListener("pointerenter", enter);
          zone.removeEventListener("pointermove", move);
          zone.removeEventListener("pointerleave", leave);
          path.setAttribute("d", "M 0 50 Q 500 50 1000 50");
        };
      });
    };
  };
})();
