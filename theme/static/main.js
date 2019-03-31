import './scripts/slideout-nav';

const mapCanvas = document.getElementById('map-canvas');
const contribootMount = document.querySelector('.mount');

if (mapCanvas) {
  import('./scripts/mapbox').then(({ mapBox }) => mapBox(mapCanvas));
}

if (contribootMount) {
  import('./scripts/jsunconf.contriboot').then(() => {});
}
