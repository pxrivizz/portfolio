export const WORK_DEFAULTS = Object.freeze({ totalHitsToShatter: 14, windup: .1, strike: .08, wobble: .18, recover: .24, fall: .55, resetDelay: 1.5, assemble: .45, ease: 'back.out(1.7)' });

export function initWorkPill(button, { gsap = window.gsap, status, ...overrides } = {}) {
  const config = { ...WORK_DEFAULTS, ...overrides };
  if (!Number.isInteger(config.totalHitsToShatter) || config.totalHitsToShatter < 1) throw new Error('totalHitsToShatter must be a positive integer');
  const letters = [...button.querySelectorAll('.work-letter')];
  const hammer = button.querySelector('.work-hammer');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const targets = [hammer, ...letters];
  const savedStyles = targets.map(el => el.getAttribute('style'));
  let hitCount = 0, active = false, destroyed = false, timeline;
  const listeners = [];
  const say = text => { if (status) status.textContent = text; };
  const listen = (target, event, fn) => { target.addEventListener(event, fn); listeners.push(() => target.removeEventListener(event, fn)); };
  const reset = () => {
    timeline?.kill();
    gsap.killTweensOf(targets);
    if (destroyed) return;
    gsap.set(targets, { x: 0, y: 0, rotation: 0, opacity: 1 });
    hitCount = 0; active = false;
    say(reduce.matches ? 'Reduced motion is on. Work stays still.' : `Ready — 0 / ${config.totalHitsToShatter} hits.`);
  };
  const hit = () => {
    if (destroyed || active || reduce.matches || document.hidden) return;
    active = true;
    {
      timeline?.kill();
      timeline = gsap.timeline({ onComplete: () => { active = false; } });
      timeline.to(hammer, { rotation: -48, duration: config.windup, ease: 'power2.out' })
        .to(hammer, { rotation: 52, x: 8, duration: config.strike, ease: 'power2.in' })
        .call(() => {
          hitCount++;
          say(hitCount === config.totalHitsToShatter ? 'Shattered! Putting Work back together…' : `${hitCount} / ${config.totalHitsToShatter} hits.`);
        });
      const progress = Math.min((hitCount + 1) / config.totalHitsToShatter, 1);
      const impact = config.windup + config.strike;
      timeline.to(hammer, { rotation: 0, x: 0, duration: config.recover, ease: config.ease }, impact);
      letters.forEach((letter, i) => {
        const drift = { x: (i - 1.5) * 5 * progress, y: progress * (i === letters.length - 1 ? 15 : 3 + i * 2), rotation: (i % 2 ? 1 : -1) * progress * (i === letters.length - 1 ? 23 : 8) };
        const intensity = .5 + progress;
        timeline.fromTo(letter, {
          x: drift.x + gsap.utils.random(-4, 4) * intensity,
          y: drift.y + gsap.utils.random(-4, -2) * intensity,
          rotation: drift.rotation + gsap.utils.random(-7, 7) * intensity,
        }, { ...drift, duration: config.wobble, ease: 'elastic.out(1, .45)', immediateRender: false }, impact);
      });
      if (progress === 1) {
        const fallAt = impact + config.wobble;
        timeline.to(letters, { y: i => 65 + i * 12, x: i => (i - 1.5) * 22, rotation: i => (i % 2 ? 1 : -1) * (45 + i * 20), duration: config.fall, ease: 'power2.in', stagger: .035 }, fallAt)
          .to(letters, { opacity: 0, duration: .2, stagger: .035 }, fallAt + .25)
          .set(letters, { x: 0, y: -9, rotation: 0 }, `+=${config.resetDelay}`)
          .to(letters, { y: 0, opacity: 1, duration: config.assemble, stagger: .045, ease: config.ease })
          .call(() => { hitCount = 0; say(`Fresh start — 0 / ${config.totalHitsToShatter} hits.`); });
      }
    }
  };
  listen(button, 'pointerenter', e => { if (e.pointerType === 'mouse' && fine.matches) hit(); });
  listen(button, 'pointermove', e => { if (e.pointerType === 'mouse' && fine.matches) hit(); });
  listen(button, 'click', hit); // Native click covers taps, Enter and Space without double touch hits.
  listen(button, 'focus', () => { if (button.matches(':focus-visible')) hit(); });
  listen(reduce, 'change', reset);
  listen(document, 'visibilitychange', () => { if (document.hidden) reset(); });
  const canDisable = 'disabled' in button;
  const initialDisabled = button.disabled;
  if (canDisable) button.disabled = false;
  reset();
  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    listeners.forEach(remove => remove());
    timeline?.kill(); gsap.killTweensOf(targets);
    targets.forEach((el, i) => savedStyles[i] === null ? el.removeAttribute('style') : el.setAttribute('style', savedStyles[i]));
    if (canDisable) button.disabled = initialDisabled;
  };
  cleanup.reset = reset;
  return cleanup;
}
