var path = require('path');
var gutil = require('gulp-util');
var flashccDataUrl = require('../index.js');
var test = require('tape');
var fs = require('fs');
var util = require('./lib/util.js');

test('should be output javascript file and it has embedded sources of base64', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl();

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a file');
    t.equal(newFile.path, testFile.path, 'file has a path');
    t.notEqual(newFile.contents, file, 'file was changed');

    var beforeManifests = util.getManifestFromFile(file);
    var afterManifests = util.getManifestFromFile(newFile.contents);

    for (var i = 0, iz = beforeManifests.length; i < iz; i++) {
      var targetFile = fs.readFileSync(path.join(path.dirname(filePath), beforeManifests[i].src));
      var newFileBase64 = afterManifests[i].src.split(',')[1];

      t.equal(new Buffer(targetFile).toString('base64'), newFileBase64, 'target file converted to base64 string');
    }
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

test('should be output json when specified output file type with "json"', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl({
    outputType: flashccDataUrl.OUTPUT_TYPE.JSON
  });

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a file');
    t.equal(
      path.join(testFile.base, path.basename(testFile.path, '.js') + '_manifest.json'),
      path.join(newFile.base,  path.basename(newFile.path)),
      'file has a path with prefix');
    t.notEqual(newFile.contents, file, 'file was changed');

    var beforeManifests = util.getManifestFromFile(file);
    var afterManifests = JSON.parse(newFile.contents);

    for (var i = 0, iz = beforeManifests.length; i < iz; i++) {
      var targetFile = fs.readFileSync(path.join(path.dirname(filePath), beforeManifests[i].src));
      var newFileBase64 = afterManifests[i].src.split(',')[1];

      t.equal(new Buffer(targetFile).toString('base64'), newFileBase64, 'target file converted to base64 string');
    }
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

