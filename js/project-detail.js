(function () {
  const content = window.PORTFOLIO_CONTENT;
  const ui = window.Portfolio?.detailUI;
  if (!content || !ui) return;
  const { element, link, hasText, safeUrl, localAsset, projectHref, projectTitle } = ui;
  const id = new URLSearchParams(window.location.search).get("id");
  const index = content.projects.findIndex((project) => project.id === id);
  const project = content.projects[index];
  const set = (selector, text) => { document.querySelector(selector).textContent = text; };
  const empty = (title, description) => {
    const target = document.querySelector("[data-project-empty]");
    target.hidden = false;
    target.append(element("h2", title), element("p", description), link("View quick profile →", "profile.html"));
  };
  if (!project) {
    document.title = `Project not found — ${content.name}`;
    set("[data-project-title]", "Project not found");
    set("[data-project-summary]", "This project link is missing or no longer available.");
    empty("Find another project", "Return to the portfolio or open the quick profile to browse the available project stories.");
    return;
  }
  const title = projectTitle(project, index);
  document.title = `${title} — ${content.name}`;
  set("[data-project-title]", title);
  set("[data-project-category]", hasText(project.category) ? project.category : "Project story");
  const description = hasText(project.description) ? project.description : "This project story is not published yet.";
  set("[data-project-summary]", description);
  document.querySelector('meta[name="description"]').content = `${title}: ${description}`;
  if (!hasText(project.title)) {
    empty("Case study coming soon", "The project description, screenshots and source links will appear here once the details are ready to share.");
    return;
  }
  const tags = document.querySelector("[data-project-technologies]");
  project.technologies.filter(hasText).forEach((tag) => tags.appendChild(element("li", tag)));
  const actions = document.querySelector("[data-project-actions]");
  for (const [label, value] of [["Live demo ↗", project.url], ["View source ↗", project.repository]]) {
    const url = safeUrl(value);
    if (url) actions.appendChild(link(label, url, true));
  }
  if (project.id === "pxrivizz-portfolio") actions.appendChild(link("Explore this website ↗", "index.html"));
  const facts = document.querySelector("[data-project-facts]");
  for (const [label, value] of [["Status", project.status], ["Contribution", project.role]]) {
    if (!hasText(value)) continue;
    const fact = element("div"); fact.append(element("dt", label), element("dd", value)); facts.appendChild(fact);
  }
  const body = document.querySelector("[data-project-story]");
  const outline = document.querySelector("[data-project-outline]");
  const section = (id, title) => {
    const block = element("section"); block.id = id;
    const heading = element("h2", title); heading.id = `${id}-title`;
    block.setAttribute("aria-labelledby", heading.id);
    block.appendChild(heading); body.appendChild(block);
    outline.appendChild(link(title, `#${id}`));
    return block;
  };
  for (const [key, label] of [["problem", "The problem"], ["solution", "The approach"]]) {
    if (hasText(project[key])) section(key, label).appendChild(element("p", project[key]));
  }
  const architecture = (project.architecture || []).filter((item) => hasText(item.title) && hasText(item.description));
  if (architecture.length) {
    const list = element("ul", undefined, "story-architecture");
    architecture.forEach((part) => {
      const item = element("li"); item.append(element("h3", part.title), element("p", part.description)); list.appendChild(item);
    });
    section("architecture", "How it fits together").appendChild(list);
  }
  const highlights = (project.highlights || []).filter(hasText);
  if (highlights.length) {
    const list = element("ul"); highlights.forEach((text) => list.appendChild(element("li", text)));
    section("implementation", "Implementation details").appendChild(list);
  }
  const gallery = section("screenshots", "Screenshots");
  const shots = (project.screenshots || []).filter((shot) => localAsset(shot.src, ["png", "jpg", "jpeg", "webp", "avif", "svg"]) && hasText(shot.alt));
  if (shots.length) {
    const grid = element("div", undefined, "story-gallery");
    shots.forEach((shot) => {
      const figure = element("figure"), image = element("img");
      image.src = shot.src; image.alt = shot.alt; image.loading = "lazy"; image.decoding = "async";
      const caption = element("figcaption", hasText(shot.caption) ? shot.caption : shot.alt);
      image.addEventListener("error", () => { image.hidden = true; caption.textContent = `Image unavailable. ${shot.alt}`; }, { once: true });
      figure.append(image, caption); grid.appendChild(figure);
    });
    gallery.appendChild(grid);
  } else gallery.appendChild(element("p", "Screenshots have not been added yet."));
  if (hasText(project.outcome)) section("outcome", "Current result & next steps").appendChild(element("p", project.outcome));
  const sources = (project.sources || []).filter((source) => hasText(source.label) && safeUrl(source.url));
  if (sources.length) {
    const list = element("ul");
    sources.forEach((source) => { const item = element("li"); item.appendChild(link(source.label, safeUrl(source.url), true)); list.appendChild(item); });
    section("references", "Project references").appendChild(list);
  }
  document.querySelector("[data-project-layout]").hidden = false;
  const next = content.projects.slice(index + 1).concat(content.projects.slice(0, index)).find((item) => hasText(item.title));
  const navigation = document.querySelector("[data-project-next]");
  navigation.appendChild(link("← All projects", "index.html#projects"));
  if (next) navigation.appendChild(link(`Next: ${next.title} →`, projectHref(next)));
})();
