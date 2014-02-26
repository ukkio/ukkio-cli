
var crypto     = require('crypto');
var https      = require('https');
var moment     = require('moment');
var formidable = require('formidable');
var fs         = require('fs');
var util       = require('util');
var path       = require('path');
var expect     = require('chai').expect;

var Deploy     = require('../lib').Deploy; 


// Settings
var serverPort = 5543;

// Utils
function createSSLServer(callback) {
	// Mock web server with https
	var options = {
		key: fs.readFileSync(__dirname + '/cert/key.pem'),
		cert: fs.readFileSync(__dirname + '/cert/cert.pem')
	};

	https.createServer(options, callback).listen(serverPort);
}
function parseAuthHeader(auth) {
	auth = auth.replace('Basic ', '');
	var buffer = new Buffer(auth, 'Base64');
	var userAndPassword = buffer.toString('utf8').split(':');
	return {
		user: userAndPassword[0],
		pass: userAndPassword[1]
	}
}


describe('Deploy', function() {

	it('Should deploy a new game', function(done) {
		// Istanza il server
		createSSLServer(function(req, res) {
			if (req.method == 'POST' && req.url == '/deploy') {
				// Auth check
				expect(req.headers.authorization).to.not.be.null;
				var auth = parseAuthHeader(req.headers.authorization);
				expect(auth.user).to.be.equal('foo');
				expect(auth.pass).to.be.equal('bar');
				// File check
				var form = new formidable.IncomingForm();
				form.parse(req, function(err, fields, files) {
					if (err) return done(err);
					// Manifest check
					expect(fields.manifest).to.not.be.undefined;
					var manifest = (new Buffer(fields.manifest, 'Base64')).toString('utf8');
					try { manifest = JSON.parse(manifest); }
					catch (e) { return done(new Error('Error parsing manifest JSON')); }
					expect(manifest).to.be.an('object');
					// File check
					expect(files.file).to.not.be.undefined;
					expect(files.file.size).to.be.equal(257);
					// Response
					res.writeHead(200, {'content-type': 'application/json'});
					res.write(JSON.stringify({ success: true }));
					res.end();
				});
			}
		});

		var options = {
			user: 'foo',
			pass: 'bar',
			manifest: { ukkio: 'foo' },
			zipFile: path.join(__dirname, 'sample.zip'),
			host: 'https://localhost:' + serverPort + '/'
		}

		var deploy = new Deploy(options);
		deploy.exec(function(err) {
			done(err);
		});
	});

});

