import { lifecycle } from './shared.mjs';
export function initAboutPill(element, gsap = window.gsap) {
  const pupils = [...element.querySelectorAll('[data-pupil]')];
  const icon = element.querySelector('svg');
  const life = lifecycle(element, pupils, gsap);
  const movers = pupils.map(p => ({ x: gsap.quickTo(p, 'x', { duration: .2, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: .2, ease: 'power3.out' }) }));
  let timer, frame, latest;
  function center() { clearTimeout(timer); movers.forEach(move => { move.x(0); move.y(0); }); }
  function flush() {
    frame = null;
    if (life.media.matches || document.hidden || !element.getClientRects().length || element.closest('[inert]')) return;
    // One geometry read per frame, then only transform writes.
    const box = icon.getBoundingClientRect();
    if (!box.width || box.bottom < 0 || box.top > innerHeight) return;
    movers.forEach((move, i) => {
      const dx = latest.clientX - (box.left + box.width * (i ? .725 : .275));
      const dy = latest.clientY - (box.top + box.height / 2);
      const length = Math.hypot(dx, dy) || 1;
      move.x(dx / length * Math.min(3, length / 30));
      move.y(dy / length * Math.min(4, length / 30));
    });
    clearTimeout(timer); timer = setTimeout(center, 1000);
  }
  function track(event) { latest = event; if (!frame && !life.media.matches) frame = requestAnimationFrame(flush); }
  function stop() {
    clearTimeout(timer); cancelAnimationFrame(frame); frame = null;
    movers.forEach(move => { move.x.tween.pause(); move.y.tween.pause(); });
    gsap.set(pupils, { x: 0, y: 0 });
  }
  life.on(window, 'pointermove', track, { passive: true });
  life.on(window, 'pointerdown', track, { passive: true });
  life.on(window, 'blur', center);
  life.on(element, 'focus', center);
  life.on(life.media, 'change', stop);
  life.on(document, 'visibilitychange', stop);
  return () => { stop(); movers.forEach(move => { move.x.tween.kill(); move.y.tween.kill(); }); life.cleanup(); };
}
