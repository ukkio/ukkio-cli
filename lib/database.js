
var Datastore = require('nedb');
var fs = require('fs');
var path = require('path');


function getUserDBFolder() {
	return path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.ukkio');
}


var Database = module.exports = function Database() {
	this.folder = getUserDBFolder();
}

Database.prototype.loadDatabase = function loadDatabase(done) {
	var self = this;
	fs.exists(this.folder, function(exists) {
		if (!exists) {
			fs.mkdir(this.folder, 0755, function(err) {
				if (err) return done(err);
				self._loadCollections(this.folder, done);
			});
		}
		else
			self._loadCollections(done);
	});
}

Database.prototype._loadCollections = function _loadCollections(done) {
	this.collections = {
		users: new Datastore({ filename: path.join(this.folder, 'ukkio_sandbox_users.db'), autoload: true }),
		games: new Datastore({ filename: path.join(this.folder, 'ukkio_sandbox_games.db'), autoload: true }),
		matches: new Datastore({ filename: path.join(this.folder, 'ukkio_sandbox_matches.db'), autoload: true })
	};	
	done();
}

Database.prototype.realod = function reload() {
	var collections = this.collections;
	Object.keys(collections).forEach(function(aKey) {
		collections[aKey].loadDatabase();
	});
}

