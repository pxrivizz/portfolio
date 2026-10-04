// Build step: publish only the browser runtime, not the node_modules directory.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'assets/vendor'), { recursive: true });
for (const file of ['gsap.min.js', 'gsap.min.js.map', 'MorphSVGPlugin.min.js', 'MorphSVGPlugin.min.js.map']) {
  fs.copyFileSync(require.resolve(`gsap/dist/${file}`), path.join(root, 'assets/vendor', file));
}
