import './scripts/slideout-nav';

const mapCanvas = document.getElementById('map-canvas');
const contribootMount = document.querySelector('.mount');

if (mapCanvas) {
  import('./scripts/mapbox').then(({ mapBox }) => mapBox(mapCanvas));
}

if (contribootMount) {
  Promise.all([
    import('./scripts/contriboot/jsunconf.contriboot.css'),
    import('./scripts/contriboot/jsunconf.contriboot'),
  ]).then(
    () => {},
    (err) => {
      // Suppress the error that states, that the CSS could not
      // be loaded, which is simply not true. o_O
      if (
        !err.message.startsWith('Cannot find module') &&
        !err.message.endsWith(`.css'`)
      ) {
        console.error(err);
      }
    }
  );
}
