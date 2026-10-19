// After the build, give every docs page its own index.html.
// GitHub Pages then answers each page with a normal 200, not a 404.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'

const slugs = readdirSync('src/content')
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/^\d+-/, '').replace(/\.md$/, ''))

for (const slug of slugs) {
  mkdirSync(`dist/${slug}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${slug}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html')
console.log(`Wrote ${slugs.length} page folders and 404.html`)
