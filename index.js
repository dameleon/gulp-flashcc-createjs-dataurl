var packageJson = require('./package.json');
var path = require('path');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');
var _ = require('lodash');
var PluginError = gutil.PluginError;

const IDENT = packageJson.name;
const MANIFEST_RE = /manifest\s?:\s?(\[[\s\w\d\/-{}"'.,]*?\])/m;
const MANIFEST_PREFIX = 'manifest : ';
const TYPE_REPLACE_TARGET = '%TYPE_REPLACE_TARGET%';
const MIME_TYPES = {
    'png'  : 'image/png',
    'gif'  : 'image/gif',
    'jpg'  : 'image/jpeg',
    'jpeg' : 'image/jpeg'
};
const OUTPUT_TYPE = {
    EMBED: 'embed',
    JSON:  'json'
};
const DEFAULT_PARAMS = {
    basepath: '',
    outputType: OUTPUT_TYPE.EMBED,
    jsonFileSuffix: '_manifest',
    ignores: null,
    mimeTypeToManifestTypeMap: {
      'image'  : 'image',
      'audio'  : 'sound',
      'binary' : 'binary'
    },
};

function gulpFlashCcCanvasEmbedDataUrl(option) {
    var settings = _.extend({}, DEFAULT_PARAMS, option || {});

    return through.obj(transform);

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
            var targetFilePath = path.join(settings.basepath || file.base, m.src);

            if (!fs.existsSync(targetFilePath)) {
                this.emit('error', new PluginError(IDENT, 'Target file not found'));
            }
            var mimeType = _getMimeTypeByFilePath(targetFilePath);
            var targetFile = fs.readFileSync(targetFilePath);

            m.src = _generateDataUrl(targetFile, mimeType);
            m.type =  _getManifestTypeByMimeType(mimeType);

            res.push(m);
        }, this);

        res = JSON.stringify(res);

        if (settings.outputType === OUTPUT_TYPE.JSON) {
            file = new gutil.File({
                cwd: file.cwd,
                base: file.base,
                path: path.normalize(file.base + path.basename(file.path, '.js') + settings.jsonFileSuffix + '.json'),
                contents: new Buffer(res)
            });
        } else {
            file.contents = new Buffer(contents.replace(MANIFEST_RE, MANIFEST_PREFIX + res));
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
        var res = settings.mimeTypeToManifestTypeMap[mimeHeader];

        if (!res) {
            res = settings.mimeTypeToManifestTypeMap.binary;
        }
        return res;
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

gulpFlashCcCanvasEmbedDataUrl.OUTPUT_TYPE = OUTPUT_TYPE;

module.exports = gulpFlashCcCanvasEmbedDataUrl;

