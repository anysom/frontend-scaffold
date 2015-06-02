gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var notify = require('gulp-notify'); //when on Windows 7 it falls back to Growl, so this should be installed for best experience.
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var fs = require('fs');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var styleguide = require('sc5-styleguide');
var eslint = require('gulp-eslint');


/********************************************************/
/* Settings and helper functions */
var settings = {
    localhost:          '',
    baseDir:            'my website/',
    scriptsDir:         'scripts/',
    siteScriptsFolder:  'site/',
    mainSassFile:       'main.scss',
    stylesDir:          'css/'
};

settings = function initializeSettings() {
    settings.scriptsDir = settings.baseDir + settings.scriptsDir;
    settings.siteScriptsDir = settings.scriptsDir + settings.siteScriptsFolder;
    settings.stylesDir = settings.baseDir + settings.stylesDir;

    return settings;
}();

function handleError(error) {
    console.log('test', error.toString());
    gulp.src('').pipe(notify(error));
    this.emit('end');
}

function readJSONFile(path) {
    var file = fs.readFileSync(path, 'utf8');
    var str = file.toString();
    while (str.charCodeAt(0) == 65279) {
        str = str.substr(1);
    }
    return JSON.parse(str);
}


/********************************************************/
/* Sub Tasks */

gulp.task('browser-sync', function() {
    /*There are two ways to setup BrowserSync. Either Proxy-mode or Server-mode.
      Proxy-mode is for the case where your website is already hosted, in the IIS for instance.
      The Server-mode is when you are working with static html files, and you need browserSync to
      start a server for you.
    */

    //Proxy Mode
    //This mode alo requires that you paste a snippet of javascript to you html files that you want
    //synced with BrowserSync.
    /*browserSync({
        proxy: settings.localhost
    });*/

    //Server mode
    browserSync({
        server: {
            baseDir: settings.baseDir
        }
    });
});


gulp.task('views-updated', function() {
    console.log('running: views-updated');
    gulp.src(settings.baseDir+'**/*.html')
        .pipe(reload({stream:true}))
        .pipe(notify('Views updated'));
});


//__________________JAVASCRIPT______________________//
gulp.task('js', ['javscript:vendor', 'javascript:main']);

gulp.task('javascript:main', function() {
    console.log('running: javascript-updated');
    var mapJSON = readJSONFile(settings.scriptsDir+'map.json');
    console.log('mapJson', mapJSON);

    gulp.src(mapJSON)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        /*.pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .on('error', handleError)*/
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        //.pipe(ngAnnotate()) /*include this line only if using angular*/
        .on('error', handleError)
        .pipe(uglify({ mangle: true }))
        .pipe(sourcemaps.write({sourceRoot: './site'}))
        .pipe(gulp.dest(settings.scriptsDir))
        .pipe(reload({stream:true}))
});


//I split up my vendor JS into a seperate task, since there is not need that
//all the vendor code should be checked by jshint every time i change something
//in my own javascript.
gulp.task('javscript:vendor', function() {
    var mapJSON = readJSONFile(settings.scriptsDir+'libs-map.json');

    //I don't obfuscate the libs, since i expect them to be already
    //But in the case that they are not,

    gulp.src(mapJSON)
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest(settings.scriptsDir))
        .pipe(reload({ stream: true }))
});


//__________________STYLESHEETS______________________//
gulp.task('sass', function () {
    gulp.src(settings.stylesDir+settings.mainSassFile)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', handleError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .on('error', handleError)
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(settings.stylesDir))
        .pipe(reload({stream: true}));
});


//__________________STYLEGUIDE______________________//
var styleguideTmpPath = '/styleguide';
var scssWild = settings.stylesDir + '/**/*.scss';
var scssRoot = settings.stylesDir + '/main.scss';


gulp.task('styleguide:generate', function() {
  return gulp.src(scssWild)
    .pipe(styleguide.generate({
        title: 'My First Development Styleguide',
        server: true,
        rootPath: styleguideTmpPath//,
        //overviewPath: overviewPath
      }))
    .pipe(gulp.dest(styleguideTmpPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src(scssRoot)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(styleguideTmpPath));
});

gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

/********************************************************/
/* Gulp Tasks */

gulp.task('distribute', ['browser-sync'], function() {
});


gulp.task('default', ['js','sass','browser-sync','styleguide'], function() {
    console.log('default Gulp task started');

    //gulp.watch(settings.baseDir+'**/*.html', ['views:updated']);
    gulp.watch(settings.siteScriptsDir+'**/*.js', ['javascript:main']);
    gulp.watch(settings.scriptsDir+'map.json', ['javascript:main']);
    gulp.watch(settings.scriptsDir+'libs-map.json', ['javascript:vendor']);
    gulp.watch(settings.stylesDir+'**/*.scss', ['sass', 'styleguide']);
});
