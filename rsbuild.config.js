import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],

  source: {
    define: {
      'import.meta.env.dsn': JSON.stringify(process.env.dsn),
    },
  },
   output: {
    // This resolves the 404 errors by prefixing paths with your repo name
    assetPrefix: process.env.NODE_ENV === 'production' 
      ? '/Javascript-React-Proview/' 
      : '/',
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
