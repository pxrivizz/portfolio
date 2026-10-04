import { lifecycle } from './shared.mjs';
export function initBackPill(element, gsap = window.gsap, plugin = window.MorphSVGPlugin) {
  if (!plugin) return () => {};
  gsap.registerPlugin(plugin);
  const coil = element.querySelector('[data-coil]'), tip = element.querySelector('[data-tip]');
  const initial = coil.getAttribute('d');
  const life = lifecycle(element, [coil, tip], gsap);
  let tween, expanded = false;
  const button = element.tagName === 'BUTTON';
  function set(open) {
    if (life.media.matches) return;
    expanded = open;
    if (button) element.setAttribute('aria-pressed', String(open));
    // Clamp the left reach at the viewport edge; no per-frame layout reads.
    const rect = element.getBoundingClientRect();
    const reach = Math.max(0, Math.min(240, (rect.left - 12) / .75));
    tween?.kill(); gsap.killTweensOf(tip);
    tween = gsap.to(coil, { morphSVG: open ? `M35 27C${-reach * .2} 16 ${-reach * .4} 29 ${-reach * .6} 24S${20 - reach} 20 ${-reach} 22` : initial, duration: .45, ease: 'power2.inOut' });
    gsap.to(tip, { x: open ? -reach - 8 : 0, duration: .45, ease: 'power2.inOut' });
  }
  function reset() { tween?.kill(); gsap.killTweensOf(tip); coil.setAttribute('d', initial); gsap.set(tip, { x: 0 }); expanded = false; if (button) element.setAttribute('aria-pressed', 'false'); }
  life.on(element, 'pointerenter', event => { if (event.pointerType === 'mouse' && life.fine.matches) set(true); });
  life.on(element, 'pointerleave', event => { if (event.pointerType === 'mouse') set(false); });
  life.on(element, 'focus', () => { if (!button && element.matches(':focus-visible')) set(true); });
  life.on(element, 'blur', () => set(false));
  if (button) { element.setAttribute('aria-pressed', 'false'); life.on(element, 'click', () => set(!expanded)); }
  life.on(life.media, 'change', reset); life.on(document, 'visibilitychange', reset);
  return () => { reset(); life.cleanup(); if (button) element.removeAttribute('aria-pressed'); };
}
