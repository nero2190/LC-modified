const { src, dest, watch, task, series, parallel } = require("gulp");
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const pug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minifyCSS = require('gulp-csso')
const sourcemaps = require('gulp-sourcemaps')
const browserify = require('browserify')
const tsify = require('tsify')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const del = require('del')


const siteDirectory = '';

const paths = {
  src      : 'dev_src/',
  srcSass  : 'dev_src/scss/',
  srcPug   : 'dev_src/pug/',
  srcJs    : 'dev_src/js/',
  srcTs    : './dev_src/ts/',
  srcFileDir: 'dev_src/files/',
  srcFile  : 'dev_src/files/**/*.+(gif|svg|jpg|png|js|json|csv|pdf|ics|zip|eot|ttf|otf|woff|doc|woff2|mp4)',
  dist     : 'dist/' + siteDirectory,
  distCss  : 'dist/assets/' + siteDirectory + 'css/',
  distJs  : 'dist/assets/' + siteDirectory + 'js/'
};

const htmlPug = () => {
  return src(paths.srcPug + '**/[^_]*.pug')
    .pipe(plumber({errorHandler: notify.onError({
        message: "<%= error.message %>",
        title: "Template compilation"
      })}))
    .pipe(pug({
      basedir: paths.srcPug,
      pretty: true
    }))
    .pipe(dest(paths.dist))
    .pipe(browserSync.stream())
}
htmlPug['displayName'] = 'pug';
exports['pug']= htmlPug;

const cssSass = () => {
  return src(paths.srcSass + '**/*.scss')
    .pipe(plumber({errorHandler: notify.onError({
        message: "<%= error.message %>",
        title: "CSS preprocessing"
      })}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer({grid: true})]))
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.distCss))
    .pipe(browserSync.stream({match: '**/*.css'}))
}
cssSass['displayName'] = 'scss';
exports['scss'] = cssSass;

const jsTypescript = () => {
  return browserify({
      basedir: '.',
      debug: true,
      entries: [paths.srcTs + 'common.ts'],
      cache: {},
      packageCache: {}
    })
    .plugin(tsify)
    .on('error', notify.onError({
      message: "<%= error.message %>",
      title: "TypeScript"
    }))
    .bundle()
    .on('error', notify.onError({
      message: "<%= error.message %>",
      title: "TypeScript"
    }))
    .pipe(source('common.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.distJs))
    .pipe(browserSync.stream({match: '**/*.js'}))
}
jsTypescript['displayName'] = 'ts';
exports['ts'] = jsTypescript;

const jsLib = () => {
  return src([
      paths.srcJs + 'lib/*.js'
  ])
    .pipe(plumber({errorHandler: notify.onError({
      message: "<%= error.message %>",
      title: "CSS preprocessing"
    })}))
    .pipe(uglify())
    .pipe(concat('lib.js'))
    .pipe(dest(paths.distJs));
}
jsLib['displayName'] = 'js:lib';
exports['js:lib'] = jsLib;

const fileCopy = () => {
  return src(paths.srcFile)
    .pipe(dest(paths.dist))
}
fileCopy['displayName'] = 'file:copy';
exports['file:copy'] = fileCopy;

const cleanDist =  (done) => {
  del(paths.dist + '**/*')
  done()
};
cleanDist['displayName'] = 'clean';
exports['clean'] = cleanDist;

const browserSyncReload = (done) => {
  browserSync.reload()
  done()
}
browserSyncReload['displayName'] = 'reload';
exports['reload'] = browserSyncReload;

const serve = (done) => {

  browserSync.init({
    server: {
      baseDir: paths.dist,
      middleware: function (req, res, next) {
        if (/\/$|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
          console.log('[POST => GET] : ' + req.url);
          req.method = 'GET';
        }
        next();
      }
    },
    open: false,
    port: 3000,
    reloadOnRestart: true
  })

  watch(paths.srcSass + '**/*.scss').on('change', series(cssSass, browserSyncReload))
  watch(paths.srcJs + '**/*.js').on('change', series(jsLib, browserSyncReload))
  watch(paths.srcTs + '**/*.ts').on('change', series(jsTypescript, browserSyncReload))
  watch(paths.srcPug + '**/*.pug').on('change', series(htmlPug, browserSyncReload))
  watch(paths.srcFile).on('change', series(fileCopy, browserSyncReload))

  done()
}
exports['serve'] = serve;

const build = series(
  cleanDist,
  jsTypescript, 
  jsLib,
  cssSass,
  htmlPug,
  fileCopy
);
exports['build'] = build;

exports.default = series(build, serve);