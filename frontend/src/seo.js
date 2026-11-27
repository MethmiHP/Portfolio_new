export const defaultSiteUrl = 'https://www.methmipathirana.online';
export const ownerName = 'Methmi Pathirana';
export const description = 'Methmi Pathirana is a full-stack developer in Sri Lanka building React websites, Node.js and Flask APIs, and mobile apps. Explore projects and get in touch.';
export const profiles = [
  'https://github.com/MethmiHP',
  'https://www.linkedin.com/in/methmi-pathirana-91a4a2251/',
];

export function normalizeSiteUrl(value = defaultSiteUrl) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('VITE_SITE_URL must be a public HTTP(S) URL without credentials.');
  }
  return url.origin;
}

export function getPageSeo(pathname, siteUrl = defaultSiteUrl) {
  const origin = normalizeSiteUrl(siteUrl);
  const path = pathname.replace(/\/$/, '') || '/';
  const pages = {
    '/': { title: 'Methmi Pathirana | Full-Stack Developer in Sri Lanka', description },
    '/hire': {
      title: 'Hire Methmi Pathirana | Full-Stack Web Development',
      description: 'Discuss your web or mobile app project with Methmi Pathirana, a full-stack developer in Sri Lanka. Share your requirements, budget, and timeline.',
    },
    '/admin': { title: 'Admin Login | Methmi Pathirana', description: 'Private portfolio administration.' },
    '/client-login': { title: 'Client Login | Methmi Pathirana', description: 'Sign in to your private project portal.' },
    '/client': { title: 'Client Portal | Methmi Pathirana', description: 'Private client project portal.' },
  };
  const indexable = path === '/' || path === '/hire';
  return {
    ...(pages[path] || { title: 'Page Not Found | Methmi Pathirana', description: 'This page could not be found.' }),
    canonical: origin + (path === '/' ? '/' : path),
    robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    image: `${origin}/social-preview.png`,
    structuredData: path === '/' ? {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: origin + '/',
      name: pages['/'].title,
      mainEntity: {
        '@type': 'Person', '@id': `${origin}/#person`, name: ownerName,
        url: origin + '/', jobTitle: 'Full-Stack Developer',
        description, email: 'mailto:meth.pathirana@gmail.com',
        image: `${origin}/social-preview.png`,
        address: { '@type': 'PostalAddress', addressCountry: 'LK' },
        knowsAbout: ['Full-stack development', 'React', 'Node.js', 'Flask', 'JavaScript', 'React Native', 'Web application development'],
        sameAs: profiles,
      },
    } : null,
  };
}
