
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var os = require('os');

var Package = require('../lib').Package;


describe('Package', function() {

	it('Should package a directory', function(done) {
		var dir = path.join(__dirname, 'test_game');
		var toFile = path.join(os.tmpdir(), '__test_package.zip');
		var pkg = new Package(dir, toFile);
		pkg.create(function(err, bytes) {
			if (err) return done(err);
			expect(fs.existsSync(toFile)).to.be.true;
			done();
		});
	});

});
