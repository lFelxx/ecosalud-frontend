import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scroll manager for client-side navigation:
 *  - PUSH / REPLACE  → scroll to top (user navigated to a new page)
 *  - POP             → restore the saved Y position (browser back / forward)
 *
 * Uses location.key (unique per history entry) as the store key so each
 * entry in the history stack remembers its own scroll offset.
 */

const scrollStore = new Map<string, number>();

export default function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'

  // Persist scroll offset while the user scrolls on the current page
  useEffect(() => {
    const save = () => scrollStore.set(key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);

  // Act on navigation type
  useEffect(() => {
    if (navType === 'POP') {
      // Restore saved position (or top if first visit to this entry)
      const saved = scrollStore.get(key) ?? 0;
      // rAF ensures the new page has rendered before we jump
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, left: 0, behavior: 'instant' });
      });
    } else {
      // New navigation → always start at the top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, key, navType]);

  return null;
}
