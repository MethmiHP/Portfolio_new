import { Globe2, Sparkle } from 'lucide-react';
import { Parallax } from 'react-scroll-parallax';
import CountUp from './CountUp';
import heroImage from '../src/assets/Untitled-1.png';
import { mediaUrl } from '../src/api';

function parseStatValue(value) {
  const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);

  return {
    number: match ? Number(match[1]) : 0,
    suffix: match ? match[2] : String(value),
  };
}

export default function Hero({ data }) {
  if (!data) return null;
  const headings = data.settings?.sectionHeadings || {};
  const imageSrc = data.settings?.heroImage ? mediaUrl(data.settings.heroImage) : heroImage;

  return (
    <section className="hero" id="home">
      <div className="hero-top-bar">
        <span className="hero-top-label">{data.topLabel}</span>
        <span className="hero-top-badge">
          <Sparkle className="inline-icon" aria-hidden="true" /> {data.topBadge}
        </span>
      </div>

      <Parallax speed={-12} className="hero-bg-parallax">
        <div className="hero-bg-text">{headings.heroBg || 'PORTFOLIO'}</div>
      </Parallax>

      <div className="hero-grid">
        <div className="hero-left">
          <p className="hero-greeting">{data.greeting}</p>
          <h1 className="hero-name">{data.name}</h1>
          <h2 className="hero-title">{data.title}</h2>
          <p className="hero-bio">{data.bio}</p>
          <p className="hero-availability">
            <Globe2 className="inline-icon" aria-hidden="true" /> {data.availability}
          </p>
        </div>

        <div className="hero-center">
          <Parallax speed={8} className="hero-portrait-parallax">
            <img
              src={imageSrc}
              alt={`${data.name || 'Sandaru Kaushan'} full-stack developer and AI engineer`}
              className="hero-portrait"
            />
          </Parallax>
        </div>

        <div className="hero-right">
          <p className="hero-tagline">
            <Sparkle className="inline-icon" aria-hidden="true" /> {data.tagline}
          </p>
          <div className="hero-stats">
            {(data.stats || []).map((stat, i) => {
              const { number, suffix } = parseStatValue(stat.value);

              return (
                <div className="stat-item" key={i}>
                  <CountUp
                    from={0}
                    to={number}
                    suffix={suffix}
                    duration={1.4}
                    delay={i * 0.08}
                    className="stat-value"
                  />
                  <span className="stat-label">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


