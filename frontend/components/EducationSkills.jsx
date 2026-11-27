import { motion } from 'motion/react';
import ScrollFloat from './ScrollFloat/ScrollFloat';
import { fadeLeft, fadeUp, softScale, smoothTransition, viewportReplay } from './animationPresets';

export default function EducationSkills({ data }) {
  if (!data) return null;
  const headings = data.settings?.sectionHeadings || {};

  return (
    <motion.section
      className="education-section"
      id="skills"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      transition={smoothTransition}
      viewport={viewportReplay}
    >
      <ScrollFloat containerClassName="section-float-wrap">
        {headings.educationSkills || 'EDUCATION & SKILLS'}
      </ScrollFloat>

      <div className="education-grid">
        <div className="education-col">
          <h3 className="subsection-title red">{headings.education || 'EDUCATION'}</h3>
          <ul className="education-list">
            {(data.education || []).map((item, i) => (
              <motion.li
                className="education-item"
                key={i}
                variants={fadeLeft}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                viewport={{ ...viewportReplay, amount: 0.35 }}
              >
                <div>
                  <span className="edu-degree">{item.degree}</span>
                  <span className="edu-school">{item.school}</span>
                </div>
                <span className="edu-year">{item.year}</span>
              </motion.li>
            ))}
          </ul>

          <h3 className="subsection-title red skills-title">{headings.skills || 'SKILLS'}</h3>
          <div className="skills-grid">
            {(data.skills || []).map((skill, i) => (
              <motion.span
                className="skill-tag"
                key={i}
                variants={softScale}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.35, delay: Math.min(i * 0.025, 0.35), ease: 'easeOut' }}
                viewport={{ ...viewportReplay, amount: 0.3 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
