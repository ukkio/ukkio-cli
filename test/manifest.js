
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var os = require('os');

var Manifest = require('../lib/utils/manifest');


describe('Manifest', function() {

	it('Should load and validate a manifest file', function(done) {
		Manifest.createFromFile(path.join(__dirname, 'ukkio.json'), function(err, manifest) {
			done(err);
		});
	});

	it('Should mantain default values', function(done) {
		var manifest = new Manifest({ name: 'Foo' });
		expect(manifest.version).to.not.be.undefined;
		expect(manifest.main).to.be.equal('');
		expect(manifest.path).to.be.equal('');
		done();
	});

});
