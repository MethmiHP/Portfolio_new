import { motion } from 'motion/react';
import portImage from '../src/assets/port1.png';
import { mediaUrl } from '../src/api';
import { fadeLeft, fadeRight, fadeUp, smoothTransition, viewportReplay } from './animationPresets';

export default function Profile({ data }) {
  if (!data) return null;
  const headings = data.settings?.sectionHeadings || {};
  const imageSrc = data.settings?.aboutImage ? mediaUrl(data.settings.aboutImage) : portImage;

  return (
    <section className="profile-section" id="about">
      <div className="profile-grid">
        <motion.div
          className="profile-image-wrap"
          variants={fadeLeft}
          initial="hidden"
          whileInView="show"
          transition={smoothTransition}
          viewport={viewportReplay}
        >
          <img src={imageSrc} alt={`${data.name || 'Profile'} workspace`} className="profile-image" />
        </motion.div>

        <motion.div
          className="profile-content"
          variants={fadeRight}
          initial="hidden"
          whileInView="show"
          transition={{ ...smoothTransition, delay: 0.08 }}
          viewport={viewportReplay}
        >
          <h2 className="section-heading">{headings.about || 'ABOUT ME'}</h2>
          <p className="profile-about">{data.about}</p>

          <div className="experience-list">
            <h3 className="subsection-title">{headings.experience || 'PROFESSIONAL EXPERIENCE'}</h3>
            {(data.experience || []).map((exp, i) => (
              <motion.div
                className={`experience-item ${i === 0 ? 'experience-item-featured' : ''}`}
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' }}
                viewport={{ ...viewportReplay, amount: 0.35 }}
              >
                <div className="experience-header">
                  <span className="experience-company">{exp.company}</span>
                  <span className="experience-role">{exp.role}</span>
                </div>
                {i === 0 && data.settings?.featuredExperienceBadge !== false && (
                  <span className="experience-badge">{data.settings?.featuredExperienceBadge || 'Speech-to-Text AI System'}</span>
                )}
                <p className="experience-desc">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
