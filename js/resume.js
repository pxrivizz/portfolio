(function () {
  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderExperience = function (container, headingTag = "h3", compact = false) {
    const ui = window.Portfolio.detailUI;
    if (!container || !ui) return;
    container.replaceChildren();
    for (const item of window.PORTFOLIO_CONTENT?.experience || []) {
      const article = ui.element("article", undefined, "resume-entry");
      article.append(
        ui.element("p", `${item.period} · ${item.location}`, "resume-entry__meta"),
        ui.element(headingTag, item.organization),
        ui.element("p", item.role, "resume-entry__role"),
        ui.element("p", item.summary),
      );
      if (!compact && item.highlights?.length) {
        const list = ui.element("ul");
        item.highlights.forEach((text) => list.appendChild(ui.element("li", text)));
        article.appendChild(list);
      }
      container.appendChild(article);
    }
  };
})();
