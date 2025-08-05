import { useEffect, RefObject, useRef } from "react";

type Event = MouseEvent | TouchEvent;

interface ClickOutsideOptions {
  dragAware?: boolean;
}

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void,
  ignoredRefs: RefObject<HTMLElement | null>[] = [],
  options: ClickOutsideOptions = { dragAware: false }
) => {
  const clickStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const isIgnored = (targetElement: Node) => {
      const mainEl = ref?.current;
      if (!mainEl || mainEl.contains(targetElement)) {
        return true;
      }

      if (
        (targetElement as HTMLElement).closest('[data-is-periodic-grid="true"]')
      ) {
        return true;
      }

      if (
        (targetElement as HTMLElement).closest(
          '[data-element-select-portal="true"]'
        )
      ) {
        return true;
      }

      for (const ignoredRef of ignoredRefs) {
        const ignoredEl = ignoredRef.current;
        if (ignoredEl && ignoredEl.contains(targetElement)) {
          return true;
        }
      }
      return false;
    };

    const simpleListener = (event: Event) => {
      if (!isIgnored(event.target as Node)) {
        handler(event);
      }
    };

    const dragAwareDown = (event: Event) => {
      if (isIgnored(event.target as Node)) {
        return;
      }
      const point = "touches" in event ? event.touches[0] : event;
      clickStartPos.current = { x: point.clientX, y: point.clientY };
    };

    const dragAwareUp = (event: Event) => {
      if (!clickStartPos.current) {
        return;
      }

      const point = "changedTouches" in event ? event.changedTouches[0] : event;
      const dist = Math.hypot(
        point.clientX - clickStartPos.current.x,
        point.clientY - clickStartPos.current.y
      );

      if (dist < 10) {
        handler(event);
      }

      clickStartPos.current = null;
    };

    if (options.dragAware) {
      document.addEventListener("mousedown", dragAwareDown);
      document.addEventListener("mouseup", dragAwareUp);
      document.addEventListener("touchstart", dragAwareDown);
      document.addEventListener("touchend", dragAwareUp);
    } else {
      document.addEventListener("mousedown", simpleListener);
      document.addEventListener("touchstart", simpleListener);
    }

    return () => {
      document.removeEventListener("mousedown", simpleListener);
      document.removeEventListener("touchstart", simpleListener);
      document.removeEventListener("mousedown", dragAwareDown);
      document.removeEventListener("mouseup", dragAwareUp);
      document.removeEventListener("touchstart", dragAwareDown);
      document.removeEventListener("touchend", dragAwareUp);
    };
  }, [ref, handler, ignoredRefs, options.dragAware]);
};
