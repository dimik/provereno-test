var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    mysql = require('mysql');

/**
 * MySQL-транспорт.
 * @class
 * @name MySQLLoggerTransport
 * @augments EventEmitter
 * @param {Object} options Опции соединения.
 * @see https://github.com/felixge/node-mysql
 */
var MySQLLoggerTransport = module.exports = function (options) {
    EventEmitter.call(this);

    this._options = options;
    this._conn = null;
    this.init();
}
util.inherits(MySQLLoggerTransport, EventEmitter);

/**
 * @lends MySQLLoggerTransport.prototype
 */
var ptp = MySQLLoggerTransport.prototype;

/**
 * Инициализация соединения с MySQL.
 * @function
 * @name MySQLLoggerTransport.init
 * @returns {MySQLLoggerTransport}
 */
ptp.init = function () {
    this._conn = mysql.createConnection(this._options);

    this._conn.connect(function (err) {
        if(err) {
            throw err;
        }
        this.emit('ready');
    });

    return this;
};

/**
 * Закрытие соединения с MySQL.
 * @function
 * @name MySQLLoggerTransport.destroy
 * @returns {MySQLLoggerTransport}
 */
ptp.destroy = function () {
    this._conn.destroy();

    return this;
};

/**
 * Запись лога в MySQL.
 * @function
 * @name MySQLLoggerTransport.log
 * @param {Object} message Данные для записи.
 * @returns {MySQLLoggerTransport}
 */
ptp.write = function (message) {
    this._conn.query('INSERT INTO ?? SET ?', [this._options.table, message], function (err, res) {
        if(err) {
            throw err;
        }
    });

    return this;
};
