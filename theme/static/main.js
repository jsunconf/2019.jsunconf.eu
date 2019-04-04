import { loadPolyfills } from './scripts/polyfills';
import './scripts/slideout-nav';

const init = () => {
  const mapCanvas = document.getElementById('map-canvas');
  const contribootMount = document.querySelector('.mount');
  const lazyLoadElements = document.querySelectorAll('[data-lazyload-class]');

  if (lazyLoadElements.length) {
    import('./scripts/lazy-load-elements').then(({ lazyLoad }) =>
      lazyLoad(lazyLoadElements)
    );
  }

  if (mapCanvas) {
    import('./scripts/mapbox').then(({ mapBox }) => mapBox(mapCanvas));
  }

  if (contribootMount) {
    import('./scripts/jsunconf.contriboot').then(() => {});
  }
};

loadPolyfills(init);
