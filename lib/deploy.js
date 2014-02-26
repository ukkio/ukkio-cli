
var request = require('request');
var url = require('url');
var fs = require('fs');
var util = require('util');


module.exports = Deploy;


function Deploy(options) {
	this.username = options.username || options.user || null;
	this.password = options.password || options.pass || null;
	this.manifest = options.manifest || null;
	this.zipFile  = options.zipFile || null;
	this.host     = options.host || 'https://dev.ukk.io/';
};


Deploy.prototype.exec = function exec(done) {
	var self = this;
	var uri  = self.host + 'deploy';
	var file = this.zipFile;

	if (!this.username) return done(new Error('Username not specified'));
	if (!this.password) return done(new Error('Password not specified'));
	if (!this.manifest) return done(new Error('Manifest not specified'));
	if (!this.zipFile)  return done(new Error('Zip file not specified'));

	var options = {
		uri: uri,
		strictSSL: false,
		method: 'POST',
		auth: {
			user: self.username,
			pass: self.password,
			sendImmediatly: false
		}
	};

	var self = this;
	fs.stat(file, function(err, stats) {
		if (err) return done(err);

		var r = request.post(options, function(err, res, body) {
			if (err) return done(err);
			try {
				body = JSON.parse(body);
				done(null, body);
			}
			catch (e) {
				return done(e);
			}
		});

		var form = r.form();
		form.append('manifest', new Buffer(JSON.stringify(self.manifest)).toString('base64'));
		form.append('file', fs.createReadStream(file));
	});
}



