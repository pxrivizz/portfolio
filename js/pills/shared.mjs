export function lifecycle(element, targets, gsap) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const removers = [];
  const styles = targets.map(target => target.getAttribute('style'));
  let ended = false;
  return {
    media, fine,
    on(target, name, fn, options) { target.addEventListener(name, fn, options); removers.push(() => target.removeEventListener(name, fn, options)); },
    cleanup() {
      if (ended) return;
      ended = true;
      removers.forEach(remove => remove()); gsap.killTweensOf(targets);
      targets.forEach((target, i) => styles[i] === null ? target.removeAttribute('style') : target.setAttribute('style', styles[i]));
    }
  };
}

// Local, trusted SVG templates; labels are inserted as text, never HTML.
export const icons = {
  about: '<svg viewBox="0 0 40 40"><g fill="#fff" stroke="#171612" stroke-width="2"><ellipse cx="11" cy="20" rx="8" ry="12"/><ellipse cx="29" cy="20" rx="8" ry="12"/></g><g fill="#171612"><ellipse data-pupil cx="11" cy="20" rx="3" ry="5"/><ellipse data-pupil cx="29" cy="20" rx="3" ry="5"/></g></svg>',
  process: '<img src="assets/icons/pill-asterisk.svg" alt="">',
  back: '<svg viewBox="0 0 40 40" fill="none" stroke="#171612" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path data-coil d="M35 27C12 37 14 7 28 11S27 33 8 22"/><path data-tip d="M14 16 8 22 16 27"/></svg>'
};
export function decorate(element, kind, label) {
  const hadClass = element.classList.contains('motion-pill');
  const previous = [...element.childNodes];
  const icon = document.createElement('span'); icon.className = 'motion-pill-icon'; icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = icons[kind];
  const text = document.createElement('span'); text.textContent = label;
  element.replaceChildren(icon, text); element.classList.add('motion-pill');
  return () => { element.replaceChildren(...previous); if (!hadClass) element.classList.remove('motion-pill'); };
}
