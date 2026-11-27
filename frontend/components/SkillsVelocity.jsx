import ScrollVelocity from './ScrollVelocity/ScrollVelocity';

export default function SkillsVelocity({ skills = [] }) {
  if (!skills.length) return null;

  const firstRow = skills.filter((_, index) => index % 2 === 0).join('  /  ');
  const secondRow = skills.filter((_, index) => index % 2 !== 0).join('  /  ');

  return (
    <section className="skills-velocity-section" aria-label="Skills">
      <ScrollVelocity
        texts={[firstRow, secondRow]}
        velocity={36}
        damping={90}
        stiffness={420}
        numCopies={5}
        className="skills-velocity-text"
        parallaxClassName="skills-parallax"
        scrollerClassName="skills-scroller"
      />
    </section>
  );
}
