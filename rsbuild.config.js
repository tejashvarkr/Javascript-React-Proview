import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],

  source: {
    define: {
      'import.meta.env.dsn': JSON.stringify(process.env.dsn),
    },
  },

  html: {
    tags: [
      {
        tag: 'script',
        attrs: {
          src: `https://prod.proview.io/init.js`,
          crossorigin: 'anonymous',
          async: true,
        },
        
      },
    ],
  },
});
