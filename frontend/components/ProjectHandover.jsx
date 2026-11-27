import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../src/api';
import { defaultPortfolio } from '../src/defaults';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';
import { fadeUp, smoothTransition, viewportReplay } from './animationPresets';

const initialForm = {
  clientName: '',
  email: '',
  projectTitle: '',
  description: '',
  budget: '',
  timeline: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const budgetPattern = /^(?:[A-Z]{2,4}\s*)?\$?\s*\d[\d\s,.]*(?:\s*(?:-|to)\s*(?:[A-Z]{2,4}\s*)?\$?\s*\d[\d\s,.]*)?$/i;

function validateForm(values) {
  const errors = {};
  const clientName = values.clientName.trim();
  const email = values.email.trim();
  const projectTitle = values.projectTitle.trim();
  const description = values.description.trim();
  const budget = values.budget.trim();
  const timeline = values.timeline.trim();

  if (clientName.length < 2) errors.clientName = 'Please enter your full name.';
  if (!emailPattern.test(email)) errors.email = 'Please enter a valid email address.';
  if (projectTitle.length < 3) errors.projectTitle = 'Project title must be at least 3 characters.';
  if (description.length < 20) errors.description = 'Please add at least 20 characters about your project.';
  if (budget && (!budgetPattern.test(budget) || budget.length > 80)) {
    errors.budget = 'Use a valid amount or range, like $500 - $1,500.';
  }
  if (timeline.length > 120) errors.timeline = 'Timeline must be 120 characters or less.';

  return errors;
}

export default function ProjectHandover() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState(defaultPortfolio.settings);

  useEffect(() => {
    api.getPortfolio()
      .then((portfolio) => setSettings({ ...defaultPortfolio.settings, ...(portfolio?.settings || {}) }))
      .catch(() => setSettings(defaultPortfolio.settings));
  }, []);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix the highlighted fields before sending.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      const result = await api.requestClientProject(payload);
      setForm(initialForm);
      setErrors({});
      setMessage(result.message || settings.hire?.success || 'Project request sent. I will review it and send your private client login details.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="handover-page">
      <AnimatedBackground />
      <Navbar settings={settings} />
      {settings.hireEnabled === false ? (
        <section className="handover-section">
          <div className="handover-grid">
            <div className="handover-copy">
              <span className="qa-kicker"><BriefcaseBusiness size={16} /> Hire Me</span>
              <h2 className="section-heading">PROJECT REQUESTS ARE CLOSED</h2>
              <p>I am not accepting new project handovers through the website right now.</p>
              <Link to="/" className="client-login-link">Back to Portfolio</Link>
            </div>
          </div>
        </section>
      ) : (
      <section className="handover-section" id="hire">
        <motion.div
          className="handover-grid"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          transition={smoothTransition}
          viewport={viewportReplay}
        >
          <div className="handover-copy">
            <span className="qa-kicker"><BriefcaseBusiness size={16} /> {settings.hire?.kicker || 'Start a Project'}</span>
            <h2 className="section-heading">{settings.hire?.heading || 'HAND OVER YOUR PROJECT'}</h2>
            <p>{settings.hire?.description || 'Share your idea, requirements, budget range, and timeline. After we agree on the project, I can create a private client login where you can track the live status, progress, and feedback.'}</p>
          </div>

          <form className="handover-form" onSubmit={handleSubmit} noValidate>
            <div className="handover-form-row">
              <label>Your Name
                <input value={form.clientName} onChange={(e) => update('clientName', e.target.value)} required aria-invalid={Boolean(errors.clientName)} />
                {errors.clientName && <span className="field-error">{errors.clientName}</span>}
              </label>
              <label>Email
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </label>
            </div>
            <label>Project Title
              <input value={form.projectTitle} onChange={(e) => update('projectTitle', e.target.value)} required aria-invalid={Boolean(errors.projectTitle)} />
              {errors.projectTitle && <span className="field-error">{errors.projectTitle}</span>}
            </label>
            <label>Project Details
              <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} required aria-invalid={Boolean(errors.description)} />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </label>
            <div className="handover-form-row">
              <label>Budget Range
                <input value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="Optional, e.g. $500 - $1,500" aria-invalid={Boolean(errors.budget)} />
                {errors.budget && <span className="field-error">{errors.budget}</span>}
              </label>
              <label>Timeline
                <input value={form.timeline} onChange={(e) => update('timeline', e.target.value)} placeholder="Optional, e.g. 3 weeks" aria-invalid={Boolean(errors.timeline)} />
                {errors.timeline && <span className="field-error">{errors.timeline}</span>}
              </label>
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Project Request'} <ArrowRight size={15} />
            </button>
            {message && <p className="handover-message">{message}</p>}
          </form>
        </motion.div>
      </section>
      )}
    </main>
  );
}
