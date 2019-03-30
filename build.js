const Metalsmith = require('metalsmith');
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');
const metadata = require('metalsmith-metadata');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const stylus = require('metalsmith-stylus');
const assets = require('metalsmith-assets');

const devMode = process.argv.includes('--serve');

const noOp = () => {};

const whenDev = (plugin, options = {}) => {
  if (devMode) {
    return plugin(options);
  }
  return noOp;
};

const netlifyUrlPrefix = process.env.REVIEW_ID
  ? `deploy-preview-${process.env.REVIEW_ID}--`
  : '';
const netlifyUrl = `https://${netlifyUrlPrefix}amazing-hodgkin-d968dc.netlify.com`;
const cdnHost = devMode ? '' : netlifyUrl;

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
        '${source}/**/*': true,
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
    layouts({
      pattern: '**/*.html',
      default: 'index.pug',
      directory: 'theme/jade',
    })
  )
  .use(
    stylus({
      compress: !devMode,
      paths: ['theme/styles'],
    })
  )
  .use(
    assets({
      source: './theme/assets',
      destination: './',
    })
  )
  .build(function(err) {
    if (err) throw err;
  });
