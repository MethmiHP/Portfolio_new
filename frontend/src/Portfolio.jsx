import { useEffect, useState } from 'react';
import { api } from './api';
import { defaultPortfolio, defaultProjects } from './defaults';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SkillsVelocity from '../components/SkillsVelocity';
import Profile from '../components/Profile';
import Projects from '../components/Projects';
import EducationSkills from '../components/EducationSkills';
import WorkProcess from '../components/WorkProcess';
import Quote from '../components/Quote';
import QASection from '../components/QASection';
import Contact from '../components/Contact';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPortfolio(), api.getProjects()])
      .then(([p, proj]) => {
        setPortfolio(p?.key ? p : defaultPortfolio);
        setProjects(proj);
      })
      .catch(() => {
        setPortfolio(defaultPortfolio);
        setProjects(defaultProjects);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading portfolio...</div>;
  }

  return (
    <div className="portfolio">
      <Navbar settings={portfolio?.settings} />
      <Hero data={portfolio} />
      <SkillsVelocity skills={portfolio?.skills || []} />
      <Profile data={portfolio} />
      <Projects projects={projects} settings={portfolio?.settings} />
      <div className="three-col-section">
        <EducationSkills data={portfolio} />
        <WorkProcess data={portfolio} />
        <Quote data={portfolio} />
      </div>
      <QASection settings={portfolio?.settings} />
      <Contact data={portfolio} />
    </div>
  );
}
