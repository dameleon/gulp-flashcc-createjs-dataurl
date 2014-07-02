var path = require('path');
var gutil = require('gulp-util');
var flashccDataUrl = require('../index.js');
var test = require('tape');
var fs = require('fs');
var util = require('./lib/util.js');

test('should read assets from specified basepath', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl({
    basepath: path.join(__dirname, 'fixtures', 'ext')
  });

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a new file');
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

test('should change file name with specified json file suffix', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl({
    outputType: flashccDataUrl.OUTPUT_TYPE.JSON,
    jsonFileSuffix: '_dameleon'
  });

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a new file');
    t.equal(
      path.join(testFile.base, path.basename(testFile.path, '.js') + '_dameleon.json'),
      path.join(newFile.base,  path.basename(newFile.path)),
      'file has a path with specified suffix');
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

test('should be pass through to read target file with specified ignores', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl({
    ignores: [
      'aaa'
    ]
  });

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a new file');

    var afterManifests = util.getManifestFromFile(newFile.contents);

    for (var i = 0, iz = afterManifests.length; i < iz; i++) {
      var m = afterManifests[i];

      if (m.id === 'aaa') {
        t.ok(!/base64/.test(m.src), 'ignore targets are not converted to base64 string');
      }
    }
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

test('should be change manifest type with specified manifest type map', function(t) {
  var filePath = path.join(__dirname, 'fixtures', 'test_published.js');
  var file = fs.readFileSync(filePath);
  var testFile = new gutil.File({
    cwd:  __dirname,
    base: path.dirname(filePath),
    path: filePath,
    contents: file
  });

  var stream = flashccDataUrl({
    mimeTypeToManifestTypeMap: {
      image : 'dameleon'
    }
  });

  stream.on('data', function(newFile) {
    t.ok(newFile, 'emits a new file');

    var afterManifests = util.getManifestFromFile(newFile.contents);

    for (var i = 0, iz = afterManifests.length; i < iz; i++) {
      t.equal('dameleon', afterManifests[i].type, 'manifest type was changed to specified type');
    }
    t.end();
  });
  stream.on('error', function(e) {
    t.fail('emits error');
  });

  stream.write(testFile);
});

