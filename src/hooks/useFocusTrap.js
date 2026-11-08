import { useEffect } from 'react';

// Dialog focus trap — keeps Tab / Shift+Tab cycling inside a container while
// it's open. Attach to the outermost dialog element; it intercepts at the
// capture phase so the dialog's own keydown handlers still run first.
// Restores nothing — caller owns focus-on-open / focus-on-close.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useFocusTrap(ref, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const root = ref.current;

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const els = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 || el === document.activeElement
      );
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      const activeEl = document.activeElement;
      const inside = root.contains(activeEl);

      if (e.shiftKey) {
        if (!inside || activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKeyDown, true);
    return () => root.removeEventListener('keydown', onKeyDown, true);
  }, [active, ref]);
}
