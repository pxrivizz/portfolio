(function () {
  window.Portfolio = window.Portfolio || {};

  const buildGrid = (container) => {
    const count = 40;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const tile = document.createElement("span");
      tile.className = "loader__tile";
      fragment.appendChild(tile);
    }

    container.appendChild(fragment);
  };

  window.Portfolio.initLoader = function (onComplete) {
    const loader = document.querySelector(".loader");
    const counter = document.querySelector("[data-loader-count]");
    const grid = document.querySelector("[data-loader-grid]");
    const hello = document.querySelectorAll("[data-hello-path]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!loader || !counter || !grid || !hello.length || !window.gsap) {
      document.body.classList.remove("is-loading");
      loader?.remove();
      onComplete?.();
      return;
    }

    buildGrid(grid);
    const tiles = grid.querySelectorAll(".loader__tile");

    if (reducedMotion) {
      counter.textContent = "100";
      gsap.set(tiles, { scaleY: 1 });
      gsap.set(loader, { display: "none" });
      document.body.classList.remove("is-loading");
      onComplete?.(true);
      return;
    }

    const progress = { value: 0 };
    // Use real SVG units. A normalized 1 → 0 CSS dash can round to
    // whole pixels and look like a sudden reveal instead of handwriting.
    hello.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        autoRound: false,
        autoAlpha: 0,
      });
    });
    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        document.body.classList.remove("is-loading");
        loader.remove();
        onComplete?.(false);
      },
    });

    timeline
      .to(progress, {
        value: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = Math.round(progress.value).toString();
        },
      })
      .to(".loader__count, .loader__ring", {
        autoAlpha: 0,
        y: -18,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.in",
      })
      .set(".loader__hello", { autoAlpha: 1 });

    // Each stroke follows the pen into the next letter, at a steady speed.
    hello.forEach((path) => {
      timeline.set(path, { autoAlpha: 1 });
      timeline.to(path, {
        strokeDashoffset: 0,
        autoRound: false,
        duration: path.getTotalLength() / 390,
        ease: "none",
      });
    });

    timeline
      .to(".loader__hello", { autoAlpha: 0, scale: 1.04, duration: 0.28 }, "+=0.6")
      .to(tiles, {
        scaleY: 1,
        duration: 0.58,
        stagger: { amount: 0.52, from: "random" },
        ease: "power3.inOut",
      });
  };
})();
