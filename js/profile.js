(function () {
  const content = window.PORTFOLIO_CONTENT;
  const ui = window.Portfolio?.detailUI;
  if (!content || !ui) return;
  const { element, link, hasText, safeUrl, localAsset, projectHref } = ui;
  const set = (selector, value) => { document.querySelector(selector).textContent = value; };
  document.title = `${content.name} — Quick profile`;
  set("[data-profile-name]", content.name);
  set("[data-profile-role]", content.role);
  set("[data-profile-summary]", content.profile.summary);
  const portrait = document.querySelector("[data-profile-photo]");
  const image = localAsset(content.portrait, ["jpg", "jpeg", "png", "webp", "avif", "svg"]);
  if (image) { portrait.src = image; portrait.alt = content.portraitAlt; }
  else portrait.hidden = true;
  portrait.addEventListener("error", () => { portrait.hidden = true; });

  const facts = document.querySelector("[data-profile-facts]");
  content.about.facts.filter(({ label }) => ["Based in", "Focus", "Education"].includes(label)).forEach(({ label, value }) => {
    const fact = element("div");
    fact.append(element("dt", label), element("dd", value));
    facts.appendChild(fact);
  });
  const skills = document.querySelector("[data-profile-skills]");
  content.expertise.services.forEach((service) => {
    const item = element("li");
    item.append(element("h3", service.title), element("p", service.tags.filter(hasText).join(" · ")));
    skills.appendChild(item);
  });
  window.Portfolio.renderExperience(document.querySelector("[data-profile-experience]"));
  const education = content.profile.education;
  const educationNode = document.querySelector("[data-profile-education]");
  educationNode.append(
    element("h3", education.university),
    element("p", education.degree),
    element("p", `${education.location} · ${education.year}`),
    element("p", `${education.level} · GPA ${education.gpa}`),
  );
  const languages = document.querySelector("[data-profile-languages]");
  content.profile.languages.forEach(({ name, level }) => {
    const item = element("div"); item.append(element("dt", name), element("dd", level)); languages.appendChild(item);
  });
  const capabilities = document.querySelector("[data-profile-capabilities]");
  content.profile.skillGroups.forEach((group) => {
    const item = element("div"), list = element("ul");
    group.items.forEach((skill) => list.appendChild(element("li", skill)));
    item.append(element("h3", group.title), list); capabilities.appendChild(item);
  });
  const cvProjects = document.querySelector("[data-profile-cv-projects]");
  content.profile.cvProjects.forEach((title) => cvProjects.appendChild(element("li", title)));
  const projects = document.querySelector("[data-profile-projects]");
  content.projects.filter((project) => hasText(project.title)).forEach((project) => {
    const article = element("article");
    const heading = element("h3"); heading.appendChild(link(project.title, projectHref(project)));
    article.append(heading, element("p", project.description));
    if (hasText(project.status)) article.appendChild(element("p", project.status));
    const tags = element("ul", undefined, "reading-tags");
    project.technologies.filter(hasText).forEach((tag) => tags.appendChild(element("li", tag)));
    article.appendChild(tags);
    projects.appendChild(article);
  });
  if (!projects.children.length) projects.appendChild(element("p", "Project stories will be added here when they are ready to share."));

  const contacts = document.querySelector("[data-profile-contact]");
  const addContact = (label, url, external) => {
    const item = element("li"); item.appendChild(link(label, url, external)); contacts.appendChild(item);
  };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) addContact(content.email, `mailto:${encodeURIComponent(content.email)}`, false);
  if (/^\+?[\d ()-]{7,22}$/.test(content.phone)) addContact(content.phone, `tel:${content.phone.replace(/[^\d+]/g, "")}`, false);
  contacts.appendChild(element("li", content.profile.address));
  for (const [label, value] of [["GitHub", content.contact.github], ["LinkedIn", content.contact.linkedin]]) {
    const url = safeUrl(value);
    if (url) addContact(`${label}: ${url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`, url, true);
  }
  const printButton = document.querySelector("[data-print-profile]");
  printButton.hidden = false;
  printButton.addEventListener("click", () => window.print());
  const cv = localAsset(content.profile.cvUrl, ["pdf"]) || safeUrl(content.profile.cvUrl);
  if (cv) {
    const download = document.querySelector("[data-cv-download]");
    download.href = cv;
    if (cv.startsWith("assets/")) download.download = "Halil-Ciftci-CV.pdf";
    else { download.target = "_blank"; download.rel = "noopener noreferrer"; }
    download.hidden = false;
    const view = document.querySelector("[data-cv-view]");
    view.href = cv;
    view.target = "_blank";
    view.rel = "noopener noreferrer";
    view.setAttribute("aria-label", "View CV PDF (opens in a new tab)");
    view.hidden = false;
  }
})();
