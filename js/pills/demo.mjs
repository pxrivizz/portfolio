import { initWorkPill } from './work.mjs';
const status = document.querySelector('[data-work-status]');
const reset = document.querySelector('[data-reset]');
const heart = document.querySelector('[data-heart]');
let dispose;
function toggleHeart() { heart.setAttribute('aria-pressed', String(heart.getAttribute('aria-pressed') !== 'true')); }
function resetWork() { dispose?.reset(); }
function mount() {
  if (dispose) return;
  if (!window.gsap) { status.textContent = 'Animation unavailable. Please reload or run npm install locally.'; return; }
  dispose = initWorkPill(document.querySelector('[data-work]'), { status });
  reset.disabled = false;
  reset.addEventListener('click', resetWork);
  heart.addEventListener('click', toggleHeart);
}
function unmount() {
  dispose?.(); dispose = undefined;
  reset.disabled = true;
  reset.removeEventListener('click', resetWork);
  heart.removeEventListener('click', toggleHeart);
}
// Wait for the deferred vendor script regardless of module/defer scheduling.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
window.addEventListener('pagehide', unmount);
window.addEventListener('pageshow', mount);
