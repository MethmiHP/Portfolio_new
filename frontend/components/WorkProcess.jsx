import { Code2, Lightbulb, PenTool, Plane, Search } from 'lucide-react';
import { motion } from 'motion/react';
import ScrollFloat from './ScrollFloat/ScrollFloat';
import { fadeRight, fadeUp, smoothTransition, viewportReplay } from './animationPresets';

const icons = {
  search: Search,
  bulb: Lightbulb,
  design: PenTool,
  code: Code2,
  deliver: Plane,
};

export default function WorkProcess({ data }) {
  if (!data) return null;
  const headings = data.settings?.sectionHeadings || {};

  return (
    <motion.section
      className="process-section"
      id="process"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      transition={{ ...smoothTransition, delay: 0.06 }}
      viewport={viewportReplay}
    >
      <ScrollFloat containerClassName="section-float-wrap">
        {headings.workProcess || 'WORK PROCESS'}
      </ScrollFloat>

      <div className="process-timeline">
        {(data.workProcess || []).map((step, i) => {
          const Icon = icons[step.icon] || Code2;

          return (
            <motion.div
              className="process-step"
              key={i}
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
              viewport={{ ...viewportReplay, amount: 0.35 }}
            >
              <div className="process-icon-col">
                <div className="process-line" />
                <div className="process-icon">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
              </div>
              <div className="process-content">
                <span className="process-number">{step.step}</span>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-desc">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
