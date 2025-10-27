import { RefObject, useEffect, useRef } from 'react';

export function useInfiniteScroll({
  elementRef,
  callback,
  options = { threshold: 0.1 },
}: {
  elementRef: RefObject<HTMLElement>;
  callback: () => Promise<any>;
  options?: IntersectionObserverInit;
}) {
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    if (elementRef?.current) {
      if (observer?.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          // Each entry describes an intersection change for one observed
          // target element:
          //   entry.boundingClientRect
          //   entry.intersectionRatio
          //   entry.intersectionRect
          //   entry.isIntersecting
          //   entry.rootBounds
          //   entry.target
          //   entry.time

          if (entry.isIntersecting) {
            await callback();
          }
        });
      }, options);

      observer.current.observe(elementRef.current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [elementRef, callback, options]);
}
