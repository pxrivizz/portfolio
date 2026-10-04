import { decorate } from './shared.mjs';
import { initAboutPill } from './about.mjs';
import { initProcessPill } from './process.mjs';
import { initBackPill } from './back.mjs';
let cleanups = [];
function mount() {
  if (cleanups.length) return;
  const add = (el, kind, label, init) => {
    const restore = decorate(el, kind, label);
    let cleanup = () => {};
    // A failed animation must never suppress the other visible navigation links.
    try { if (window.gsap) cleanup = init(el); }
    catch (error) { console.warn(`Could not animate ${kind} pill`, error); }
    cleanups.push(() => { cleanup(); restore(); });
  };
  document.querySelectorAll('.hero__nav a[href="#about"], .site-menu a[href="#about"], [data-demo-about]').forEach(el => add(el, 'about', 'About', initAboutPill));
  document.querySelectorAll('[data-demo-process]').forEach(el => add(el, 'process', 'Process', initProcessPill));
  const nav = document.querySelector('.project-page .reading-header nav');
  if (nav && document.getElementById('solution')) {
    const link = document.createElement('a'); link.href = '#solution'; nav.prepend(link);
    cleanups.push(() => link.remove()); add(link, 'process', 'Process', initProcessPill);
  }
  document.querySelectorAll('.project-page .reading-header nav a[href="index.html#projects"], .profile-page .reading-header nav a[href="index.html"], [data-demo-back]').forEach(el => add(el, 'back', 'Back', initBackPill));
}
function unmount() { cleanups.reverse().forEach(cleanup => cleanup()); cleanups = []; }
// Module scripts can execute while readyState is interactive but defer scripts
// (including GSAP and project content) are still pending.
if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
window.addEventListener('pageshow', mount); window.addEventListener('pagehide', unmount);
