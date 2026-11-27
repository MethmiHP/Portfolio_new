import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { defaultPortfolio as profile, defaultProjects } from '../src/defaults.js';
import { defaultSiteUrl, normalizeSiteUrl } from '../src/seo.js';
import { renderHead, escapeHtml as e } from './seo-html.mjs';

const env = loadEnv('production', process.cwd(), '');
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || env.VITE_SITE_URL || defaultSiteUrl);
const template = await readFile('dist/index.html', 'utf8');
// Visible initial content from the same data as the React page. React replaces
// this when it loads; it is also usable if JavaScript is unavailable.
const home = `<main class="seo-initial">
  <nav aria-label="Main navigation"><a href="/#about">About</a> · <a href="/#projects">Projects</a> · <a href="/hire">Hire Me</a> · <a href="/#contact">Contact</a></nav>
  <p>${e(profile.greeting)}</p><h1>${e(profile.name)} — Full-Stack Developer in Sri Lanka</h1>
  <p>${e(profile.bio)}</p><p>${e(profile.availability)}</p>
  <section id="about"><h2>About Me</h2><p>${e(profile.about)}</p>
  <h2>Professional Experience</h2>${profile.experience.map(item => `<h3>${e(item.company)} — ${e(item.role)}</h3><p>${e(item.description)}</p>`).join('')}</section>
  <section id="projects"><h2>Selected Software Projects</h2>${defaultProjects.map(project => `<article><h3>${e(project.title)}</h3><p>${e(project.subtitle)}</p><p>${e(project.description)}</p><p>${e(project.technologies.join(', '))}</p>${project.link ? `<a href="${e(project.link)}">Explore ${e(project.title)}</a>` : ''}</article>`).join('')}</section>
  <section id="skills"><h2>Education and Skills</h2>${profile.education.map(item => `<p>${e(item.year)} — ${e(item.degree)} · ${e(item.school)}</p>`).join('')}<p>${e(profile.skills.join(', '))}</p></section>
  <section id="contact"><h2>Contact Methmi Pathirana</h2><p>${e(profile.contact.description)}</p><a href="mailto:${e(profile.contact.email)}">${e(profile.contact.email)}</a><p>${e(profile.contact.phone)}</p></section>
</main>`;
const hire = '<main class="seo-initial"><h1>Hire Methmi Pathirana</h1><p>Share your web or mobile application requirements, budget, and timeline.</p><p>Enable JavaScript to use the project request form, or email <a href="mailto:meth.pathirana@gmail.com">meth.pathirana@gmail.com</a>.</p><a href="/">View portfolio and projects</a></main>';
for (const path of ['/', '/hire', '/admin', '/client-login', '/client']) {
  const dir = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(dir, { recursive: true });
  const body = path === '/' ? home : path === '/hire' ? hire : '';
  const html = template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, renderHead(path, siteUrl))
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  await writeFile(`${dir}/index.html`, html);
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/hire</loc></url></urlset>\n`);
// Private pages carry noindex in their HTML and HTTP headers; allow crawling
// so search engines can read that instruction.
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`SEO pages and sitemap generated for ${siteUrl}`);
