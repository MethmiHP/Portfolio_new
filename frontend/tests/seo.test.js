import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getPageSeo, normalizeSiteUrl } from '../src/seo.js';
import { renderHead } from '../scripts/seo-html.mjs';

test('public pages have unique metadata and canonical URLs', () => {
  const home = getPageSeo('/', 'https://portfolio.example/');
  const hire = getPageSeo('/hire/', 'https://portfolio.example');
  assert.notEqual(home.title, hire.title);
  assert.equal(home.canonical, 'https://portfolio.example/');
  assert.equal(hire.canonical, 'https://portfolio.example/hire');
  assert.match(home.robots, /^index,/);
  assert.equal(home.structuredData.mainEntity.name, 'Methmi Pathirana');
  assert.ok(home.structuredData.mainEntity.sameAs.every(url => !url.endsWith('.com/')));
});

test('private and unknown pages cannot be indexed', () => {
  for (const path of ['/admin', '/admin/', '/client', '/client-login', '/missing']) {
    const seo = getPageSeo(path);
    assert.equal(seo.robots, 'noindex, nofollow');
    assert.equal(seo.structuredData, null);
  }
});

test('head markup escapes attributes and contains valid JSON-LD', () => {
  const html = renderHead('/', 'https://portfolio.example');
  const json = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json)['@type'], 'ProfilePage');
  assert.doesNotMatch(html, /Sandaru|sandarukaushan|name="keywords"/);
  assert.throws(() => normalizeSiteUrl('javascript:alert(1)'));
  assert.throws(() => normalizeSiteUrl('https://user:password@example.com'));
});

test('production HTML includes visible projects and route-specific indexing', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(home, /<h1>METHMI PATHIRANA/);
  for (const title of ['Smart Solars', 'MEDICHANNEL', 'MINIMINDS', 'GREENLOOP', 'MOMENTO']) assert.ok(home.includes(title));
  assert.equal((home.match(/rel="canonical"/g) || []).length, 1);
  assert.doesNotMatch(home, /sandarukaushan|Sandaru Kaushan/);
  for (const route of ['admin', 'client', 'client-login']) {
    const html = await readFile(new URL(`../dist/${route}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /content="noindex, nofollow"/);
  }
  const hire = await readFile(new URL('../dist/hire/index.html', import.meta.url), 'utf8');
  assert.match(hire, /<title>Hire Methmi Pathirana/);
  const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.doesNotMatch(sitemap, /admin|client|sandarukaushan/);
});
