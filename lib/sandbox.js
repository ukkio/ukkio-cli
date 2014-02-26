
var colors = require('colors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var e = require('./utils/error');
var Manifest = require('./utils/manifest');
var util = require('util');
var EventEmitter = require('events').EventEmitter;


var Sandbox = module.exports = function Sandbox(options) {
	this.verbose = options.verbose ? true : false;
	this.workingDir = options.workingDir;
	this.sandboxServerPort = options.port || 5005;
	this.gameServerPort = this.sandboxServerPort + 1;
	this.sandboxServer = null;
	this.gameServer = null;
	this.manifest = options.manifest || new Manifest();
};
util.inherits(Sandbox, EventEmitter);

Sandbox.prototype.start = function start(done) {
	var self = this;
	self._startSanboxServer(function(err) {
		if (err) return done(err);
		self._startGameServer(function(err) {
			if (err) return done(err);
			done();
		});
	});
};

Sandbox.prototype._startSanboxServer = function _startSanboxServer(done) {
	var self = this;
	var db = this.db;
	var sandboxServer = this.sandboxServer = express();
	sandboxServer.set('view engine', 'jade');
	sandboxServer.set('views', path.join(__dirname, '..', 'views'));
	sandboxServer.get('/', function(req, res) {
		self._loadManifest(function(err, manifest) {
			if (err && err.name == 'MANIFEST_NOT_EXISTS') return res.render('no_manifest.jade');
			if (!manifest) manifest = new Manifest(); // Default manifest
			var data = {
				gameUrl: self.getGameServerUrl(),
				manifest: manifest.toJSON()
			};
			res.render('index.jade', data);
		});
	});

	sandboxServer.get('/play', function(req, res) {
		self._loadManifest(function(err, manifest) {
			if (err && err.name != 'MANIFEST_NOT_EXISTS') return res.render('no_manifest.jade');
			if (!manifest) manifest = new Manifest(); // Default manifest
			var data = {
				gameUrl: self.getGameServerUrl(),
				manifest: manifest.toJSON()
			};
			res.render('play.jade', data);
		});
	});

	sandboxServer.use('/static', express.static(path.join(__dirname, '..', 'static')));
	sandboxServer.listen(this.sandboxServerPort);

	done();
};

Sandbox.prototype._startGameServer = function _startGameServer(done) {
	var self = this;
	var gameServer = this.gameServer = express();
	self._loadManifest(function (err, manifest) {
		if (err && err.name != 'MANIFEST_NOT_EXISTS') return done(err);
		if (!manifest) {
			manifest = new Manifest(); // Default manifest
			self.emit('warning', err);
		}
		gameServer.use(express.static(path.join(self.workingDir, manifest.get('path'))));
		gameServer.listen(self.gameServerPort);
		done();
	});
};

Sandbox.prototype.log = function log() {
	if (this.verbose)
		console.log.apply(console, arguments);
};

Sandbox.prototype.getGameServerUrl = function getGameServerUrl() {
	return 'http://localhost:' + this.gameServerPort + '/';
};

Sandbox.prototype._loadManifest = function _loadManifest(done) {
	var self = this;
	var manifestPath = path.join(this.workingDir, global.CONST.MANIFEST_FILE_NAME);
	Manifest.createFromFile(manifestPath, function(err, manifest) {
		if (err) return done(err);
		done(null, manifest);
	});
};




