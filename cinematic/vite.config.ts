import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccessibleContent } from './src/components/AccessibleContent.tsx'
export default defineConfig({
  base: '/experience/',
  plugins: [react(), tailwindcss(), {
    name: 'portfolio-static-content',
    transformIndexHtml(html) { return html.replace('<!--portfolio-content-->', renderToStaticMarkup(createElement(AccessibleContent))) },
  }],
  server: { port: 5174, strictPort: true },
  build: { outDir: '../experience', emptyOutDir: true },
})
