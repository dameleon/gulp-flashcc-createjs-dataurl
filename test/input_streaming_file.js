var path = require('path');
var gutil = require('gulp-util');
var flashccDataUrl = require('../index.js');
var test = require('tape');
var Readable = require('stream').Readable;

test('should be emit error for stream file', function(t) {
  t.plan(2);

  var testFilePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var testFileStream = new Readable();
  var testFile = new gutil.File({
    cwd:   __dirname,
    base: path.dirname(testFilePath),
    path: testFilePath,
  });

  testFileStream._read = function() {
    this.push('dameleon');
    this.push(null);
  }
  testFile.contents = testFileStream;

  var stream = flashccDataUrl();

  stream.on('data', function() {
    t.fail('pass through');
  });
  stream.on('error', function(e) {
    t.equal(e.plugin, 'gulp-flashcc-createjs-dataurl', 'Error is from gulp-flashcc-createjs-dataurl');
    t.equal(e.message, 'Streaming not supported', 'Error has message');
  });

  stream.write(testFile);
});

