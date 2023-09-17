import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import {deleteAsync} from 'del';
import {stacksvg} from 'gulp-stacksvg';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({collapseWhitespace:true}))
  .pipe(gulp.dest('build'))
}

//Scripts

const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
}

//Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'))
}

//Webp

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh( {
    webp:{}
  }))
  .pipe(gulp.dest('build/img'))
}

//SVG

const svg = () => {
  return gulp.src(['source/img/*.svg', '!source/img/icon/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'))
}

export function stack () {
  return gulp.src('source/img/icon/*.svg')
    .pipe(svgo())
    .pipe(stacksvg({ output: 'sprite' }))
    .pipe(rename('stack.svg'))
    .pipe(gulp.dest('build/img'));
}

//Copy

const copy = (done) => {
  gulp.src([
  'source/fonts/**/*.{woff2,woff}',
  'source/*.ico',
  'source/manifest.webmanifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
  }

//Clean

const clean = () => {
  return deleteAsync('build');
  };

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('html', browser.reload);
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    stack,
    createWebp
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    stack,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
