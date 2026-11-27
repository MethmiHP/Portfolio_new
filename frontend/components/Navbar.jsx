import { defaultPortfolio } from '../src/defaults';
import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getSavedTheme } from '../src/theme.js';

export default function Navbar({ settings }) {
  const [theme, setTheme] = useState(getSavedTheme);
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };
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
      <ul className="nav-links">
        {links.filter((link) => link.enabled !== false).filter((link) => (
          siteSettings.hireEnabled !== false || link.href !== '/hire'
        )).map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
      </button>
    </nav>
  );
}
