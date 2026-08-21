import { ArrowRight, ExternalLink, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import ScrollFloat from './ScrollFloat/ScrollFloat';
import { mediaUrl } from '../src/api';
import { fadeUp, smoothTransition, viewportReplay } from './animationPresets';

const MAIN_CATEGORY = 'Development';

function getCategory(project) {
  return project.category?.trim() || MAIN_CATEGORY;
}

function ProjectCard({ project, index, onSelect }) {
  return (
    <motion.article
      className={`project-card ${project.video ? 'has-video' : ''}`}
      role="button"
      tabIndex={0}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      transition={{ duration: 0.65, delay: Math.min(index * 0.08, 0.32), ease: 'easeOut' }}
      viewport={viewportReplay}
      onClick={() => onSelect({ ...project, index })}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect({ ...project, index });
        }
      }}
    >
      <div className="project-image-wrap">
        {project.video ? (
          <video
            className="project-video-preview"
            src={mediaUrl(project.video)}
            poster={project.image ? mediaUrl(project.image) : undefined}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            onClick={(event) => event.stopPropagation()}
          />
        ) : project.image ? (
          <img
            src={mediaUrl(project.image)}
            alt={`${project.title || 'Portfolio project'}${project.subtitle ? ` - ${project.subtitle}` : ''} by Sandaru Kaushan`}
            className="project-image"
          />
        ) : (
          <div className="project-placeholder">
            <span>{project.title?.charAt(0) || 'P'}</span>
          </div>
        )}
        {!project.video && (
          <div className="project-hover-reveal">
            <span>View Documentation</span>
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="project-footer">
        <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
        <div className="project-info">
          <span className="project-category-label">{getCategory(project)}</span>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-subtitle">{project.subtitle}</p>
          {project.description && <p className="project-desc">{project.description}</p>}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              onClick={(event) => event.stopPropagation()}
            >
              View Project <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}
        </div>
        <ArrowRight className="project-arrow" size={20} strokeWidth={1.8} aria-hidden="true" />
      </div>
    </motion.article>
  );
}

export default function Projects({ projects, settings }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const headings = settings?.sectionHeadings || {};

  const groupedProjects = useMemo(() => {
    const groups = new Map();

    (projects || []).forEach((project) => {
      const category = getCategory(project);
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(project);
    });

    const mainProjects = groups.get(MAIN_CATEGORY) || [];
    groups.delete(MAIN_CATEGORY);

    return {
      mainProjects,
      extraGroups: [...groups.entries()].filter(([, items]) => items.length > 0),
    };
  }, [projects]);

  useEffect(() => {
    if (!selectedProject) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <section className="projects-section" id="projects">
      <motion.div
        className="projects-header"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        transition={smoothTransition}
        viewport={viewportReplay}
      >
        <ScrollFloat containerClassName="projects-heading-wrap">
          {headings.selectedProjects || 'SELECTED PROJECTS'}
        </ScrollFloat>
        <a href="#projects" className="view-all-link">
          {headings.viewAllProjects || 'VIEW ALL PROJECTS'} <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </motion.div>

      <div className="projects-grid">
        {groupedProjects.mainProjects.map((project, index) => (
          <ProjectCard
            project={project}
            index={index}
            key={project._id || `${project.title}-${index}`}
            onSelect={setSelectedProject}
          />
        ))}
      </div>

      {groupedProjects.extraGroups.map(([category, items]) => (
        <div className="project-category-section" key={category}>
          <div className="project-category-heading">
            <span>{category}</span>
            <span className="project-scroll-hint" aria-hidden="true">
              Swipe
              <ArrowRight size={14} strokeWidth={1.8} />
            </span>
          </div>
          <div className="projects-grid project-scroll-row" aria-label={`${category} projects`}>
            {items.map((project, index) => (
              <ProjectCard
                project={project}
                index={index}
                key={project._id || `${project.title}-${index}`}
                onSelect={setSelectedProject}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedProject && (
        <div className="project-modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}>
          <motion.article
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="project-modal-close"
              aria-label="Close project documentation"
              onClick={() => setSelectedProject(null)}
            >
              <X size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>

            <div className="project-modal-media">
              {selectedProject.video ? (
                <video
                  src={mediaUrl(selectedProject.video)}
                  controls
                  playsInline
                  preload="metadata"
                  poster={selectedProject.image ? mediaUrl(selectedProject.image) : undefined}
                />
              ) : selectedProject.image ? (
                <img
                  src={mediaUrl(selectedProject.image)}
                  alt={`${selectedProject.title || 'Portfolio project'}${selectedProject.subtitle ? ` - ${selectedProject.subtitle}` : ''} by Sandaru Kaushan`}
                />
              ) : (
                <div className="project-modal-placeholder">{selectedProject.title?.charAt(0) || 'P'}</div>
              )}
            </div>

            <div className="project-modal-content">
              <span className="project-modal-kicker">
                {getCategory(selectedProject)} / Project {String(selectedProject.index + 1).padStart(2, '0')}
              </span>
              <h2 id="project-modal-title">{selectedProject.title}</h2>
              {selectedProject.subtitle && <p className="project-modal-subtitle">{selectedProject.subtitle}</p>}
              {selectedProject.description && (
                <p className="project-modal-description">{selectedProject.description}</p>
              )}

              {!!selectedProject.technologies?.length && (
                <div className="project-modal-tech">
                  {selectedProject.technologies.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              )}

              {selectedProject.link && (
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-modal-link"
                >
                  Open Live Project <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.article>
        </div>
      )}
    </section>
  );
}


