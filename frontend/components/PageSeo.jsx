import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSeo } from '../src/seo';

export default function PageSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const seo = getPageSeo(pathname, import.meta.env.VITE_SITE_URL);
    document.title = seo.title;
    const setMeta = (attribute, key, content) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.append(tag);
      }
      tag.content = content;
    };
    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', seo.robots);
    for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, url: seo.canonical, image: seo.image })) {
      setMeta('property', `og:${key}`, value);
    }
    for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, image: seo.image })) {
      setMeta('name', `twitter:${key}`, value);
    }
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = seo.canonical;
    document.getElementById('page-schema')?.remove();
    if (seo.structuredData) {
      const script = document.createElement('script');
      script.id = 'page-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(seo.structuredData);
      document.head.append(script);
    }
  }, [pathname]);
  return null;
}
