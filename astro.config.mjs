import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fieldseasonhq.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
