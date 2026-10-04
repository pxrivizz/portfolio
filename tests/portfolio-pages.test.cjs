const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// A minimal DOM harness tests rendering logic without claiming browser layout coverage.
class Node {
  constructor(tag = "div") { this.tagName = tag; this.children = []; this.attrs = {}; this.events = {}; this.hidden = false; this.dataset = {}; this.text = ""; }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map((child) => child.textContent).join(""); }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; this.text = ""; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  addEventListener(key, fn) { this.events[key] = fn; }
  removeAttribute(key) { delete this.attrs[key]; }
}
const nodes = (root, tag) => root.children.flatMap((child) => [child, ...nodes(child)]).filter((node) => !tag || node.tagName === tag);
function boot(page, search = "", mutate = () => {}) {
  const html = read(page);
  const targets = new Map();
  for (const [selector, tag] of [...html.matchAll(/<([\w-]+)[^>]*\s(data-[\w-]+)[\s=>]/g)].map((match) => [`[${match[2]}]`, match[1]])) targets.set(selector, new Node(tag));
  targets.set('meta[name="description"]', new Node("meta"));
  const document = { title: "", createElement: (tag) => new Node(tag), createElementNS: (_, tag) => new Node(tag), querySelector: (selector) => {
    assert(targets.has(selector), `Missing HTML target ${selector}`); return targets.get(selector);
  }};
  let printCalls = 0;
  const window = { location: { search }, print: () => printCalls++ };
  const context = vm.createContext({ window, document, URL, URLSearchParams });
  vm.runInContext(read("content.js"), context);
  vm.runInContext(read("js/detail-ui.js"), context);
  vm.runInContext(read("js/resume.js"), context);
  mutate(window.PORTFOLIO_CONTENT);
  // Model the initial hidden attributes needed by these views.
  for (const selector of ["[data-project-layout]", "[data-project-empty]", "[data-print-profile]", "[data-cv-download]", "[data-cv-view]"]) if (targets.has(selector)) targets.get(selector).hidden = true;
  const run = (file) => vm.runInContext(read(file), context);
  return { targets, document, window, context, run, prints: () => printCalls };
}

test("project data uses unique stable IDs and existing local assets", () => {
  const app = boot("project.html");
  const projects = app.window.PORTFOLIO_CONTENT.projects;
  assert.equal(projects.length, 4);
  assert.equal(new Set(projects.map((project) => project.id)).size, 4);
  for (const project of projects) {
    assert.match(project.id, /^[a-z0-9-]+$/);
    assert(fs.existsSync(path.join(root, project.image)));
    for (const shot of project.screenshots) { assert(fs.existsSync(path.join(root, shot.src))); assert(shot.alt); }
  }
});

test("QR case study renders real screenshots, source link and internal outline", () => {
  const app = boot("project.html", "?id=qr-yoklama"); app.run("js/project-detail.js");
  assert.equal(app.document.title, "QR Yoklama — Halil Çiftçi");
  assert.equal(app.targets.get("[data-project-layout]").hidden, false);
  const actions = nodes(app.targets.get("[data-project-actions]"), "a");
  assert.equal(actions.length, 1);
  assert.equal(actions[0].href, "https://github.com/pxrivizz/qr_yoklama");
  assert.equal(actions[0].rel, "noopener noreferrer");
  const story = app.targets.get("[data-project-story]");
  assert.equal(nodes(story, "img").length, 2);
  const ids = new Set(story.children.map((section) => section.id));
  for (const item of nodes(app.targets.get("[data-project-outline]"), "a")) assert(ids.has(item.href.slice(1)));
  assert.match(story.textContent, /30-second/);
  assert.match(story.textContent, /have not been measured/);
  assert.match(app.targets.get("[data-project-next]").textContent, /pxrivizz/);
});

test("unpublished project and invalid IDs have clear non-fictional fallback states", () => {
  for (const id of ["project-3", "missing", "<script>alert(1)</script>", ""]) {
    const app = boot("project.html", `?id=${encodeURIComponent(id)}`); app.run("js/project-detail.js");
    assert.equal(app.targets.get("[data-project-layout]").hidden, true);
    assert.equal(app.targets.get("[data-project-empty]").hidden, false);
    assert(!app.targets.get("[data-project-title]").textContent.includes("<script>"));
  }
});

test("quick profile contains current education, two real projects, contact and print action", () => {
  const app = boot("profile.html"); app.run("js/profile.js");
  assert.equal(app.targets.get("[data-profile-name]").textContent, "Halil Çiftçi");
  assert.match(app.targets.get("[data-profile-facts]").textContent, /MSKU · ISE · 3rd year/);
  assert.equal(app.targets.get("[data-profile-projects]").children.length, 2);
  assert.equal(app.targets.get("[data-profile-skills]").children.length, 4);
  assert.match(app.targets.get("[data-profile-contact]").textContent, /halilciftci39@gmail.com/);
  assert.equal(app.targets.get("[data-cv-download]").hidden, false);
  assert.equal(app.targets.get("[data-cv-download]").href, "assets/documents/halil-ciftci-cv.pdf");
  assert.equal(app.targets.get("[data-cv-view]").hidden, false);
  assert.equal(app.targets.get("[data-cv-view]").target, "_blank");
  assert.equal(app.targets.get("[data-cv-view]").rel, "noopener noreferrer");
  assert.equal(app.targets.get("[data-print-profile]").hidden, false);
  app.targets.get("[data-print-profile]").events.click(); assert.equal(app.prints(), 1);
});

test("URL helpers reject script URLs, traversal and placeholder values", () => {
  const app = boot("profile.html"); const ui = app.window.Portfolio.detailUI;
  for (const url of ["javascript:alert(1)", "data:text/html,hi", "[PLACEHOLDER]", ""]) assert.equal(ui.safeUrl(url), null);
  assert.equal(ui.localAsset("assets/../secret.pdf", ["pdf"]), null);
  assert.equal(ui.localAsset("assets/cv.pdf", ["pdf"]), "assets/cv.pdf");
  assert.equal(ui.localAsset("https://example.com/photo.jpg", ["jpg"]), null);
  assert.equal(ui.safeUrl("https://github.com/pxrivizz/qr_yoklama"), "https://github.com/pxrivizz/qr_yoklama");
});

test("CV experience, education, languages, skills and all eight projects render in the profile", () => {
  const app = boot("profile.html"); app.run("js/profile.js");
  const experience = app.targets.get("[data-profile-experience]");
  assert.equal(experience.children.length, 2);
  assert.match(experience.textContent, /Sabancı University/);
  assert.match(experience.textContent, /Aug 2026 – Sep 2026/);
  assert.match(experience.textContent, /APECTRA/);
  assert.match(experience.textContent, /Sep 2025 – Present/);
  assert.match(experience.textContent, /Moodle plugins/);
  assert.match(app.targets.get("[data-profile-education]").textContent, /3rd year · GPA 3.76 \/ 4.0/);
  assert.match(app.targets.get("[data-profile-languages]").textContent, /B1 · Intermediate/);
  assert.match(app.targets.get("[data-profile-capabilities]").textContent, /Fusion 360/);
  assert.match(app.targets.get("[data-profile-capabilities]").textContent, /Model fine-tuning/);
  assert.equal(app.targets.get("[data-profile-cv-projects]").children.length, 8);
  assert.match(app.targets.get("[data-profile-cv-projects]").textContent, /TARS.*Prototype/);
  assert(nodes(app.targets.get("[data-profile-contact]"), "a").some((node) => node.href === "tel:+905446911863"));
});

test("homepage experience uses the same CV source and compact content without duplicate entries", () => {
  const app = boot("index.html");
  const target = app.targets.get("[data-about-experience]");
  app.window.Portfolio.renderExperience(target, "h4", true);
  assert.equal(target.children.length, 2);
  assert.equal(nodes(target, "h4").length, 2);
  assert.equal(nodes(target, "ul").length, 0);
  app.window.Portfolio.renderExperience(target, "h4", true);
  assert.equal(target.children.length, 2);
  assert.match(app.window.PORTFOLIO_CONTENT.about.paragraphs.join(" "), /Moodle/);
});

test("configured CV is enabled and invalid external project links are excluded", () => {
  const profile = boot("profile.html", "", (content) => { content.profile.cvUrl = "assets/cv.pdf"; });
  profile.run("js/profile.js");
  assert.equal(profile.targets.get("[data-cv-download]").hidden, false);
  assert.equal(profile.targets.get("[data-cv-download]").download, "Halil-Ciftci-CV.pdf");
  const app = boot("project.html", "?id=qr-yoklama", (content) => {
    content.projects[0].url = "javascript:alert(1)";
    content.projects[0].repository = "data:text/html,bad";
  });
  app.run("js/project-detail.js");
  assert.equal(app.targets.get("[data-project-actions]").children.length, 0);
});

test("CV file is a PDF and unavailable CV configuration hides both actions", () => {
  const pdf = fs.readFileSync(path.join(root, "assets/documents/halil-ciftci-cv.pdf"));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  for (const url of ["[PLACEHOLDER]", "javascript:alert(1)", ""]) {
    const app = boot("profile.html", "", (content) => { content.profile.cvUrl = url; });
    app.run("js/profile.js");
    assert.equal(app.targets.get("[data-cv-download]").hidden, true);
    assert.equal(app.targets.get("[data-cv-view]").hidden, true);
  }
});

test("local HTML resources exist and detail views stay independent of the homepage scroll system", () => {
  for (const page of ["index.html", "profile.html", "project.html"]) {
    const html = read(page);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#)/.test(value)) continue;
      const file = value.split(/[?#]/)[0];
      if (file) assert(fs.existsSync(path.join(root, file)), `${page}: ${file}`);
    }
    if (page !== "index.html") assert(!/lenis\.min|js\/loader|js\/main/.test(html));
  }
  const index = read("index.html");
  assert(index.indexOf('src="js/detail-ui.js') < index.indexOf('src="js/projects.js'));
  assert(index.indexOf('class="quick-profile-link"') < index.indexOf('<main'));
});
