import { addElem } from './util';

const hasIntersectionObserver =
  'IntersectionObserver' in window &&
  'IntersectionObserverEntry' in window &&
  'intersectionRatio' in window.IntersectionObserverEntry.prototype;
const intersectionObserverPolyfill =
  'https://cdn.jsdelivr.net/npm/intersection-observer@0.5.1/intersection-observer.min.js';

export const loadPolyfills = (callback) => {
  if (hasIntersectionObserver) {
    return callback();
  }

  addElem('script', {
    src: intersectionObserverPolyfill,
    onload: callback,
    onerror: callback,
  });
};
