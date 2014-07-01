var packageJson = require('./package.json');
var path = require('path');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');
var _ = require('lodash');
var PluginError = gutil.PluginError;

const IDENT = packageJson.name;
const MANIFEST_RE = /manifest\s?:\s?(\[[\s\w/\-{}"'.,]*?\])/m;
const MANIFEST_PREFIX = 'manifest : ';
const TYPE_REPLACE_TARGET = '%TYPE_REPLACE_TARGET%';
const MIME_TYPES = {
    'png'  : 'image/png',
    'gif'  : 'image/gif',
    'jpg'  : 'image/jpeg',
    'jpeg' : 'image/jpeg'
};
const MIMETYPE_HEADER_MANIFEST_MAP = {
    'image': 'image',
    'audio': 'sound'
};
const DEFAULT_PARAMS = {
    basepath: '',
    outputExtFile: false,
    extFileSuffix: '_manifest',
    ignores: null,
    manifestTypes: {
        image: 'createjs.LoadQueue.IMAGE',
        sound: 'createjs.LoadQueue.SOUND',
        binary: 'createjs.LoadQueue.BINARY',
    },
};

function gulpFlashCcCanvasEmbedDataUrl(option) {
    var settings = _.extend({}, DEFAULT_PARAMS, option || {});

    return through.obj(transform, flush);

    function transform(file, encoding, callback) {
        if (file.isNull()) {
            this.push(file);
            callback();
        } else if (file.isStream()) {
            this.emit('error', new PluginError(IDENT, 'Streaming not supported'));
        }
        var contents = file.contents.toString('utf8');
        var matched = MANIFEST_RE.exec(contents);

        if (!matched || matched.length < 2) {
            this.emit('error', new PluginError(IDENT, 'Manifests not found'));
        }
        var manifests = eval(matched[1]);
        var res = [];

        manifests.forEach(function(m) {
            if (_checkIgnoreId(m.id)) {
                return;
            }
            var targetFilePath = path.join(settings.basepath, m.src);

            if (!fs.existsSync(targetFilePath)) {
                this.emit('error', new PluginError(IDENT, 'Target file not found'));
            }
            var mimeType = _getMimeTypeByFilePath(targetFilePath);
            var targetFile = fs.readFileSync(targetFilePath);

            manifest.src = _generateDataUrl(targetFile, mimeType);
            manifest.type = TYPE_REPLACE_TARGET;

            var str = JSON.stringify(manifest).replace(new RegExp('"' + TYPE_REPLACE_TARGET + '"', 'gi'), _getManifestTypeByMimeType(mimeType));

            res.push(str);
        });

        res = ('[' + res.join(',') + ']');

        if (settings.outputExtFile) {
            file = new gutil.File({
                cwd: file.cwd,
                base: file.base,
                path: path.join(path.dirname(file.base), path.basename(file.base) + settings.extFileSuffix + path.extname(file.base)),
                contents = new Buffer(res);
            });
        } else {
            file.contents = new Buffer(contents.replace(MANIFEST_RE, res));
        }
        this.push(file);
    }

    function flush(callback) {
        callback();
    }

    function _getMimeTypeByFilePath(filepath) {
        var ext = path.extname(filepath);
        var mimeType = MIME_TYPES[ext.substr(1, ext.length)];

        if (!mimeType) {
            this.emit('error', new PluginError(IDENT, 'Undefined minetype from this extension: ' + ext));
        }
        return mimeType;
    }

    function _getManifestTypeByMimeType(mimeType) {
        var mimeHeader = mimeType.split('/')[0];
        var manifestTypeKey = MIMETYPE_HEADER_MANIFEST_MAP[mimeHeader] || 'binary';

        return settings.manifestType[manifestTypeKey];
    }

    function _generateDataUrl(file, mimeType) {
        return ['data:', mimeType, ';base64,' + new Buffer(file).toString('base64')].join();
    }

    function _checkIgnoreId(id) {
        if (!settings.ignores) {
            return false;
        }
        return ignore.some(function(target) {
            if (_.isString(target)) {
                target = new RegExp(target);
            }
            if (target.test(id)) {
                return true;
            }
        });
    }
}

module.exports = gulpFlashCcCanvasEmbedDataUrl;

