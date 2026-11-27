import { ownerName, getPageSeo } from '../src/seo.js';
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function renderHead(path, siteUrl) {
  const seo = getPageSeo(path, siteUrl);
  const e = escapeHtml;
  return `<!--seo:start-->
    <title>${e(seo.title)}</title>
    <meta name="description" content="${e(seo.description)}">
    <meta name="author" content="${ownerName}">
    <meta name="robots" content="${seo.robots}">
    <link rel="canonical" href="${e(seo.canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Methmi Pathirana Portfolio">
    <meta property="og:locale" content="en_US">
    <meta property="og:title" content="${e(seo.title)}">
    <meta property="og:description" content="${e(seo.description)}">
    <meta property="og:url" content="${e(seo.canonical)}">
    <meta property="og:image" content="${e(seo.image)}">
    <meta property="og:image:alt" content="Methmi Pathirana, full-stack developer">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${e(seo.title)}">
    <meta name="twitter:description" content="${e(seo.description)}">
    <meta name="twitter:image" content="${e(seo.image)}">
    ${seo.structuredData ? `<script id="page-schema" type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>` : ''}
    <!--seo:end-->`;
}
