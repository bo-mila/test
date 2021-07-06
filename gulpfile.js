const { src, dest, task, series, watch, parallel} = require("gulp");
const rm = require( 'gulp-rm' );
const sass = require('gulp-sass');
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');

const env = process.env.NODE_ENV;

const {SRC_PATH, DIST_PATH} = require('./gulp.config');

sass.compiler = require('node-sass');

const style = [
  `${SRC_PATH}/css/_misc/normalize.scss`,
  `${SRC_PATH}/css/_misc/media.scss`,
  `${SRC_PATH}/css/_misc/fonts.scss`,
  `${SRC_PATH}/css/_misc/mixins.scss`,
  `${SRC_PATH}/css/_misc/layout.scss`,
  `${SRC_PATH}/css/main.scss`
];

const libs = [
  // ...JS_LIBS,
  // "!src/js/particles.js",
  "src/js/**/*.js"
];

task( 'clean', () => {
  console.log(env);
  return src( `${DIST_PATH}/**/*`, { read: false })
    .pipe( rm() );
});

task('copy:html', () => {
  return src(`${SRC_PATH}/*.html`)
    .pipe(dest(DIST_PATH))
    .pipe(reload({stream: true}));
});

// task('copy:json', () => {
//   return src(`${SRC_PATH}/assets/*.json`)
//     .pipe(dest(`${DIST_PATH}/assets`))
//     .pipe(reload({stream: true}));
// });
// task('copy:imgPlanets', () => {
//   return src(`${SRC_PATH}/assets/*.png`)
//     .pipe(dest(`${DIST_PATH}/assets`))
//     .pipe(reload({stream: true}));
// });

task('copy:img', () => {
  return src(`${SRC_PATH}/img/**/*`)
    .pipe(dest(`${DIST_PATH}/img`))
    .pipe(reload({stream: true}));
});

task('copy:fonts', () => {
  return src(`${SRC_PATH}/fonts/**/*`)
    .pipe(dest(`${DIST_PATH}/fonts`))
    .pipe(reload({stream: true}));
});

// task('copy:video', () => {
//   return src(`${SRC_PATH}/video/**/*`)
//     .pipe(dest(`${DIST_PATH}/video`))
//     .pipe(reload({stream: true}));
// });
// task('copy:fonts', () => {
//   return src(`${SRC_PATH}/fonts/**/*`)
//     .pipe(dest(`${DIST_PATH}/fonts`))
//     .pipe(reload({stream: true}));
// });

task('styles', () => {
  return src(style)
    .pipe(gulpif(env === "dev", sourcemaps.init()))
    .pipe(concat("main.min.scss"))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(env === "dev", autoprefixer({
      cascade: false
    })))
    .pipe(gulpif(env === "prod", gcmq()))
    .pipe(gulpif(env === "prod", cleanCSS()))
    .pipe(gulpif(env === "dev", sourcemaps.write()))
    .pipe(dest(`${DIST_PATH}/css/css`))
    .pipe(reload({stream: true}));
});

task('script', () => {
  return src(libs)
  .pipe(gulpif(env === "dev", sourcemaps.init()))
  .pipe(concat("main.min.js", {newLine: ";"}))
  .pipe(gulpif(env === "prod", babel({
    presets: ['@babel/env']
  })))
  .pipe(gulpif(env === "prod", uglify()))
  .pipe(gulpif(env === "dev", sourcemaps.write()))
  .pipe(dest(`${DIST_PATH}/js`))
  .pipe(reload({stream: true}));
});

task('server', () => {
  browserSync.init({
    server: {
      baseDir: DIST_PATH
    },
    open: false
  });
});

task('watch', () => {
  watch(`${SRC_PATH}/css/**/*.scss`, series('styles'));
  watch(`${SRC_PATH}/*.html`, series('copy:html'));
  watch(`${SRC_PATH}/js/*.js`, series('script'));
  // watch(`${SRC_PATH}/js/*.js`, series('script:particles'));
  // watch(`${SRC_PATH}/assets/*.json`, series('copy:json'));
});

task('default', series('clean', parallel('copy:html',  'copy:img', 'copy:fonts',  'styles', 'script'),
  parallel('watch', 'server')));

task('build', series('clean', parallel('copy:html',  'copy:img', 'copy:fonts', 'styles', 'script')));