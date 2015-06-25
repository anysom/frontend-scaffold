gulp = require('gulp');
var browserSync = require('browser-sync');
var styleguide = require('sc5-styleguide');
var fs = require('fs');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var notify = require('gulp-notify'); //when on Windows 7 it falls back to Growl, so this should be installed for best experience.

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');

var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var preprocessor = null;



/********************************************************/
/* NOTES */
/*
    -It seems that JS sourcemaps are not loaded by the browser initially
    when Gulp is started and it opens the browser. It has to be refreshed first.

    -Writing the source maps can give an 'EPERM, operation not permitted' error, if the user hasn't got write rights to the folder
*/


/********************************************************/
/* Settings */
var settings = {
    localhost:          '',
    baseDir:            'my website/',
    scriptsDir:         'scripts/',
    siteScriptsFolder:  'site/',
    mainStyleFile:      'main',
    stylesDir:          'styles/',
    componentsDir:      'components/',
    projectName:        'My test project',
    styleguideDir:      'styleguide',
    preprocesser:       'sass'
};



/********************************************************/
/* Helper functions */
settings = function initializeSettings() {
    //convert directories to absolute paths
    settings.scriptsDir = settings.baseDir + settings.scriptsDir;
    settings.siteScriptsDir = settings.scriptsDir + settings.siteScriptsFolder;
    settings.stylesDir = settings.baseDir + settings.stylesDir;
    settings.componentsDir = settings.baseDir + settings.componentsDir;
    settings.styleguideDir = settings.baseDir + settings.styleguideDir;

    //set preprocessor settings
    if (settings.preprocesser === 'sass') {
      preprocessor = sass;
      settings.preprocesserExtension = 'scss';
    } else if (settings.preprocesser === 'less') {
      preprocessor = less;
      settings.preprocesserExtension = 'less';
    }
    settings.mainStyleFile = settings.mainStyleFile + '.' + settings.preprocesserExtension;

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

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


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
gulp.task('js', ['javascript:vendor', 'javascript:main']);

gulp.task('javascript:main', function() {
    console.log('running: javascript-updated');
    var mapJSON = readJSONFile(settings.scriptsDir+'map.json');
    console.log('mapJson', mapJSON);

    //delete old sourcemaps folder
    //deleteFolderRecursive(settings.scriptsDir + '/sourcemaps/');

    gulp.src(mapJSON)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .on('error', handleError)
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        //.pipe(ngAnnotate()) //include this line only if using angular
        .on('error', handleError)
        .pipe(uglify({ mangle: false }))
        //.pipe(sourcemaps.write('./sourcemaps/'+ Date.now() + '/'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(settings.scriptsDir))
        .pipe(reload({stream:true}))
});


//I split up my vendor JS into a seperate task, since there is no need that
//all the vendor code should be checked by my linting tools every time i change something
//in my own javascript.
gulp.task('javascript:vendor', function() {
    var mapJSON = readJSONFile(settings.scriptsDir+'libs-map.json');

    //I don't obfuscate the libs, since i expect them to be already
    gulp.src(mapJSON)
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest(settings.scriptsDir))
        .pipe(reload({ stream: true }))
});


//__________________STYLESHEETS______________________//
gulp.task('style-build', function () {
    gulp.src(settings.stylesDir + settings.mainStyleFile)
        .pipe(preprocessor())
        .on('error', handleError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .on('error', handleError)
        .pipe(minifyCSS())
        .pipe(styleguide.applyStyles())
        .pipe(gulp.dest(settings.styleguideDir))
        .on('error', handleError)
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(settings.stylesDir))
        .pipe(reload({stream: true}));
});


//__________________STYLEGUIDE______________________//

//this task only initializes the styleguide. During the style-build task the styleguide is updated with components and styles.
gulp.task('styleguide', function() {
  return gulp.src(settings.stylesDir + '/**/*.' + settings.preprocesserExtension)
    .pipe(styleguide.generate({
        title: settings.projectName + ' Styleguide',
        commonClass: ['sgwa-body'],
        server: true,
        rootPath: settings.styleguideDir,
        port: 5000
      }))
    .on('error', handleError)
    .pipe(gulp.dest(settings.styleguideDir));
});

/********************************************************/
/* Gulp Tasks */

gulp.task('default', ['js','style-build','browser-sync','styleguide'], function() {
    console.log('default Gulp task started');

    //gulp.watch(settings.baseDir+'**/*.html', ['views:updated']);
    gulp.watch(settings.siteScriptsDir+'**/*.js', ['javascript:main']);
    gulp.watch(settings.scriptsDir+'map.json', ['javascript:main']);
    gulp.watch(settings.scriptsDir+'libs-map.json', ['javascript:vendor']);
    gulp.watch(settings.stylesDir+'**/*.'  + settings.preprocesserExtension, ['style-build', 'styleguide']);
});
