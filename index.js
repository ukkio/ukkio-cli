
var fs = require('fs');
var path = require('path');
var promptly = require('promptly');
var program = require('commander');
var async = require('async');
var debug = require('debug')('prompt');
var colors = require('colors');

var Manifest = require('./lib/utils/manifest');
var Deploy = require('./lib').Deploy;
var Package = require('./lib').Package;
var Sandbox = require('./lib').Sandbox;


// Utils
function displayError(err) {
	if (err.toConsole) return err.toConsole();
	console.log(err.toString().error);
}

function displayWarning(warn) {
	if (warn.toConsole) return warn.toConsole();
	console.log(warn.toString().warn);
}

function getWorkingDir(dir) {
	var workingDir = dir
		? path.resolve(process.cwd(), dir) 
		: process.cwd();
	return workingDir;
}


global.CONST = {};
var MANIFEST_FILE_NAME = global.CONST.MANIFEST_FILE_NAME = 'ukkio.json';


var cli = module.exports = {};


cli.deploy = function deploy(options) {

	// 1. Read ukkio.json
	// 2. Zip game folder
	// 3. Send file to server

	var workingDir = getWorkingDir(options.dir);
	var manifestPath = path.join(workingDir, MANIFEST_FILE_NAME);

	Manifest.createFromFile(manifestPath, function (err, manifest) {
		if (err) return displayError(err);

		// Get user and password
		promptly.prompt('Username: ', function (err, user) {
			if (err) return displayError(err);
			promptly.password('Password: ', function (err, pass) {
				if (err) return displayError(err);
				// Zip workingDir
				var pkg = new Package(workingDir);
				pkg.create(function (err, zipFile, bytes) {
					if (err) return displayError(err);
					var deployOptions = {
						user: user,
						pass: pass,
						manifest: manifest,
						zipFile: zipFile
					}
					var deploy = new Deploy(deployOptions);
					deploy.exec(function (err) {
						// Free tmp resources
						fs.unlink(zipFile, function (errUnlink) {
							if (err) return displayError(err);
							if (errUnlink) return displayError(errUnlink);
							return console.log('Game successfully deployed'.info);
						});
					});	
				});
			});
		});
	});
}


cli.sandbox = function sandbox(options) {
	var workingDir = getWorkingDir(options.dir);

	var sandbox = new Sandbox({
		workingDir: workingDir,
		port: options.port,
		verbose: options.verbose
	});

	sandbox.start(function (err) {
		if (err) {
			displayError(err);
			return process.exit(1);
		}
		console.log('Sanbox started: point your browser at http://localhost:%s/', sandbox.sandboxServerPort);
	});

	sandbox.on('error', function (err) {
		displayError(err);
	});

	sandbox.on('warning', function (warn) {
		displayWarning(warn);
	});
}

// Create ukkio.json
cli.init = function init(options) {
	var workingDir = getWorkingDir(options.dir);

	var manifestPath = path.join(workingDir, MANIFEST_FILE_NAME);
	var manifest = new Manifest();

	console.log('This utility will walk you through creating a ukkio.json file.');
	console.log('It only covers the most common items, and tries to guess sane defaults.');
	console.log('');
	console.log('For more informations visit http://developer.ukk.io/doc');
	console.log('');

	// 1. Name [folder name]
	// 2. Version [0.0.0]
	// 3. Author
	// 4. Main
	// 5. Devices
	// 6. Parental control

	var tasks = [];

	// Name
	tasks.push(function (next) {
		var dirParts = workingDir.split(path.sep);
		var defaultValue = dirParts[dirParts.length - 1];
		promptly.prompt(
			'Game name [' + defaultValue + ']:', 
			{ default: defaultValue }, 
			function (err, value) {
				manifest.set('name', value);
				debug(value);
				next(err);
			});
	});

	// Version
	tasks.push(function (next) {
		var defaultValue = '0.0.0';
		promptly.prompt(
			'Version [' + defaultValue + ']:', 
			{ default: defaultValue }, 
			function (err, value) {
				manifest.set('version', value);
				debug(value);
				next(err);
			});
	});

	// Author
	tasks.push(function (next) {
		promptly.prompt(
			'Author',
			function (err, value) {
				manifest.set('author', value);
				debug(value);
				next(err);
			});
	});

	// Main script
	tasks.push(function (next) {
		promptly.prompt(
			'Main file [' + 'index.html' + ']',
			{ default: 'index.html' },
			function (err, value) {
				manifest.set('main', value);
				debug(value);
				next(err);
			});
	});

	// Desktop
	tasks.push(function (next) {
		promptly.confirm(
			'Support desktop browser? (Y,n)', 
			{ default: true },
			function (err, value) {
				manifest.addDevice('desktop');
				debug(value);
				next(err);
			});
	});

	// Tablet
	tasks.push(function (next) {
		promptly.confirm(
			'Support tablet browser? (Y,n)', 
			{ default: true },
			function (err, value) {
				manifest.addDevice('tablet');
				debug(value);
				next(err);
			});
	});

	// Mobile
	tasks.push(function (next) {
		promptly.confirm(
			'Support mobile browser? (Y,n)', 
			{ default: true },
			function (err, value) {
				manifest.addDevice('mobile');
				debug(value);
				next(err);
			});
	});

	// Parental control
	tasks.push(function (next) {
		promptly.confirm(
			'Need parental control? (y,N)', 
			{ default: false },
			function (err, value) {
				debug(value);
				next(err);
			});
	});

	async.waterfall(tasks, function (err) {
		manifest.save(path.join(workingDir, MANIFEST_FILE_NAME));
		console.log('Done!');
	});
}



