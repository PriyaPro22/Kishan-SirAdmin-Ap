// Instant feedback animations
export const buttonClickAnimation = {
  initial: { scale: 1 },
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { duration: 0.1 }
};

export const cardHoverAnimation = {
  initial: { y: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  whileHover: { 
    y: -4, 
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    transition: { duration: 0.2 }
  }
};

export const fadeInAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export const slideInAnimation = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { 
    type: 'spring',
    stiffness: 100,
    damping: 15,
    duration: 0.3
  }
};

export const pulseAnimation = {
  animate: { 
    opacity: [1, 0.5, 1],
    scale: [1, 1.02, 1]
  },
  transition: { 
    duration: 2, 
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const shake = {
  animate: {
    x: [-5, 5, -5, 5, 0]
  },
  transition: { duration: 0.4 }
};
