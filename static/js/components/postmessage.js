;(function(){

// Console wrapper
if (typeof console === 'undefined') {
	var f = function () {};
    window.console = {
        log:f, info:f, warn:f, debug:f, error:f
    };
}

// Helper function inspired by Backbone to trigger an event function quickly
var triggerEvents = function(events, args) {
	var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
		switch (args.length) {
		case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
		case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
		case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
		case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
		default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
	}
}

var PostMessage = function PostMessage(options) {
	this.initialize(options);
}

// options = {
//   target: window.parent or iframe.contentWindow
//   origin: Host of your application
//   destination: Host where the message are sent (Ex. http://example.com)
// }
PostMessage.prototype.initialize = function initialize(options) {
	if (!options.target)
		return console.error('You have to specify the target options to post a message.');
	if (!options.origin)
		return console.error('You have to specify the origin options for security reasons.');
	if (!options.destination)
		return console.error('You have to specify the destination options for security reasons.');

	var self = this;
	self._events = [];
	self._callbacks = {};
	self._callbackCounter = 0;
	self.options = options;

	self._target = options.target;
	delete options['target'];

	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

	self._messageEventHandler = function() {
		self._messageHandler.apply(self, arguments);
	};
	eventer(messageEvent, self._messageEventHandler, false);
}

PostMessage.prototype._messageHandler = function _messageHandler(message) {
	// console.log('Raw message ' + this.options.name, message);

	if (message.origin !== this.options.destination)
		return console.warn('Message coming from a different origin: ' + message.origin + ' => ' + this.options.destination);

	var type = message.data.type;
	var data = message.data.data;
	var callbackId = message.data.callbackId;

	if (!type)
		return console.warn('Unknown message type');

	switch (type) {

		case 'callback':
			if (!callbackId)
				return console.warn('No callbackId provided on callback message');
			if (!this._callbacks[callbackId])
				return console.warn('Cannot find a callback with ID ' + callbackId);

			var callback = this._callbacks[callbackId];
			delete this._callbacks[callbackId];
			callback(data);
			break;

		default:
			if (callbackId && data !== undefined)
				this.trigger(type, data, this._createCallbackFunction(callbackId));
			else if (callbackId)
				this.trigger(type, this._createCallbackFunction(callbackId));
			else if (data !== undefined)
				this.trigger(type, data);
			else
				this.trigger(type);
	}
}

PostMessage.prototype._createCallbackFunction = function _createCallbackFunction(callbackId) {
	var self = this;
	return function (data) {
		var newMessage = {
			type: 'callback',
			data: data,
			callbackId: callbackId
		}
		self._target.postMessage(newMessage, self.options.destination);
	}
}

PostMessage.prototype.emit = function emit(type, data, callback) {
	if (typeof data === 'function') {
		callback = data;
		data = undefined;
	}

	if (typeof callback === 'function') {
		var callbackId = ++this._callbackCounter;
		this._callbacks[callbackId] = callback;
	}

	var newMessage = {
		type: type,
		data: data,
		callbackId: callbackId
	}

	this._target.postMessage(newMessage, this.options.destination);
}

PostMessage.prototype.on = function on(name, callback, context) {
	if (!callback) return this;
	var events = this._events[name] || (this._events[name] = []);
	events.push({ callback: callback, context: context, ctx: context || this });
	return this;
}

PostMessage.prototype.trigger = function trigger(name) {
	if (!this._events) return this;
	var args = [].slice.call(arguments, 1);
	var events = this._events[name];
	if (events) triggerEvents(events, args);
	return this;
}

PostMessage.prototype.destroy = function destroy() {
	var eventMethod = window.removeEventListener ? "removeEventListener" : "detachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "detachEvent" ? "onmessage" : "message";
	eventer(messageEvent, this._messageEventHandler, false);
}

if (typeof exports == 'object') {
	exports = module.exports = PostMessage;
} else if (typeof define == 'function' && define.amd) {
	define(function(){ return PostMessage; });
} else {
	window['PostMessage'] = PostMessage;
}


})();