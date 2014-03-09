var util = require('util'),
    EventEmitter = require('events').EventEmitter;

/**
 * Класс логгера.
 * @class
 * @name Logger
 * @augments EventEmitter
 * @param options Опции логгера.
 * @param options.transport Массив транспортов.
 */
var Logger = module.exports = function (options) {
    EventEmitter.call(this);

    this._options = options || {};
    this._readyState = 0;
    this._transports = [];

    this.init();
};
util.inherits(Logger, EventEmitter);

/**
 * Будем хранить весь транспорт в поле класса.
 * @static
 * @name Logger.transports
 */
Logger.transports = {
    Console: require('./console-logger'),
    MySQL: require('./mysql-logger')
};

/**
 * @lends Logger.prototype
 */
var ptp = Logger.prototype;

/**
 * Инициализация транспорта.
 * @function
 * @name Logger.init
 * @returns {Logger}
 */
ptp.init = function () {
    (this._options.transports || [])
        .forEach(this.addTransport, this);

    return this;
};

/**
 * Добавление транспорта.
 * @function
 * @name Logger.addTransport
 * @param {Object} transport Экземпляр класса транспорта.
 */
ptp.addTransport = function (transport) {
    this._transports.push(transport);
    this._readyState += 1;
    transport.on('ready', this._onTransportReady.bind(this));
};

/**
 * Обработчик готовности транспорта.
 * @function
 * @private
 * @name Logger._onTransportReady
 */
ptp._onTransportReady = function () {
    --this._readyState || this.emit('ready');
};

/**
 * Записать в лог.
 * @function
 * @name Logger.write
 * @param {Object|String} message Сообщение или данные.
 */
ptp.write = function (message) {
    this._transports.forEach(function (transport) {
        transport.write(message);
    });
};
