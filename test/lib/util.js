module.exports = {
    getManifestFromFile: function(file) {
        var contents = file.toString('utf8');
        var matched = /manifest\s?:\s?(\[[\s\w\d\/-{}"'.,]*?\])/m.exec(contents);

        return eval(matched[1]);
    }
};
