var gulp = require('gulp');
var flashccDataUrl = require('./index.js');

gulp.task('test', function() {
  gulp.src('./test/fixtures/test_published.js')
    .pipe(flashccDataUrl({
        outputType: flashccDataUrl.OUTPUT_TYPE.JSON
    }))
    .pipe(gulp.dest('test/tmp/'))
});
