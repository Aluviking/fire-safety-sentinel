import { useEffect, useState } from "react";

/**
 * Tracks whether the element with the given id has started entering the
 * viewport (its top edge has scrolled above the bottom of the screen),
 * e.g. to reveal floating UI as soon as that section comes into view.
 */
export function useScrollPastSection(sectionId: string) {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = document.getElementById(sectionId);
      if (!el) {
        setReached(window.scrollY > 0);
        return;
      }
      setReached(el.getBoundingClientRect().top <= window.innerHeight / 2);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [sectionId]);

  return reached;
}
