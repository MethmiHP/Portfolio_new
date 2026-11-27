import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../../src/api';
import { defaultPortfolio } from '../../src/defaults';
import ProjectForm from './ProjectForm';

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('portfolio');
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [activeProjectCategory, setActiveProjectCategory] = useState('All');
  const [categoryEdits, setCategoryEdits] = useState({});
  const [questions, setQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [clientProjects, setClientProjects] = useState([]);
  const [clientStatuses, setClientStatuses] = useState(['Requested', 'Started', 'Developing', '10%', '50%', '80%', 'Finished']);

  const projectCategories = [
    ...new Set([
      'Development',
      ...projects.map((project) => project.category || 'Development'),
    ]),
  ];
  const visibleProjects = activeProjectCategory === 'All'
    ? projects
    : projects.filter((project) => (project.category || 'Development') === activeProjectCategory);

  const loadData = async () => {
    const [p, proj] = await Promise.all([api.getPortfolio(), api.getProjects()]);
    const loadedPortfolio = p?.key ? p : defaultPortfolio;
    setPortfolio({
      ...defaultPortfolio,
      ...loadedPortfolio,
      settings: {
        ...defaultPortfolio.settings,
        ...(loadedPortfolio.settings || {}),
        sectionHeadings: {
          ...defaultPortfolio.settings.sectionHeadings,
          ...(loadedPortfolio.settings?.sectionHeadings || {}),
        },
        qa: {
          ...defaultPortfolio.settings.qa,
          ...(loadedPortfolio.settings?.qa || {}),
        },
        hire: {
          ...defaultPortfolio.settings.hire,
          ...(loadedPortfolio.settings?.hire || {}),
        },
        clientPortal: {
          ...defaultPortfolio.settings.clientPortal,
          ...(loadedPortfolio.settings?.clientPortal || {}),
        },
        navbar: loadedPortfolio.settings?.navbar || defaultPortfolio.settings.navbar,
      },
    });
    setProjects(proj);
  };

  const loadQuestions = async () => {
    const items = await api.getAdminQuestions();
    setQuestions(items);
    setQuestionAnswers(
      Object.fromEntries(items.map((item) => [item._id, item.answer || '']))
    );
  };

  const loadClientProjects = async () => {
    const [items, statuses] = await Promise.all([
      api.getAdminClientProjects(),
      api.getClientProjectStatuses(),
    ]);
    setClientProjects(items.map((item) => ({ ...item, password: '' })));
    setClientStatuses(statuses);
  };

  useEffect(() => {
    loadData();
    loadQuestions().catch(() => setQuestions([]));
    loadClientProjects().catch(() => setClientProjects([]));
  }, []);

  const handlePortfolioSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.updatePortfolio(portfolio);
      setPortfolio(updated);
      setMessage('Portfolio updated successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setPortfolio({ ...portfolio, [field]: value });
  };

  const updateContact = (field, value) => {
    setPortfolio({
      ...portfolio,
      contact: { ...portfolio.contact, [field]: value },
    });
  };

  const updateSettings = (field, value) => {
    setPortfolio({
      ...portfolio,
      settings: { ...(portfolio.settings || {}), [field]: value },
    });
  };

  const updateSettingsGroup = (group, field, value) => {
    setPortfolio({
      ...portfolio,
      settings: {
        ...(portfolio.settings || {}),
        [group]: { ...(portfolio.settings?.[group] || {}), [field]: value },
      },
    });
  };

  const updateNavbarItem = (index, field, value) => {
    const navbar = [...(portfolio.settings?.navbar || [])];
    navbar[index] = { ...navbar[index], [field]: value };
    updateSettings('navbar', navbar);
  };

  const uploadSiteImage = async (field, file) => {
    if (!file) return;
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('asset', file);
      const result = await api.uploadPortfolioAsset(fd);
      updateSettings(field, result.path);
      setMessage('Image uploaded. Click Save Portfolio to publish this setting.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (index, field, value) => {
    const socialLinks = [...(portfolio.contact?.socialLinks || [])];
    socialLinks[index] = { ...socialLinks[index], [field]: value };
    setPortfolio({
      ...portfolio,
      contact: { ...portfolio.contact, socialLinks },
    });
  };

  const uploadSocialImage = async (index, file) => {
    if (!file) return;
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('asset', file);
      const result = await api.uploadPortfolioAsset(fd);
      updateSocialLink(index, 'image', result.path);
      setMessage('Social image uploaded. Click Save Portfolio to publish it.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setPortfolio({
      ...portfolio,
      contact: {
        ...portfolio.contact,
        socialLinks: [...(portfolio.contact?.socialLinks || []), { label: '', url: '', type: 'link' }],
      },
    });
  };

  const removeSocialLink = (index) => {
    const socialLinks = [...(portfolio.contact?.socialLinks || [])];
    socialLinks.splice(index, 1);
    setPortfolio({
      ...portfolio,
      contact: { ...portfolio.contact, socialLinks },
    });
  };

  const updateQuote = (field, value) => {
    setPortfolio({
      ...portfolio,
      quote: { ...portfolio.quote, [field]: value },
    });
  };

  const updateStat = (index, field, value) => {
    const stats = [...(portfolio.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    setPortfolio({ ...portfolio, stats });
  };

  const addStat = () => {
    setPortfolio({
      ...portfolio,
      stats: [...(portfolio.stats || []), { value: '', label: '' }],
    });
  };

  const removeStat = (index) => {
    const stats = [...(portfolio.stats || [])];
    stats.splice(index, 1);
    setPortfolio({ ...portfolio, stats });
  };

  const removeExperience = (index) => {
    const experience = [...(portfolio.experience || [])];
    experience.splice(index, 1);
    setPortfolio({ ...portfolio, experience });
  };

  const removeEducation = (index) => {
    const education = [...(portfolio.education || [])];
    education.splice(index, 1);
    setPortfolio({ ...portfolio, education });
  };

  const updateWorkProcess = (index, field, value) => {
    const workProcess = [...(portfolio.workProcess || [])];
    workProcess[index] = { ...workProcess[index], [field]: value };
    setPortfolio({ ...portfolio, workProcess });
  };

  const addWorkProcess = () => {
    setPortfolio({
      ...portfolio,
      workProcess: [...(portfolio.workProcess || []), { step: '', title: '', description: '', icon: 'code' }],
    });
  };

  const removeWorkProcess = (index) => {
    const workProcess = [...(portfolio.workProcess || [])];
    workProcess.splice(index, 1);
    setPortfolio({ ...portfolio, workProcess });
  };

  const updateSkill = (index, value) => {
    const skills = [...(portfolio.skills || [])];
    skills[index] = value;
    setPortfolio({ ...portfolio, skills });
  };

  const addSkill = () => {
    setPortfolio({ ...portfolio, skills: [...(portfolio.skills || []), ''] });
  };

  const removeSkill = (index) => {
    const skills = [...(portfolio.skills || [])];
    skills.splice(index, 1);
    setPortfolio({ ...portfolio, skills });
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    await api.deleteProject(id);
    loadData();
  };

  const addProjectCategory = () => {
    const category = newCategory.trim();
    if (!category) return;
    if (projectCategories.some((existing) => existing.toLowerCase() === category.toLowerCase())) {
      setMessage('That category already exists.');
      setNewCategory('');
      return;
    }

    setNewCategory('');
    setActiveProjectCategory(category);
    setEditingProject({
      category,
      title: '',
      subtitle: '',
      description: '',
      link: '',
      order: projects.length + 1,
      technologies: [],
    });
    setShowProjectForm(true);
    setMessage(`Category "${category}" created. Add the first project and save to show it on the site.`);
  };

  const renameCategory = async (category) => {
    const nextName = (categoryEdits[category] || '').trim();
    if (!nextName || nextName === category) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.renameProjectCategory(category, nextName);
      setProjects(updated);
      setActiveProjectCategory(nextName);
      setCategoryEdits({ ...categoryEdits, [category]: '' });
      setMessage('Category renamed successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!confirm(`Move all "${category}" projects to Main Projects and delete this category?`)) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.deleteProjectCategory(category);
      setProjects(updated);
      setActiveProjectCategory('All');
      setMessage('Category deleted. Projects moved to Main Projects.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveProjectOrder = async (orderedProjects) => {
    setProjects(orderedProjects);
    setMessage('Saving project order...');

    try {
      const updated = await api.reorderProjects(orderedProjects.map((project) => project._id));
      setProjects(updated);
      setMessage('Project order updated successfully!');
    } catch (err) {
      setMessage(err.message);
      loadData();
    } finally {
      setDraggedProjectId(null);
    }
  };

  const moveProject = async (targetId) => {
    if (!draggedProjectId || draggedProjectId === targetId) return;

    const fromIndex = projects.findIndex((project) => project._id === draggedProjectId);
    const toIndex = projects.findIndex((project) => project._id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const orderedProjects = reordered.map((project, index) => ({
      ...project,
      order: index + 1,
    }));

    await saveProjectOrder(orderedProjects);
  };

  const moveProjectByButton = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= projects.length) return;

    const reordered = [...projects];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];

    const orderedProjects = reordered.map((project, orderIndex) => ({
      ...project,
      order: orderIndex + 1,
    }));

    await saveProjectOrder(orderedProjects);
  };

  const handleDeletePortfolio = async () => {
    if (!confirm('Delete the entire portfolio content? The public site will fall back to default content.')) return;
    const password = prompt('Enter your admin password to delete the entire portfolio:');
    if (!password) {
      setMessage('Portfolio delete cancelled. Admin password is required.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.deletePortfolio(password);
      await loadData();
      setMessage('Portfolio content deleted. The site will use default content until you save new content.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerQuestion = async (id) => {
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.answerQuestion(id, questionAnswers[id] || '');
      setQuestions((current) => current.map((item) => (item._id === id ? updated : item)));
      setMessage('Answer saved successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    setSaving(true);
    setMessage('');
    try {
      await api.deleteQuestion(id);
      setQuestions((current) => current.filter((item) => item._id !== id));
      setMessage('Question deleted.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateClientProjectField = (id, field, value) => {
    setClientProjects((current) => current.map((item) => (
      item._id === id ? { ...item, [field]: value } : item
    )));
  };

  const handleSaveClientProject = async (project) => {
    setSaving(true);
    setMessage('');
    try {
      const result = await api.updateClientProject(project._id, project);
      const updated = result.project || result;
      setClientProjects((current) => current.map((item) => (
        item._id === project._id ? { ...updated, password: '' } : item
      )));
      setMessage(result.message || 'Client project updated successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClientProject = async (id) => {
    if (!confirm('Delete this client project request?')) return;
    setSaving(true);
    setMessage('');
    try {
      await api.deleteClientProject(id);
      setClientProjects((current) => current.filter((item) => item._id !== id));
      setMessage('Client project deleted.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  if (!portfolio) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Portfolio Admin</h1>
        <div className="admin-header-actions">
          <a href="/" className="back-link">View Site</a>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          type="button"
          className={tab === 'portfolio' ? 'active' : ''}
          onClick={() => setTab('portfolio')}
        >
          Portfolio Content
        </button>
        <button
          type="button"
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
        >
          Site Settings
        </button>
        <button
          type="button"
          className={tab === 'projects' ? 'active' : ''}
          onClick={() => setTab('projects')}
        >
          Projects
        </button>
        <button
          type="button"
          className={tab === 'qa' ? 'active' : ''}
          onClick={() => {
            setTab('qa');
            loadQuestions().catch(() => setMessage('Failed to load questions.'));
          }}
        >
          Q&A
        </button>
        <button
          type="button"
          className={tab === 'client-projects' ? 'active' : ''}
          onClick={() => {
            setTab('client-projects');
            loadClientProjects().catch(() => setMessage('Failed to load client projects.'));
          }}
        >
          Client Projects
        </button>
      </nav>

      {message && <p className="admin-message">{message}</p>}

      {tab === 'settings' && (
        <form className="admin-form" onSubmit={handlePortfolioSave}>
          <div className="portfolio-save-bar">
            <div>
              <span>Site Settings</span>
              <p>Control images, navigation, section headings, public copy, work process, and footer text.</p>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <section className="admin-section">
            <h2>Images</h2>
            <label>Hero Image
              {portfolio.settings?.heroImage && <span className="admin-muted-note">Current: {portfolio.settings.heroImage}</span>}
              <input type="file" accept="image/*" onChange={(e) => uploadSiteImage('heroImage', e.target.files?.[0])} />
            </label>
            <label>About Image
              {portfolio.settings?.aboutImage && <span className="admin-muted-note">Current: {portfolio.settings.aboutImage}</span>}
              <input type="file" accept="image/*" onChange={(e) => uploadSiteImage('aboutImage', e.target.files?.[0])} />
            </label>
          </section>

          <section className="admin-section">
            <h2>Navigation & Hire Page</h2>
            <div className="setting-toggle-card">
              <div>
                <span>Hire Me Page</span>
                <p>Enable or disable the public project handover page and navbar link.</p>
              </div>
              <button
                type="button"
                className={`admin-toggle-button ${portfolio.settings?.hireEnabled !== false ? 'enabled' : 'disabled'}`}
                onClick={() => updateSettings('hireEnabled', portfolio.settings?.hireEnabled === false)}
              >
                {portfolio.settings?.hireEnabled !== false ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            {(portfolio.settings?.navbar || []).map((item, i) => (
              <div className="inline-fields" key={`${item.href}-${i}`}>
                <input value={item.label || ''} onChange={(e) => updateNavbarItem(i, 'label', e.target.value)} placeholder="Label" />
                <input value={item.href || ''} onChange={(e) => updateNavbarItem(i, 'href', e.target.value)} placeholder="Link" />
                <label className="mini-check">
                  <input type="checkbox" checked={item.enabled !== false} onChange={(e) => updateNavbarItem(i, 'enabled', e.target.checked)} />
                  Show
                </label>
              </div>
            ))}
          </section>

          <section className="admin-section">
            <h2>Section Headings</h2>
            {Object.entries({
              heroBg: 'Hero Background Text',
              about: 'About Heading',
              experience: 'Experience Heading',
              educationSkills: 'Education & Skills Heading',
              education: 'Education Label',
              skills: 'Skills Label',
              workProcess: 'Work Process Heading',
              selectedProjects: 'Projects Heading',
              viewAllProjects: 'View All Projects Label',
            }).map(([field, label]) => (
              <label key={field}>{label}
                <input
                  value={portfolio.settings?.sectionHeadings?.[field] || ''}
                  onChange={(e) => updateSettingsGroup('sectionHeadings', field, e.target.value)}
                />
              </label>
            ))}
            <label>Featured Experience Badge
              <input
                value={portfolio.settings?.featuredExperienceBadge || ''}
                onChange={(e) => updateSettings('featuredExperienceBadge', e.target.value)}
                placeholder="Speech-to-Text AI System"
              />
            </label>
          </section>

          <section className="admin-section">
            <h2>Q&A Chatbot Text</h2>
            {Object.entries({
              toggle: 'Floating Button',
              title: 'Chat Title',
              subtitle: 'Chat Subtitle',
              latestTitle: 'Latest Answers Title',
              replyLabel: 'Reply Label',
              prompt: 'Prompt Text',
              success: 'Success Message',
            }).map(([field, label]) => (
              <label key={field}>{label}
                <input value={portfolio.settings?.qa?.[field] || ''} onChange={(e) => updateSettingsGroup('qa', field, e.target.value)} />
              </label>
            ))}
          </section>

          <section className="admin-section">
            <h2>Hire Page Text</h2>
            {Object.entries({
              kicker: 'Small Label',
              heading: 'Heading',
              description: 'Description',
              clientLink: 'Existing Client Link',
              success: 'Success Message',
            }).map(([field, label]) => (
              <label key={field}>{label}
                {field === 'description' ? (
                  <textarea rows={3} value={portfolio.settings?.hire?.[field] || ''} onChange={(e) => updateSettingsGroup('hire', field, e.target.value)} />
                ) : (
                  <input value={portfolio.settings?.hire?.[field] || ''} onChange={(e) => updateSettingsGroup('hire', field, e.target.value)} />
                )}
              </label>
            ))}
          </section>

          <section className="admin-section">
            <h2>Client Portal Text</h2>
            {Object.entries({
              kicker: 'Login Label',
              loginHeading: 'Login Heading',
              loginDescription: 'Login Description',
              statusKicker: 'Status Page Label',
              backLink: 'Back Link Text',
            }).map(([field, label]) => (
              <label key={field}>{label}
                <input value={portfolio.settings?.clientPortal?.[field] || ''} onChange={(e) => updateSettingsGroup('clientPortal', field, e.target.value)} />
              </label>
            ))}
          </section>

          <section className="admin-section">
            <h2>Footer</h2>
            <label>Copyright Text
              <input value={portfolio.settings?.footerCopyright || ''} onChange={(e) => updateSettings('footerCopyright', e.target.value)} />
            </label>
          </section>

          <section className="admin-section">
            <h2>Work Process Editor</h2>
            {(portfolio.workProcess || []).map((step, i) => (
              <div className="admin-card-item" key={i}>
                <div className="inline-fields">
                  <input placeholder="Step" value={step.step || ''} onChange={(e) => updateWorkProcess(i, 'step', e.target.value)} />
                  <input placeholder="Title" value={step.title || ''} onChange={(e) => updateWorkProcess(i, 'title', e.target.value)} />
                  <input placeholder="Icon: search, bulb, design, code, deliver" value={step.icon || ''} onChange={(e) => updateWorkProcess(i, 'icon', e.target.value)} />
                </div>
                <textarea rows={2} placeholder="Description" value={step.description || ''} onChange={(e) => updateWorkProcess(i, 'description', e.target.value)} />
                <button type="button" className="btn-danger" onClick={() => removeWorkProcess(i)}>Remove Step</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addWorkProcess}>+ Add Work Process Step</button>
          </section>
        </form>
      )}

      {tab === 'portfolio' && (
        <form className="admin-form" onSubmit={handlePortfolioSave}>
          <div className="portfolio-save-bar">
            <div>
              <span>Portfolio Content</span>
              <p>Save your hero, about, skills, quote, and contact updates.</p>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
            <button type="button" className="btn-danger" disabled={saving} onClick={handleDeletePortfolio}>
              Delete Entire Portfolio
            </button>
          </div>

          <section className="admin-section">
            <h2>Hero Section</h2>
            <label>Greeting<input value={portfolio.greeting || ''} onChange={(e) => updateField('greeting', e.target.value)} /></label>
            <label>Name<input value={portfolio.name || ''} onChange={(e) => updateField('name', e.target.value)} /></label>
            <label>Title<input value={portfolio.title || ''} onChange={(e) => updateField('title', e.target.value)} /></label>
            <label>Tagline<input value={portfolio.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} /></label>
            <label>Bio<textarea value={portfolio.bio || ''} onChange={(e) => updateField('bio', e.target.value)} rows={3} /></label>
            <label>Availability<input value={portfolio.availability || ''} onChange={(e) => updateField('availability', e.target.value)} /></label>
            <label>Top Label<input value={portfolio.topLabel || ''} onChange={(e) => updateField('topLabel', e.target.value)} /></label>
            <label>Top Badge<input value={portfolio.topBadge || ''} onChange={(e) => updateField('topBadge', e.target.value)} /></label>
          </section>

          <section className="admin-section">
            <h2>Stats</h2>
            {(portfolio.stats || []).map((stat, i) => (
              <div className="inline-fields" key={i}>
                <input placeholder="Value" value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} />
                <input placeholder="Label" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} />
                <button type="button" className="btn-danger" onClick={() => removeStat(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addStat}>+ Add Stat</button>
          </section>

          <section className="admin-section">
            <h2>About & Experience</h2>
            <label>About Text<textarea value={portfolio.about || ''} onChange={(e) => updateField('about', e.target.value)} rows={4} /></label>
            <h3 className="admin-mini-title">Experience Items</h3>
            {(portfolio.experience || []).map((exp, i) => (
              <div className="admin-card-item" key={i}>
                <input placeholder="Company" value={exp.company} onChange={(e) => {
                  const experience = [...portfolio.experience];
                  experience[i] = { ...experience[i], company: e.target.value };
                  setPortfolio({ ...portfolio, experience });
                }} />
                <input placeholder="Role" value={exp.role} onChange={(e) => {
                  const experience = [...portfolio.experience];
                  experience[i] = { ...experience[i], role: e.target.value };
                  setPortfolio({ ...portfolio, experience });
                }} />
                <textarea placeholder="Description" value={exp.description} rows={2} onChange={(e) => {
                  const experience = [...portfolio.experience];
                  experience[i] = { ...experience[i], description: e.target.value };
                  setPortfolio({ ...portfolio, experience });
                }} />
                <button type="button" className="btn-danger" onClick={() => removeExperience(i)}>Remove Experience</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={() => setPortfolio({
              ...portfolio,
              experience: [...(portfolio.experience || []), { company: '', role: '', description: '' }],
            })}>+ Add Experience</button>
          </section>

          <section className="admin-section">
            <h2>Education</h2>
            {(portfolio.education || []).map((edu, i) => (
              <div className="inline-fields" key={i}>
                <input placeholder="Year" value={edu.year} onChange={(e) => {
                  const education = [...portfolio.education];
                  education[i] = { ...education[i], year: e.target.value };
                  setPortfolio({ ...portfolio, education });
                }} />
                <input placeholder="Degree" value={edu.degree} onChange={(e) => {
                  const education = [...portfolio.education];
                  education[i] = { ...education[i], degree: e.target.value };
                  setPortfolio({ ...portfolio, education });
                }} />
                <input placeholder="School" value={edu.school} onChange={(e) => {
                  const education = [...portfolio.education];
                  education[i] = { ...education[i], school: e.target.value };
                  setPortfolio({ ...portfolio, education });
                }} />
                <button type="button" className="btn-danger" onClick={() => removeEducation(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={() => setPortfolio({
              ...portfolio,
              education: [...(portfolio.education || []), { year: '', degree: '', school: '' }],
            })}>+ Add Education</button>
          </section>

          <section className="admin-section">
            <h2>Skills</h2>
            {(portfolio.skills || []).map((skill, i) => (
              <div className="inline-fields" key={i}>
                <input value={skill} onChange={(e) => updateSkill(i, e.target.value)} />
                <button type="button" className="btn-danger" onClick={() => removeSkill(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addSkill}>+ Add Skill</button>
          </section>

          <section className="admin-section">
            <h2>Quote</h2>
            <label>Quote Text<textarea value={portfolio.quote?.text || ''} onChange={(e) => updateQuote('text', e.target.value)} rows={3} /></label>
            <label>Signature<input value={portfolio.quote?.signature || ''} onChange={(e) => updateQuote('signature', e.target.value)} /></label>
            <label>CTA<input value={portfolio.quote?.cta || ''} onChange={(e) => updateQuote('cta', e.target.value)} /></label>
          </section>

          <section className="admin-section">
            <h2>Contact</h2>
            <label>Heading<input value={portfolio.contact?.heading || ''} onChange={(e) => updateContact('heading', e.target.value)} /></label>
            <label>Description<textarea value={portfolio.contact?.description || ''} onChange={(e) => updateContact('description', e.target.value)} rows={2} /></label>
            <label>CTA Button<input value={portfolio.contact?.cta || ''} onChange={(e) => updateContact('cta', e.target.value)} /></label>
            <label>Email<input value={portfolio.contact?.email || ''} onChange={(e) => updateContact('email', e.target.value)} /></label>
            <label>Website<input value={portfolio.contact?.website || ''} onChange={(e) => updateContact('website', e.target.value)} /></label>
            <label>Phone<input value={portfolio.contact?.phone || ''} onChange={(e) => updateContact('phone', e.target.value)} /></label>
            <label>Location<input value={portfolio.contact?.location || ''} onChange={(e) => updateContact('location', e.target.value)} /></label>
            <h3 className="admin-mini-title">Connect With Me Links</h3>
            {(portfolio.contact?.socialLinks || []).map((link, i) => (
              <div className="admin-card-item" key={i}>
                <div className="inline-fields">
                  <input
                    placeholder="Label"
                    value={link.label || ''}
                    onChange={(e) => updateSocialLink(i, 'label', e.target.value)}
                  />
                  <input
                    placeholder="Type: github, linkedin, fiverr, whatsapp"
                    value={link.type || ''}
                    onChange={(e) => updateSocialLink(i, 'type', e.target.value)}
                  />
                </div>
                <input
                  placeholder="Profile URL"
                  value={link.url || ''}
                  onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                />
                <div className="social-image-admin">
                  {link.image ? (
                    <img src={mediaUrl(link.image)} alt={`${link.label || 'Social'} icon preview`} />
                  ) : (
                    <span>No image selected</span>
                  )}
                  <label>Social Image
                    <input type="file" accept="image/*" onChange={(e) => uploadSocialImage(i, e.target.files?.[0])} />
                  </label>
                  {link.image && (
                    <button type="button" className="btn-secondary" onClick={() => updateSocialLink(i, 'image', '')}>
                      Remove Image
                    </button>
                  )}
                </div>
                <button type="button" className="btn-danger" onClick={() => removeSocialLink(i)}>
                  Remove Link
                </button>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addSocialLink}>+ Add Social Link</button>
          </section>
        </form>
      )}

      {tab === 'projects' && (
        <div className="admin-projects">
          {!showProjectForm ? (
            <>
              <div className="admin-project-toolbar">
                <div className="admin-project-toolbar-main">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setEditingProject(null);
                      setShowProjectForm(true);
                    }}
                  >
                    + Add Project
                  </button>
                  <p>Create projects and organize custom categories like video editing, Blender 3D, mobile apps, or T-shirt design.</p>
                </div>
                <div className="admin-category-create">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Create category: Video Editing, Blender 3D..."
                  />
                  <button type="button" className="btn-secondary" onClick={addProjectCategory}>
                    Create Category
                  </button>
                </div>
              </div>
              <div className="admin-category-list">
                <span className="admin-category-list-label">Filter</span>
                <button
                  type="button"
                  className={activeProjectCategory === 'All' ? 'active' : ''}
                  onClick={() => setActiveProjectCategory('All')}
                >
                  All
                </button>
                {projectCategories.map((category) => (
                  <button
                    type="button"
                    className={activeProjectCategory === category ? 'active' : ''}
                    key={category}
                    onClick={() => setActiveProjectCategory(category)}
                  >
                    {category === 'Development' ? 'Main Projects' : category}
                  </button>
                ))}
              </div>
              <div className="category-manager">
                <h3 className="admin-mini-title">Category Manager</h3>
                {projectCategories.filter((category) => category !== 'Development').length ? (
                  projectCategories.filter((category) => category !== 'Development').map((category) => (
                    <div className="inline-fields" key={category}>
                      <input
                        value={categoryEdits[category] ?? category}
                        onChange={(e) => setCategoryEdits({ ...categoryEdits, [category]: e.target.value })}
                      />
                      <button type="button" className="btn-secondary" disabled={saving} onClick={() => renameCategory(category)}>
                        Rename
                      </button>
                      <button type="button" className="btn-danger" disabled={saving} onClick={() => deleteCategory(category)}>
                        Delete Category
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="admin-muted-note">No custom categories yet. Create one above or add a project with a new category.</p>
                )}
              </div>
              <div className="project-list">
                {visibleProjects.map((p, index) => (
                  <div
                    className={`project-list-item ${draggedProjectId === p._id ? 'dragging' : ''}`}
                    key={p._id}
                    draggable={activeProjectCategory === 'All'}
                    onDragStart={(e) => {
                      if (activeProjectCategory !== 'All') return;
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', p._id);
                      setDraggedProjectId(p._id);
                    }}
                    onDragOver={(e) => {
                      if (activeProjectCategory === 'All') e.preventDefault();
                    }}
                    onDrop={() => {
                      if (activeProjectCategory === 'All') moveProject(p._id);
                    }}
                    onDragEnd={() => setDraggedProjectId(null)}
                  >
                    <span className="project-drag-handle" aria-hidden="true">::</span>
                    <span className="project-order-badge">{String(index + 1).padStart(2, '0')}</span>
                    {p.image && <img src={mediaUrl(p.image)} alt="" className="preview-thumb" />}
                    <div>
                      <strong>{p.title}</strong>
                      {p.category && p.category !== 'Development' && (
                        <span className="admin-project-category">{p.category}</span>
                      )}
                      <p>{p.subtitle}</p>
                    </div>
                    <div className="project-list-actions">
                      <button
                        type="button"
                        disabled={activeProjectCategory !== 'All' || index === 0}
                        onClick={() => moveProjectByButton(index, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={activeProjectCategory !== 'All' || index === projects.length - 1}
                        onClick={() => moveProjectByButton(index, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(p);
                          setShowProjectForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDeleteProject(p._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ProjectForm
              project={editingProject}
              categories={projectCategories}
              onSave={() => {
                setShowProjectForm(false);
                setEditingProject(null);
                loadData();
              }}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
            />
          )}
        </div>
      )}

      {tab === 'qa' && (
        <section className="admin-section qa-admin-section">
          <h2>Q&A Questions</h2>
          {questions.length ? (
            <div className="qa-admin-list">
              {questions.map((item) => (
                <article className={`qa-admin-card ${item.answer ? 'answered' : 'pending'}`} key={item._id}>
                  <div className="qa-admin-head">
                    <div>
                      <span className="qa-admin-label">Asked by</span>
                      <span className="qa-admin-name">{item.name}</span>
                    </div>
                    <span className="qa-admin-status">{item.answer ? 'Answered' : 'Pending'}</span>
                    <button type="button" className="btn-danger" onClick={() => handleDeleteQuestion(item._id)}>
                      Delete
                    </button>
                  </div>
                  <div className="qa-admin-question-block">
                    <span>Question</span>
                    <p>{item.question}</p>
                  </div>
                  <label className="qa-admin-answer-field">
                    <span>Your Answer</span>
                    <textarea
                      value={questionAnswers[item._id] || ''}
                      rows={4}
                      onChange={(e) => setQuestionAnswers({
                        ...questionAnswers,
                        [item._id]: e.target.value,
                      })}
                      placeholder="Write your answer. Only admin can publish answers."
                    />
                  </label>
                  <div className="qa-admin-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={saving}
                      onClick={() => handleAnswerQuestion(item._id)}
                    >
                      {item.answer ? 'Update Answer' : 'Publish Answer'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="admin-muted-note">No questions yet.</p>
          )}
        </section>
      )}

      {tab === 'client-projects' && (
        <section className="admin-section client-admin-section">
          <h2>Client Project Portal</h2>
          <p className="admin-muted-note">
            Review project handover requests, set private login credentials, and update live project status for each client.
          </p>
          {clientProjects.length ? (
            <div className="client-admin-list">
              {clientProjects.map((item) => (
                <article className="client-admin-card" key={item._id}>
                  <div className="client-admin-head">
                    <div>
                      <span className="qa-admin-label">Client</span>
                      <h3>{item.clientName}</h3>
                      <p>{item.email}</p>
                      <div className="client-email-statuses">
                        <span>Request email: {item.requestEmailStatus || 'unknown'}</span>
                        <span>Credential email: {item.credentialEmailStatus || 'not-created'}</span>
                        {item.credentialsSentAt && <span>Sent: {new Date(item.credentialsSentAt).toLocaleString()}</span>}
                      </div>
                    </div>
                    <button type="button" className="btn-danger" onClick={() => handleDeleteClientProject(item._id)}>
                      Delete
                    </button>
                  </div>

                  <div className="client-admin-grid">
                    <label>Project Title<input value={item.projectTitle || ''} onChange={(e) => updateClientProjectField(item._id, 'projectTitle', e.target.value)} /></label>
                    <label>Email<input value={item.email || ''} onChange={(e) => updateClientProjectField(item._id, 'email', e.target.value)} /></label>
                    <label>Client Username<input value={item.username || ''} onChange={(e) => updateClientProjectField(item._id, 'username', e.target.value)} placeholder="Give this to the client" /></label>
                    <label>New / Reset Password<input value={item.password || ''} onChange={(e) => updateClientProjectField(item._id, 'password', e.target.value)} placeholder={item.credentialsSentAt ? 'Enter new password to reset and email client' : 'Leave blank to auto-generate on first save'} /></label>
                    <label>Status
                      <select value={item.status || 'Requested'} onChange={(e) => updateClientProjectField(item._id, 'status', e.target.value)}>
                        {clientStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
                      </select>
                    </label>
                    <label>Progress %
                      <input type="number" min="0" max="100" value={item.progress || 0} onChange={(e) => updateClientProjectField(item._id, 'progress', e.target.value)} />
                    </label>
                    <label>Budget<input value={item.budget || ''} onChange={(e) => updateClientProjectField(item._id, 'budget', e.target.value)} /></label>
                    <label>Timeline<input value={item.timeline || ''} onChange={(e) => updateClientProjectField(item._id, 'timeline', e.target.value)} /></label>
                  </div>

                  <label className="wide-field">Project Description
                    <textarea rows={4} value={item.description || ''} onChange={(e) => updateClientProjectField(item._id, 'description', e.target.value)} />
                  </label>
                  <label className="wide-field">Client Feedback / Live Update
                    <textarea rows={4} value={item.feedback || ''} onChange={(e) => updateClientProjectField(item._id, 'feedback', e.target.value)} />
                  </label>
                  <label className="wide-field">Private Admin Notes
                    <textarea rows={3} value={item.notes || ''} onChange={(e) => updateClientProjectField(item._id, 'notes', e.target.value)} />
                  </label>
                  {item.credentialEmailError && (
                    <p className="admin-error">Credential email error: {item.credentialEmailError}</p>
                  )}

                  <div className="client-progress-preview">
                    <span style={{ width: `${Math.max(0, Math.min(100, Number(item.progress) || 0))}%` }} />
                  </div>
                  <button type="button" className="btn-primary" disabled={saving} onClick={() => handleSaveClientProject(item)}>
                    Save Client Project
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="admin-muted-note">No client project requests yet.</p>
          )}
        </section>
      )}
    </div>
  );
}
