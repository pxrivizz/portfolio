import { lifecycle } from './shared.mjs';
export function initProcessPill(element, gsap = window.gsap) {
  const icon = element.querySelector('.motion-pill-icon');
  const life = lifecycle(element, [icon], gsap);
  const tween = gsap.to(icon, { rotation: 75, scale: 1.15, duration: .25, ease: 'back.out(1.7)', paused: true });
  const enter = () => { if (!life.media.matches) tween.play(); };
  const leave = () => tween.reverse();
  const reset = () => tween.pause(0);
  life.on(element, 'pointerenter', event => { if (event.pointerType === 'mouse' && life.fine.matches) enter(); });
  life.on(element, 'pointerleave', leave); life.on(element, 'focus', enter); life.on(element, 'blur', leave);
  life.on(element, 'pointerdown', enter); life.on(element, 'pointerup', leave); life.on(element, 'pointercancel', leave);
  life.on(life.media, 'change', reset); life.on(document, 'visibilitychange', reset);
  return () => { tween.kill(); life.cleanup(); };
}
