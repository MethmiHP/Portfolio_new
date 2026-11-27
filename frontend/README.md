# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Search metadata and production deployment

Set `VITE_SITE_URL` to the final public HTTPS origin before running `npm run build`.
The provisional default is `https://www.methmipathirana.online`. Set `VITE_API_URL`
to the deployed backend separately. These variables are public; never put secrets in them.

The build generates page-specific HTML for Home, Hire Me, and the private routes,
plus `robots.txt` and `sitemap.xml`. Home includes visible initial content from
`src/defaults.js`; React replaces it and loads API content. Keep the defaults in
sync with admin-managed content and rebuild after content updates so the initial
HTML stays accurate. This is not a live database snapshot.

`src/seo.js` defines search titles, descriptions, canonical URLs, and Person/ProfilePage
structured data. `public/social-preview.png` is the public social-sharing photo.
Private routes include `noindex` metadata and Vercel `X-Robots-Tag` headers. Robots.txt
allows crawling so search engines can read the noindex instruction. Authentication
continues to protect private API data.

After deployment:

1. Confirm HTTPS, the canonical hostname, and a redirect from any alternative hostname.
2. Verify domain ownership in Google Search Console and submit `/sitemap.xml`.
3. Inspect `/` and `/hire` with Search Console URL Inspection and the Rich Results Test.
4. Add the real portfolio URL to your GitHub and LinkedIn profiles; monitor impressions
   and relevant queries rather than expecting a guaranteed ranking.

Run `npm run build`, `npm run lint`, and `npm run test:seo` before deployment.
