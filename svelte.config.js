import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({
    extensions: ['.svx'],
    layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
  })],
  kit: {
    adapter: adapter(),
    alias: { '#lib': fileURLToPath(new URL('./src/lib', import.meta.url)) },
  },
};
