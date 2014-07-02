gulp-flashcc-createjs-dataurl  [![Build Status](https://secure.travis-ci.org/dameleon/gulp-flashcc-createjs-dataurl.png?branch=master)](http://travis-ci.org/dameleon/gulp-flashcc-createjs-dataurl)
=============================

Converted to DataURL, the images of manifest in output from Flash CC for CreateJS.


## Getting Started
This plugin requires [Gulp](http://gulpjs.com/)

```shell
npm install --save-dev gulp-flashcc-createjs-dataurl
```

## Examples

#### Replace manifests by converted base64 assets 

```javascript
var gulp = require('gulp');
var flashccCreatejsDataurl = require('gulp-flashcc-createjs-dataurl');


gulp.task('convert_cjs_assets', function() {
    gulp.src('path/to/cjs/files/*.js')    
        .pipe(flashccCreatejsDataurl())
        .pipe(gulp.dest('output/dir'));
});
```

#### Create manifests.json from CreateJS files

```javascript
var gulp = require('gulp');
var flashccCreatejsDataurl = require('gulp-flashcc-createjs-dataurl');

gulp.task('create_cjs_manifests', function() {
    gulp.src('path/to/cjs/files/*.js')    
        .pipe(flashccCreatejsDataurl({
            outputType: 'json' // or flashccCreatejsDataurl.OUTPUT_TYPE.JSON    
            // jsonFileSuffix: '_manifest' // if you want to change output file suffix name, specify this option.
        }))
        .pipe(gulp.dest('output/dir'));
});
```

## Release History

- 0.0.0: initial release.
