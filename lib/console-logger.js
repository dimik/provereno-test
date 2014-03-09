var util = require('util'),
    EventEmitter = require('events').EventEmitter;

/**
 * Консольный транспорт логгера.
 * @class
 * @name ConsoleLoggerTransport
 * @augments EventEmitter
 * @param {Object} options Опции транспорта.
 */
var ConsoleLoggerTransport = module.exports = function (options) {
    EventEmitter.call(this);

    this._options = options;
    this.init();
};
util.inherits(ConsoleLoggerTransport, EventEmitter);

/**
 * @lends ConsoleLoggerTransport.prototype
 */
var ptp = ConsoleLoggerTransport.prototype;

/**
 * Здесь нечего инициализировать. Просто кидаем событие.
 * @function
 * @name ConsoleLoggerTransport.init
 * @returns {ConsoleLoggerTransport}
 */
ptp.init = function () {
    process.nextTick(function () {
        this.emit('ready');
    }.bind(this));

    return this;
};

/**
 * @function
 * @name ConsoleLoggerTransport.write
 * @param {Object|String} message Данные для записи в лог.
 * @returns {ConsoleLoggerTransport}
 */
ptp.write = function (message) {
    console.log(util.inspect(message, { depth: null }));

    return this;
};
