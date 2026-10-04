(function () {
  window.Portfolio = window.Portfolio || {};
  const hasText = (value) => typeof value === "string" && value.trim() !== "" && !value.includes("[PLACEHOLDER]");
  const safeUrl = (value) => {
    if (!hasText(value)) return null;
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  const localAsset = (value, extensions) => {
    if (!hasText(value) || !/^assets\/[a-zA-Z0-9_./-]+$/.test(value) || value.split("/").includes("..")) return null;
    return extensions.some((ext) => value.toLowerCase().endsWith(`.${ext}`)) ? value : null;
  };
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const link = (label, href, external = false, className = "") => {
    const node = element("a", label, className);
    node.href = href;
    if (external) { node.target = "_blank"; node.rel = "noopener noreferrer"; }
    return node;
  };
  const projectTitle = (project, index) => hasText(project.title) ? project.title : `Project ${String(index + 1).padStart(2, "0")}`;
  const projectHref = (project) => `project.html?id=${encodeURIComponent(project.id)}`;
  window.Portfolio.detailUI = { hasText, safeUrl, localAsset, element, link, projectTitle, projectHref };
})();
