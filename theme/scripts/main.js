import './modules/slideout-nav';

const mapCanvas = document.getElementById('map-canvas');
const contribootMount = document.querySelector('.mount');

if (mapCanvas) {
  import('./modules/mapbox').then(({ mapBox }) => mapBox(mapCanvas));
}

if (contribootMount) {
  import('./modules/contriboot/jsunconf.contriboot').then(() => {});
}
