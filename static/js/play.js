;(function(window, $, _){

// Object cache
var $window = $(window);
var serverData = window.serverData;

var STATUS_NONE = 0;
var STATUS_RUNNING = 1;
var STATUS_PAUSED = 2;
var STATUS_OVER = 3;

var STORAGE = 'ukkio';

var PlayView = function PlayView(options) {
	this.verbose = false;
	this.el = $('<div>').addClass('playGame');
	this.$el = $(this.el);
	// Resize
	$window.resize(_.bind(this.changeViewport, this));
	// Game
	this._iframe = $('<iframe>')
		.addClass('game')
		.attr('src', options.gameUrl);
	this._iframe.on('load', _.bind(this.gameLoaded, this));
};

PlayView.prototype.log = function log() {
	var args = [].splice.call(arguments, 0);
	args.unshift('Ukkio:');
	if (this.verbose)
		console.info.apply(console, args);
}

PlayView.prototype.warn = function warn() {
	var args = [].splice.call(arguments, 0);
	args.unshift('Ukkio:');
	console.warn.apply(console, args);
}

PlayView.prototype.render = function render() {
	this.$el.empty();
	this.changeViewport();
	this.$el.append(this._iframe);
	this._iframe.focus();
	return this;
};

PlayView.prototype.changeViewport = function changeViewport() {
	var viewport = {
		width: $window.width(),
		height: $window.height()
	};
	this._iframe.css({
		width: viewport.width,
		height: viewport.height
	})
	.attr('width', viewport.width)
	.attr('height', viewport.height);

	if (this._postMessage)
		this._postMessage.emit('changeViewport', viewport);
};

PlayView.prototype.gameLoaded = function gameLoaded() {
	this._postMessage = new PostMessage({
		name: 'server',
		target: this._iframe.get(0).contentWindow,
		origin: window.location.protocol + '//' + window.location.host,
		destination: window.location.protocol + '//' + window.location.hostname + ':' + (parseInt(window.location.port) + 1)
	});

	this._postMessage.on('ready', this.onReady, this);
	this._postMessage.on('insertCoin', this.onInsertCoin, this);
	this._postMessage.on('saveSession', this.onSaveSession, this);
	this._postMessage.on('loadSession', this.onLoadSession, this);
	this._postMessage.on('gameOver', this.onGameOver, this);
	this._postMessage.on('saveStorage', this.onSaveStorage, this);
	this._postMessage.on('loadStorage', this.onLoadStorage, this);
	this._postMessage.on('active', this.onGameActiveChange, this);
	this._postMessage.on('exit', this.onExit, this);
};

PlayView.prototype.onReady = function onReady(settings) {
	var settings = settings || {};
	var defaultUser = {
		username: 'gamedeveloper',
		coins: 100,
		locale: 'en',
		timezone: '2'
	};

	this.gameStatus = STATUS_NONE;
	this.session    = settings.session || this.session || null;
	this.user       = settings.user || {};
	this.verbose    = settings.verbose || false;
	_.defaults(this.user, defaultUser);

	try {
		var storage = settings.storage || JSON.parse(window.localStorage.getItem(STORAGE));
	}
	catch (e) {
		throw new Error('Cannot parse stored data in the local storage');
	}

	var newGameData = {
		mode: !this.session ? 'new' : 'resume',
		user: this.user,
		session: this.session,
		storage: storage
	};

	this._postMessage.emit('newGame', newGameData);
};

PlayView.prototype.onInsertCoin = function onInsertCoin(fn) {
	// Game already active, cannot use another coin
	if (this.gameStatus == STATUS_RUNNING
		|| this.gameStatus == STATUS_PAUSED) {
		this.warn('Cannot use a coin while a game is already running. Call gameover() to end a game section');
		return fn('failure');
	}

	this.user.coins--;
	if (this.user.coins >= 0) {
		this.gameStatus = STATUS_RUNNING;
		this.log('Insert coin. Credits(' + this.user.coins + ')');
		return fn('success');
	}
	else {
		this.user.coins = 0;
		this.warn('Not enough coin');
		return fn('failure');
	}
};

PlayView.prototype.onSaveSession = function onSaveSession(data, fn) {
	this.log('Save session: ', data);
	this.session = data;
	if (typeof fn === 'function') fn();
};

PlayView.prototype.onLoadSession = function onLoadSession(fn) {
	this.log('Load session: ', data);
	fn(this.session);
};

PlayView.prototype.onSaveStorage = function onSaveStorage(data, fn) {
	window.localStorage.setItem(STORAGE, JSON.stringify(data));
	this.log('Save storage: ', data);
	if (typeof fn === 'function') fn();
};

PlayView.prototype.onLoadStorage = function onLoadStorage(fn) {
	var data = window.localStorage.getItem(STORAGE);
	try {
		data = JSON.parse(data);
	}
	catch (e) {
		throw new Error('Cannot parse stored data in the local storage');
	}

	this.log('Load storage:', data);
	fn(data);
};

PlayView.prototype.onGameOver = function onGameOver(fn) {
	this.log('Game over');
	this.gameStatus = STATUS_OVER;
	this.session = null;
	if (typeof fn === 'function') fn();
};

PlayView.prototype.onExit = function onExit() {
	this.log('Exit game');
	setTimeout(function() {
		this.location.href = '/';
	}, 1000);
}

PlayView.prototype.onGameActiveChange = function onGameActiveChange(active) {
	if (active)
		this.unpause();
	else
		this.pause();
};

PlayView.prototype.pause = function pause() {
	var self = this;
	if (self.gameStatus != STATUS_OVER && self.gameStatus != STATUS_NONE) {
		self.gameStatus = STATUS_PAUSED;
	}
	self._postMessage.emit('pause', function (session) {
		self.log('Game paused', session);
		self.session = session;
	});
};

PlayView.prototype.unpause = function unpause() {
	var self = this;
	if (self.gameStatus != STATUS_OVER && self.gameStatus != STATUS_NONE) {
		self.gameStatus = STATUS_RUNNING;
	}
	self.log('Game unpaused', self.session);
	self._postMessage.emit('unpause', self.session);
};

// Instance
var options = {
	gameUrl: serverData.gameUrl
};
var playView = window.playView = new PlayView(options);
playView.$el.appendTo('body');
playView.render();


})(window, jQuery, _);