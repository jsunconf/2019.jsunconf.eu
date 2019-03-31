const Bundler = require('parcel-bundler');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');
const Metalsmith = require('metalsmith');
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');
const metadata = require('metalsmith-metadata');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const assets = require('metalsmith-assets-improved');

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
const parcelJsEntry = path.join(__dirname, 'theme', 'static', 'main.js');
const parcelCssEntry = path.join(__dirname, 'theme', 'static', 'main.styl');
const parcelOptions = {
  outDir: './dist/static',
  cacheDir: '.cache',
  publicUrl: `${cdnHost}/static`,
  watch: devMode,
  cache: true,
  contentHash: true,
  minify: !devMode,
  logLevel: 0,
  hmr: false,
  detailedReport: false,
};

/**
 * Creates an instance of the parcel bundler for compiling Javascript & Stylus. Supports watch-mode.
 *
 * @param {Object} opts
 * @param {string|string[]} opts.entry - path(s) of the entry file(s)
 * @param {Object} opts.options - the parcel options object (https://parceljs.org/api.html)
 * @param {boolean} opts.dev - Whether the scripts currently runs in dev-mode
 */
const parcel = ({ entry, options, dev }) => {
  const prefix = chalk.magenta('[parcel]');
  const log = (str) => dev && console.log(prefix, str);
  let initialized = null;

  const plugin = (_, __, done) => {
    if (initialized) {
      done();
      return;
    }
    initialized = true;

    const bundler = new Bundler(entry, options);
    bundler.bundle();
    log(`Bundling...`);
    bundler.on('buildEnd', () => log('Bundle is ready.'));
    bundler.on('buildError', (err) => log(`Error: ${err.message}`));

    if (dev) {
      done();
    } else {
      bundler.on('bundled', () => done());
    }
  };

  return plugin;
};

/**
 * Creates a MD5 contenthash for a given file
 * and includes it into the filename.
 *
 * @param {Object} opts
 * @param {string} opts.src - path of the relative to the ./dist folder
 * @param {string} opts.identifier - name of the property that is used to store the resulting file
 *                                   path on the metadata object for use in the template.
 * @param {boolean} opts.dev - Whether the scripts currently runs in dev-mode
 */
const fingerprint = (opts) => (_, metalsmith, done) => {
  const { src, identifier, dev } = opts;
  const metadata = metalsmith.metadata();
  const fileBasename = path.basename(src);
  const dest = path.dirname(src);
  let newFileUri = src;

  if (!dev) {
    const dist = path.join(__dirname, 'dist');
    const filePath = path.join(dist, src);
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = md5(content);
    const filename = fileBasename.replace(/\.([^.]+)$/, `.${hash}.$1`);
    const mapFilename = `${filename}.map`;
    const newFilePath = path.join(dist, dest, filename);
    newFileUri = path.join(dest, filename);

    fs.writeFileSync(
      newFilePath,
      content.replace(`${fileBasename}.map`, mapFilename),
      'utf8'
    );
    fs.writeFileSync(
      path.join(dist, dest, mapFilename),
      fs.readFileSync(`${filePath}.map`, 'utf8'),
      'utf8'
    );
    fs.unlinkSync(filePath);
    fs.unlinkSync(`${filePath}.map`);
  }

  metalsmith.metadata({
    ...metadata,
    [identifier]: `${cdnHost}/${newFileUri}`,
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
        '${source}/**/*.yaml': `**/*`,
        'theme/**/*': `**/*`,
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
    parcel({
      entry: [parcelJsEntry, parcelCssEntry],
      options: parcelOptions,
      dev: devMode,
    })
  )
  .use(
    assets({
      src: './theme/images',
      dest: './images',
    })
  )
  .use(
    fingerprint({
      src: 'static/main.js',
      identifier: 'mainJs',
      dev: devMode,
    })
  )
  .use(
    fingerprint({
      src: 'static/main.css',
      identifier: 'mainCss',
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
