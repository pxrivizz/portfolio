import test from 'node:test';
import assert from 'node:assert/strict';
import { initProcessPill } from '../js/pills/process.mjs';
import { initBackPill } from '../js/pills/back.mjs';

function fixture(tagName = 'BUTTON') {
  globalThis.document = new EventTarget();
  const media = new EventTarget(); media.matches = false;
  globalThis.matchMedia = () => media;
  const node = () => {
    const el = new EventTarget(), attrs = new Map([['d', 'M35 27C12 37 14 7 28 11S27 33 8 22']]);
    el.getAttribute = name => attrs.get(name) ?? null;
    el.setAttribute = (name, value) => attrs.set(name, value);
    el.removeAttribute = name => attrs.delete(name);
    return el;
  };
  const el = node(), coil = node(), tip = node();
  el.tagName = tagName; el.matches = () => true;
  el.getBoundingClientRect = () => ({ left: 300 });
  el.querySelector = selector => selector === '[data-tip]' ? tip : coil;
  const calls = [];
  const tween = { play() { calls.push('play'); }, reverse() { calls.push('reverse'); }, pause() { calls.push('pause'); }, kill() { calls.push('kill'); } };
  const gsap = { registerPlugin() {}, killTweensOf() {}, set() {}, to(target, vars) { calls.push(vars); return tween; } };
  return { el, coil, tip, calls, gsap, media };
}
test('Process reverses on blur, respects reduced motion and removes listeners', () => {
  const f = fixture(); const cleanup = initProcessPill(f.el, f.gsap);
  f.el.dispatchEvent(new Event('focus')); assert.equal(f.calls.at(-1), 'play');
  f.el.dispatchEvent(new Event('blur')); assert.equal(f.calls.at(-1), 'reverse');
  f.media.matches = true; f.media.dispatchEvent(new Event('change'));
  f.el.dispatchEvent(new Event('focus')); assert.equal(f.calls.at(-1), 'pause');
  cleanup(); const count = f.calls.length; f.el.dispatchEvent(new Event('focus')); assert.equal(f.calls.length, count);
});
test('Back toggles demo state, resets path, respects reduced motion, preserves real links', () => {
  const f = fixture(); const initial = f.coil.getAttribute('d'); const cleanup = initBackPill(f.el, f.gsap, {});
  f.el.dispatchEvent(new Event('click')); assert.equal(f.el.getAttribute('aria-pressed'), 'true');
  assert.ok(f.calls.some(call => call.morphSVG?.includes('-240')));
  f.el.dispatchEvent(new Event('click')); assert.equal(f.el.getAttribute('aria-pressed'), 'false');
  f.media.matches = true; f.media.dispatchEvent(new Event('change'));
  f.el.dispatchEvent(new Event('click')); assert.equal(f.el.getAttribute('aria-pressed'), 'false');
  cleanup(); assert.equal(f.coil.getAttribute('d'), initial);
  const link = fixture('A'); const dispose = initBackPill(link.el, link.gsap, {});
  assert.equal(link.el.dispatchEvent(new Event('click', { cancelable: true })), true);
  assert.equal(link.el.getAttribute('aria-pressed'), null); dispose();
});
