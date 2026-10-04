(function () {
  window.Portfolio = window.Portfolio || {};
  // Frontend-only validation: no fetch, mailto submission or storage.
  window.Portfolio.validateContact = function ({ name = "", email = "", message = "" }) {
    const errors = {};
    if (name.trim().length < 2 || name.length > 100) errors.name = "Enter your name (2–100 characters).";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (message.trim().length < 10 || message.length > 5000) errors.message = "Write a message of 10–5,000 characters.";
    return errors;
  };

  window.Portfolio.initContact = function () {
    const section = document.querySelector("#contact");
    const content = window.PORTFOLIO_CONTENT;
    if (!section || !content?.contact) return;
    section.querySelector("[data-contact-description]").textContent = content.contact.description;
    section.querySelector("#form-notice").textContent = content.contact.formNotice;
    const items = [
      { label: "Email", value: content.email, email: true },
      { label: "Phone", value: content.phone, phone: true },
      { label: "LinkedIn", value: content.contact.linkedin },
      { label: "GitHub", value: content.contact.github },
      { label: "Location", value: content.contact.location, location: true },
    ];
    items.forEach((item) => {
      let href = null;
      if (item.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)) href = `mailto:${encodeURIComponent(item.value)}`;
      else if (item.phone && /^\+?[\d ()-]{7,22}$/.test(item.value)) href = `tel:${item.value.replace(/[^\d+]/g, "")}`;
      else if (!item.location && !item.email && !item.phone) {
        try { const url = new URL(item.value); if (["http:", "https:"].includes(url.protocol)) href = url.href; } catch { /* Missing content stays plain text. */ }
      }
      const card = document.createElement(href ? "a" : "div");
      card.className = "contact__card";
      if (href) {
        card.href = href;
        if (!item.email && !item.phone) { card.target = "_blank"; card.rel = "noopener noreferrer"; }
      }
      const label = document.createElement("span"); label.className = "contact__card-label"; label.textContent = item.label;
      const value = document.createElement("span"); value.className = "contact__card-value"; value.textContent = item.value;
      const arrow = document.createElement("span"); arrow.className = "contact__card-arrow"; arrow.textContent = "↗"; arrow.setAttribute("aria-hidden", "true");
      card.append(label, value, arrow); section.querySelector("[data-contact-links]").appendChild(card);
    });
    const form = section.querySelector("form");
    const status = section.querySelector(".contact__status");
    const fields = ["name", "email", "message"];
    const values = () => Object.fromEntries(fields.map((key) => [key, form.elements.namedItem(key).value]));
    const showError = (key, error) => {
      const field = form.elements.namedItem(key);
      section.querySelector(`#${key}-error`).textContent = error || "";
      if (error) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    };
    fields.forEach((key) => {
      const field = form.elements.namedItem(key);
      field.addEventListener("input", () => {
        status.textContent = "";
        if (field.hasAttribute("aria-invalid")) showError(key, window.Portfolio.validateContact(values())[key]);
      });
      field.addEventListener("blur", () => {
        if (field.value.trim()) showError(key, window.Portfolio.validateContact(values())[key]);
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const errors = window.Portfolio.validateContact(values());
      fields.forEach((key) => showError(key, errors[key]));
      const first = fields.find((key) => errors[key]);
      if (first) {
        status.textContent = "Please check the highlighted fields.";
        form.elements.namedItem(first).focus();
      } else status.textContent = content.contact.validatedMessage;
    });

    if (!window.gsap) return;
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const light = section.querySelector(".contact__light");
      const area = section.querySelector(".contact__submit-area");
      const button = section.querySelector(".contact__submit");
      const lightX = gsap.quickTo(light, "x", { duration: .7, ease: "power3.out" });
      const lightY = gsap.quickTo(light, "y", { duration: .7, ease: "power3.out" });
      const buttonX = gsap.quickTo(button, "x", { duration: .25, ease: "power3.out" });
      const buttonY = gsap.quickTo(button, "y", { duration: .25, ease: "power3.out" });
      let bounds;
      let buttonBounds;
      const measure = () => { bounds = section.getBoundingClientRect(); buttonBounds = area.getBoundingClientRect(); };
      const move = (event) => {
        if (!bounds) measure();
        lightX(((event.clientX - bounds.left) / bounds.width - .5) * 90);
        lightY(((event.clientY - bounds.top) / bounds.height - .5) * 70);
      };
      const magnet = (event) => {
        if (!buttonBounds) measure();
        buttonX(Math.max(-9, Math.min(9, (event.clientX - buttonBounds.left - buttonBounds.width / 2) * .05)));
        buttonY(Math.max(-6, Math.min(6, (event.clientY - buttonBounds.top - buttonBounds.height / 2) * .15)));
      };
      const release = () => { buttonX(0); buttonY(0); };
      const invalidate = () => { bounds = null; buttonBounds = null; release(); };
      section.addEventListener("pointerenter", measure);
      section.addEventListener("pointermove", move, { passive: true });
      area.addEventListener("pointerenter", measure);
      area.addEventListener("pointermove", magnet, { passive: true });
      area.addEventListener("pointerleave", release);
      button.addEventListener("focus", release);
      window.addEventListener("scroll", invalidate, { passive: true });
      window.addEventListener("resize", invalidate, { passive: true });
      return () => {
        section.removeEventListener("pointerenter", measure); section.removeEventListener("pointermove", move);
        area.removeEventListener("pointerenter", measure); area.removeEventListener("pointermove", magnet); area.removeEventListener("pointerleave", release);
        button.removeEventListener("focus", release);
        window.removeEventListener("scroll", invalidate); window.removeEventListener("resize", invalidate);
      };
    });
  };
})();
