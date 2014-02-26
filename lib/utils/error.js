
var colors = require('colors');
var util = require('util');

module.exports = createError;

function createError(name, message, details, link) {
	var newError = new Error(message);
	newError.name = name;
	newError.details = details || '';
	newError.link = link || '';
	newError.toConsole = function() {
		console.log(this.message.error);
		if (this.details) console.log(this.details.help);
		if (this.link) console.log('See also: %s'.help, this.link);
	}
	return newError;
}

createError.MANIFEST_NOT_EXISTS = createError(
	'MANIFEST_NOT_EXISTS',
	'ukkio.json does not exists in the working directory',
	'Use \'ukkio init\' to create one',
	'http://developer.ukk.io/doc#ukkio-init'
);

createError.NOT_FOUND = createError(
	'NOT_FOUND',
	'Resources not found'
);


