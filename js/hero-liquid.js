(function () {
  window.Portfolio = window.Portfolio || {};

  window.Portfolio.initLiquidType = function () {
    const words = Array.from(document.querySelectorAll('[data-hero-word]'));
    if (!words.length || !window.gsap) return;
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = words.map((word) => {
      const text = word.textContent;
      word.setAttribute("aria-label", text);
      const letters = Array.from(text, (letter) => {
        const span = document.createElement("span");
        span.className = "hero__letter";
        span.textContent = letter;
        span.setAttribute("aria-hidden", "true");
        return span;
      });
      word.replaceChildren(...letters);
      const setters = letters.map((letter) => ({
        y: gsap.quickTo(letter, "y", { duration: 0.35, ease: "power3.out" }),
        rotate: gsap.quickTo(letter, "rotation", { duration: 0.4, ease: "power3.out" }),
      }));
      let bounds;
      let previous;
      let frame = 0;
      let restTimer;
      let sample;
      const settle = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        clearTimeout(restTimer);
        setters.forEach(({ y, rotate }) => { y(0); rotate(0); });
      };
      const enter = (event) => {
        // Measure once on entry, not on every pointer event.
        bounds = word.getBoundingClientRect();
        previous = { x: event.clientX, time: performance.now() };
      };
      const render = () => {
        frame = 0;
        if (!sample || !bounds) return;
        const now = performance.now();
        const speed = Math.min(1, Math.abs(sample.x - previous.x) / Math.max(16, now - previous.time) / 1.5);
        const position = (sample.x - bounds.left) / bounds.width;
        const amplitude = Math.min(12, bounds.height * 0.07) * (0.35 + speed * 0.65);
        setters.forEach(({ y, rotate }, index) => {
          const distance = (index + 0.5) / letters.length - position;
          const influence = Math.exp(-distance * distance * 22);
          y(Math.sin(distance * 9) * amplitude * influence);
          rotate(Math.cos(distance * 7) * 2 * influence);
        });
        previous = { x: sample.x, time: now };
      };
      const move = (event) => {
        sample = { x: event.clientX };
        if (!bounds) enter(event);
        if (!frame) frame = requestAnimationFrame(render);
        clearTimeout(restTimer);
        restTimer = setTimeout(settle, 160);
      };
      const resize = () => { settle(); bounds = null; };
      word.addEventListener("pointerenter", enter);
      word.addEventListener("pointermove", move, { passive: true });
      word.addEventListener("pointerleave", settle);
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("scroll", settle, { passive: true });
      return () => {
        settle();
        word.removeEventListener("pointerenter", enter);
        word.removeEventListener("pointermove", move);
        word.removeEventListener("pointerleave", settle);
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", settle);
        word.textContent = text;
        word.removeAttribute("aria-label");
      };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
  };
})();
