var path = require('path');
var gutil = require('gulp-util');
var flashccDataUrl = require('../index.js');
var test = require('tape');

test('should be pass through for null file', function(t) {
  t.plan(1);

  var testFilePath = path.join(__dirname, 'fixtures', 'not_found_file.js');
  var testFile = new gutil.File({
    cwd:   __dirname,
    base: path.dirname(testFilePath),
    path: testFilePath,
  });

  var stream = flashccDataUrl();

  stream.on('data', function() {
    t.ok('pass through');
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

