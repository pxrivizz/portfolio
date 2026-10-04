import { initWorkPill } from './work.mjs';

export function initNavigationPills(root = document, gsap = window.gsap) {
  if (!gsap) return () => {}; // Real anchors remain usable without animation.
  const cleanups = [...root.querySelectorAll('[data-nav-work]')].map(link => {
    const dispose = initWorkPill(link, { gsap });
    const reset = () => dispose.reset();
    // Never preventDefault or delay navigation for a decorative animation.
    link.addEventListener('pointerleave', reset);
    link.addEventListener('blur', reset);
    const dialog = link.closest('dialog');
    dialog?.addEventListener('close', reset);
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(entries => { if (!entries[0].isIntersecting) reset(); })
      : null;
    observer?.observe(link);
    return () => {
      observer?.disconnect();
      link.removeEventListener('pointerleave', reset);
      link.removeEventListener('blur', reset);
      dialog?.removeEventListener('close', reset);
      dispose();
    };
  });
  return () => cleanups.forEach(dispose => dispose());
}

let cleanup;
function mount() { if (!cleanup && window.gsap) cleanup = initNavigationPills(); }
function unmount() { cleanup?.(); cleanup = undefined; }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
window.addEventListener('pagehide', unmount);
window.addEventListener('pageshow', mount);
