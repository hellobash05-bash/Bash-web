'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            const siblings = Array.from(element.parentElement?.querySelectorAll('[data-animate]') || []);
            const index = siblings.indexOf(element);
            
            element.style.setProperty('--stagger-index', index.toString());
            element.style.transitionDelay = `${index * 90}ms`;
            
            element.classList.add('in-view');
            revealObserver.unobserve(element);
          });
        },
        { threshold: 0.2 }
      );

      animatedElements.forEach((element) => revealObserver.observe(element));
      
      return () => revealObserver.disconnect();
    } else {
      animatedElements.forEach((element) => element.classList.add('in-view'));
    }
  }, []);

  return null;
}
