export const viewportReplay = {
  once: false,
  amount: 0.22,
  margin: '-8% 0px -8% 0px',
};

export const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0 },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -72 },
  show: { opacity: 1, x: 0 },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 72 },
  show: { opacity: 1, x: 0 },
};

export const softScale = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1 },
};

export const smoothTransition = {
  duration: 0.72,
  ease: 'easeOut',
};
