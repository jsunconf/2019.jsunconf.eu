const Bundler = require('parcel-bundler');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Metalsmith = require('metalsmith');
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');
const metadata = require('metalsmith-metadata');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const stylus = require('metalsmith-stylus');
const assets = require( 'metalsmith-assets-improved' );

const devMode = process.argv.includes('--serve');

const whenDev = (plugin, options = {}) => {
  if (devMode) {
    return plugin(options);
  }
  return () => {};
};

const md5 = (str, len = 8) =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .slice(0, len);

const netlifyUrlPrefix = process.env.REVIEW_ID
  ? `deploy-preview-${process.env.REVIEW_ID}--`
  : '';
const netlifyUrl = `https://${netlifyUrlPrefix}amazing-hodgkin-d968dc.netlify.com`;
const cdnHost = devMode ? '' : netlifyUrl;
const parcelEntry = path.join(__dirname, 'theme', 'scripts', 'main.js');
const parcelOptions = {
  outDir: './dist/scripts',
  outFile: 'main.js',
  publicUrl: `${cdnHost}/`,
  watch: devMode,
  cache: true,
  cacheDir: '.cache',
  contentHash: true,
  minify: !devMode,
  logLevel: 3,
  hmr: false,
  detailedReport: false,
};

const parcelPlugin = ({ entry, options, dev }) => {
  let initialized = null;

  const plugin = (_, __, done) => {
    if (initialized) {
      done();
      return;
    }
    initialized = true;

    const bundler = new Bundler(entry, options);
    bundler.bundle();

    if (dev) {
      setImmediate(done);
    } else {
      bundler.on('buildEnd', done);
    }
  };

  return plugin;
};

const fingerprintMainJsPlugin = ({ dev }) => (_, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  let newFileUri = 'scripts/main.js';

  if (!dev) {
    const dir = path.join(__dirname, 'dist', 'scripts');
    const filePath = path.join(dir, 'main.js');
    const mainJs = fs.readFileSync(filePath, 'utf8');
    const hash = md5(mainJs);
    const filename = `main.${hash}.js`;
    const mapFilename = `${filename}.map`;
    const newFilePath = path.join(dir, filename);
    newFileUri = `scripts/${filename}`;

    fs.writeFileSync(
      newFilePath,
      mainJs.replace('main.js.map', mapFilename),
      'utf8'
    );
    fs.writeFileSync(
      path.join(dir, mapFilename),
      fs.readFileSync(path.join(dir, 'main.js.map'), 'utf8'),
      'utf8'
    );
  }

  metalsmith.metadata({
    ...metadata,
    mainJs: `${cdnHost}/${newFileUri}`,
  });
  done();
};

Metalsmith(__dirname)
  .use(
    whenDev(serve, {
      http_error_files: {
        404: '/404/index.html',
      },
    })
  )
  .use(
    whenDev(watch, {
      paths: {
        '${source}/**/*.md': true,
        '${source}/**/*.yaml': '**/*',
        '${source}/**/*.js': '**/*',
        'theme/**/*': '**/*',
      },
      livereload: true,
    })
  )
  .metadata({
    title: 'JSUnconf 2019',
    description: 'The Unconference that started it all.',
    cdnHost,
    devMode,
  })
  .source('./content')
  .destination('./dist')
  .clean(true)
  .use(
    metadata({
      sponsors: 'sponsors.yaml',
    })
  )
  .use(markdown())
  .use(
    permalinks({
      pattern: ':url',
    })
  )
  .use(
    stylus({
      compress: !devMode,
      paths: ['theme/styles'],
    })
  )
  .use(
    parcelPlugin({
      entry: parcelEntry,
      options: parcelOptions,
      dev: devMode,
    })
  )
  .use(
    assets({
      src: './theme/assets',
      dest: './',
    })
  )
  .use(
    fingerprintMainJsPlugin({
      dev: devMode,
    })
  )
  .use(
    layouts({
      pattern: '**/*.html',
      default: 'index.pug',
      directory: 'theme/jade',
    })
  )
  .build(function(err) {
    if (err) throw err;
  });
