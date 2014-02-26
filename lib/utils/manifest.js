
var path = require('path');
var fs = require('fs');
var e = require('./error');
var _ = require('underscore');

var defaults = function defaults() {
	var args = arguments;
	var result = args[0];
	for (var i = 1; i < args.length; i++) {
		if (typeof args[i] === 'object') {
			Object.keys(args[i]).forEach(function(aKey) {
				if (typeof args[i][aKey] !== 'undefined')
					result[aKey] = args[i][aKey];
			});
		}
	}
}


var Manifest = module.exports = function Manifest(data) {
	this._filePath = null;
	this.attributes = {
		name: null,
		version: null,
		author: null,
		main: 'index.html',
		path: '',
		artworks: {},
		devices: [],
		parentalControl: false
	};
}

Manifest.createFromFile = function createFromFile(manifestFilePath, done) {
	var newManifest = new Manifest();
	newManifest.load(manifestFilePath, function(err) {
		if (err) return done(err);
		done(null, newManifest);
	});
}

Manifest.prototype.set = function set(field, value) {
	if (typeof field === 'object')
		defaults(this.attributes, field);
	else
		this.attributes[field] = value;
}

Manifest.prototype.get = function get(field) {
	return this.attributes[field];
}

Manifest.prototype.load = function load(manifestFilePath, done) {
	var self = this;
	fs.exists(manifestFilePath, function(exists) {
		if (!exists) return done(e.MANIFEST_NOT_EXISTS);
		self._filePath = path.resolve(process.cwd(), manifestFilePath);
		self.set(require(manifestFilePath));
		var validate = self.validate();
		if (validate) return done(validate);
		done(null, this);
	});
	return this;
}

Manifest.prototype.save = function save(path, done) {
	var self = this;
	var manifestString = JSON.stringify(this.attributes, null, 4);
	var stream = fs.createWriteStream(path);
	stream.write(manifestString);
	stream.end();
	return this;
}

Manifest.prototype.validate = function validate() {
	if (!this.attributes.hasOwnProperty('name')) 
		return e('MISSING_PROPERTY', 'The property "name" must be specified', 'The game name is required and it will be used in the game list');
	
	if (!this.attributes.hasOwnProperty('version')) 
		return e('MISSING_PROPERTY', 'The property "version" must be specified');

	return false;
}

Manifest.prototype.isValid = function isValid() {
	return this.validate() === false;
}

Manifest.prototype.addDevice = function addDevice(device) {
	this.attributes.devices.push(device);
	return this;
}

Manifest.prototype._resolve = function _resolve(resolvePath) {
	if (this.path)
		return path.join(this.path, resolvePath);
	return resolvePath;
}

Manifest.prototype.toJSON = function toJSON() {
	return _.clone(this.attributes);
}




