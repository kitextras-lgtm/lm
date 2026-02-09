import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    const checkIfInView = () => {
      const rect = currentRef.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < windowHeight && rect.bottom > 0;
    };

    if (checkIfInView()) {
      setIsVisible(true);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          // Use requestAnimationFrame to batch the state update
          requestAnimationFrame(() => {
            setIsVisible(true);
            hasAnimated.current = true;
            // Add a small delay before disconnecting to ensure smooth animation
            setTimeout(() => observer.disconnect(), 1100);
          });
        }
      },
      {
        threshold,
        rootMargin: '100px',
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [threshold]);

  return { ref, isVisible };
};
