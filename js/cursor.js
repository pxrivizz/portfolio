(function () {
  const cursor = document.querySelector(".cursor");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!cursor) return;

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const position = { ...pointer };
  let frame = 0;
  let lastTime = 0;

  window.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    cursor.classList.add("is-visible");
    document.body.classList.add("has-custom-cursor");
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    }
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, [data-cursor-active]")) {
      cursor.classList.add("is-active");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, [data-cursor-active]")) {
      cursor.classList.remove("is-active");
    }
  });

  document.documentElement.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
    cancelAnimationFrame(frame);
    frame = 0;
  });

  const render = (time) => {
    const blend = 1 - Math.pow(0.84, Math.min(time - lastTime, 64) / 16.67);
    lastTime = time;
    position.x += (pointer.x - position.x) * blend;
    position.y += (pointer.y - position.y) * blend;
    cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
    // Stop rendering when settled rather than updating forever while idle.
    frame = Math.hypot(pointer.x - position.x, pointer.y - position.y) > 0.1
      ? requestAnimationFrame(render) : 0;
  };
  const disable = () => {
    if (finePointer.matches && !reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = 0;
    cursor.classList.remove("is-visible");
    document.body.classList.remove("has-custom-cursor");
  };
  finePointer.addEventListener("change", disable);
  reducedMotion.addEventListener("change", disable);
})();
