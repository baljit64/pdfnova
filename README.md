# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# PDFNova

Free online PDF tools: merge, split, compress, convert PDFs.

## SEO (Google / search)

SEO is implemented for better search visibility:

- **Per-route meta**: Every page has a unique `<title>` and `<meta name="description">` with relevant keywords (e.g. "merge PDF online free", "compress PDF").
- **Open Graph & Twitter Cards**: `og:title`, `og:description`, `og:url`, `og:image` and Twitter equivalents for rich previews when shared.
- **Canonical URLs**: Each page sets a canonical link to avoid duplicate content.
- **JSON-LD**: WebSite and Organization schema on the homepage; SoftwareApplication schema on tool pages for rich results.
- **Sitemap**: `public/sitemap.xml` lists all indexable URLs.
- **robots.txt**: `public/robots.txt` allows crawlers and points to the sitemap.

**Production URL**: Before deploying, set your live domain so all absolute URLs are correct:

1. Create `.env` from `.env.example` and set `VITE_SITE_URL=https://yourdomain.com`.
2. Replace `https://pdfnova.com` in `public/robots.txt`, `public/sitemap.xml`, and `index.html` (canonical) with your domain, or use a build step to inject it.

Submit your sitemap in [Google Search Console](https://search.google.com/search-console) after going live.
