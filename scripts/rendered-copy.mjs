import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'build/kb/incidents/4471-review/index.html');
let html = await readFile(source, 'utf8');
const links = [...html.matchAll(/<link href="([^"]+)" rel="stylesheet">/g)];
for (const [tag, href] of links) {
  const css = await readFile(resolve(root, 'build/kb/incidents/4471-review', href), 'utf8');
  html = html.replace(tag, '<style>' + css + '</style>');
}
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace('<main>', '<main><p><strong>Static rendered copy.</strong> This captures the compiled page and its default controls. Use the full build for interactive controls.</p>');
await mkdir(resolve(root, 'rendered'), { recursive: true });
await writeFile(resolve(root, 'rendered/4471-review.html'), html);
