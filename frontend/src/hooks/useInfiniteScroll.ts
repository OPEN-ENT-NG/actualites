import { RefObject, useEffect } from 'react';

export function useInfiniteScroll({
  elementRef,
  callback,
  options,
}: {
  elementRef: RefObject<HTMLElement>;
  callback: () => Promise<void>;
  options?: IntersectionObserverInit;
}) {
  useEffect(() => {
    if (elementRef?.current) {
      const observer = new IntersectionObserver((entries) => {
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

      observer.observe(elementRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [elementRef?.current]);
}
