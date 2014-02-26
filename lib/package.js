
var fs       = require('fs');
var os       = require('os');
var walk     = require('../lib/utils/walk.js');
var archiver = require('archiver');
var tmp      = require('tmp');


module.exports = Package;


function Package(dir, toFile) {
	this.dir = dir;
	this.toFile = toFile;
}

Package.prototype.create = function create(done) {
	var self = this;

	if (!self.toFile) {
		tmp.file(function(err, path, fd) {
			if (err) throw err;
			self.toFile = path;
			self._archive(done);
		});
	}
	else {
		self._archive(done);
	}

}

Package.prototype._archive = function _archive(done) {
	var archive = archiver('zip');
	var toFile = this.toFile;
	var output = fs.createWriteStream(toFile);
	var dir = this.dir;

	archive.on('error', function(err) {
		done(err);
	});

	archive.pipe(output);

	walk(dir, function(err, files) {
		if (err) return done(err);

		var aZipName;
		files.forEach(function(aFile) {
			aZipName = aFile.replace(dir, '').slice(1);
			archive.append(fs.createReadStream(aFile), { name: aZipName });
		});

		archive.finalize(function(err, bytes) {
			if (err) return done(err);
			done(null, toFile, bytes);
		});
	});
}


