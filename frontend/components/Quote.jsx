import { Sparkle } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, softScale, smoothTransition, viewportReplay } from './animationPresets';

export default function Quote({ data }) {
  const quote = data?.quote;
  if (!quote) return null;

  return (
    <motion.section
      className="quote-section"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      transition={{ ...smoothTransition, delay: 0.12 }}
      viewport={viewportReplay}
    >
      <motion.div
        className="quote-block"
        variants={softScale}
        initial="hidden"
        whileInView="show"
        transition={{ duration: 0.65, ease: 'easeOut' }}
        viewport={{ ...viewportReplay, amount: 0.35 }}
      >
        <span className="quote-mark">"</span>
        <p className="quote-text">{quote.text}</p>
        <p className="quote-signature">{quote.signature}</p>
        <p className="quote-cta">
          <Sparkle className="inline-icon" aria-hidden="true" /> {quote.cta}
        </p>
      </motion.div>
    </motion.section>
  );
}
