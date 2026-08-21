import { defaultPortfolio } from '../src/defaults';

export default function Navbar({ settings }) {
  const siteSettings = { ...defaultPortfolio.settings, ...(settings || {}) };
  const links = siteSettings.navbar || [
    { href: '/#home', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/#projects', label: 'Projects' },
    { href: '/#skills', label: 'Skills' },
    { href: '/hire', label: 'Hire Me' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <a href="/#home" className="nav-logo">
        SK<span className="nav-dot">.</span>
      </a>
      <ul className="nav-links">
        {links.filter((link) => link.enabled !== false).filter((link) => (
          siteSettings.hireEnabled !== false || link.href !== '/hire'
        )).map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
