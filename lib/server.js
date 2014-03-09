var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    net = require('net'),
    fs = require('fs');

/**
 * TCP сервер, отслеживающий изменения в файле/папке.
 * @class
 * @name TCPFileWatcherServer
 * @augments EventEmitter
 * @param {String} path Путь до файла/папки.
 */
var TCPFileWatcherServer = module.exports = function (path) {
    EventEmitter.call(this);

    this._server = this._createServer();
    this._watcher = this._createWatcher(path);
    this._connections = [];
};
util.inherits(TCPFileWatcherServer, EventEmitter);

/**
 * @lends TCPFileWatcherServer.prototype
 */
var ptp = TCPFileWatcherServer.prototype;

/**
 * Запуск сервера.
 * @function
 * @name TCPFileWatcherServer.start
 * @returns {TCPFileWatcherServer}
 */
ptp.start = function () {
    this._server
        .once('listening', this._onListening.bind(this))
        .listen.apply(this._server, arguments);

    return this;
};

/**
 * Выключение сервера.
 * @function
 * @name TCPFileWatcherServer.start
 * @param {Function} fn Функция обратного вызова.
 * @returns {TCPFileWatcherServer}
 */
ptp.stop = function (fn) {
    this._server
        .removeAllListeners();
    this.unwatch();
    this._connections.length = 0;
    this._server.close(fn);

    return this;
};

/**
 * Следить за файлом/папкой.
 * @function
 * @name TCPFileWatcherServer.watch
 * @param {String} path Путь до файла/папки
 * @returns {TCPFileWatcherServer}
 */
ptp.watch = function (path) {
    if(EventEmitter.listenerCount(this._watcher, 'change')) {
        this.unwatch();
    }

    if(path) {
        this._watcher.close();
        this._watcher = this._createWatcher(path);
    }

    this._watcher
        .on('change', this._onWatchedChange.bind(this));

    return this;
};

/**
 * Перестать следить за файлом/папкой.
 * @function
 * @name TCPFileWatcherServer.unwatch
 * @returns {TCPFileWatcherServer}
 */
ptp.unwatch = function () {
    this._watcher
        .removeAllListeners();

    return this;
};

/**
 * @function
 * @name TCPFileWatcherServer.getConnections
 * @returns {Number} Количество подключенных клиентов.
 */
ptp.getConnections = function () {
    return this._connections.length;
};

/**
 * Создание сервера.
 * @function
 * @private
 * @name TCPFileWatcherServer._createServer
 * @returns {net.Server} TCP-сервер
 */
ptp._createServer = function () {
    return new net.Server();
};

/**
 * Создание наблюдателя за файлом/папкой.
 * @function
 * @private
 * @name TCPFileWatcherServer._createWatcher
 * @returns {fs.Watcher}
 */
ptp._createWatcher = function (path) {
    return fs.watch(path);
};

/**
 * Обработчик готовности сервера.
 * @function
 * @private
 * @name TCPFileWatcherServer._onListening
 */
ptp._onListening = function () {
console.log("server: started on %j", this._server.address());

    this._server
        .on('connection', this._onConnection.bind(this));
    this.watch();
};

/**
 * Обработчик подключения клиента.
 * @function
 * @private
 * @name TCPFileWatcherServer._onListening
 * @param {net.Socket} socket Клиентский сокет.
 */
ptp._onConnection = function (socket) {
    var n = this._connections.push(socket);

console.log('server: %d client connected', n);

    socket.once('close', this._onSocketClose.bind(this, socket));
};

/**
 * Обработчик изменения в наблюдаемом файле/папке.
 * @function
 * @private
 * @name TCPFileWatcherServer._onWatchedChange
 * @param {String} e Тип изменений.
 * @param {String} filename Имя файла/папки.
 */
ptp._onWatchedChange = function (e, filename) {
    this.emit('watchedchange', e, filename);
    this._connections.forEach(function (conn) {
        conn.write('{');
        conn.write('"file": "' + filename + '",');
        conn.write('"changed": "' + Date.now() + '"');
        conn.write('}');
    });
};

/**
 * Обработчик закрытия клиентского сокета.
 * @function
 * @private
 * @name TCPFileWatcherServer._onSocketClose
 * @param {net.Socket} socket
 * @param {Boolean} hadError Флаг наличия ошибки.
 */
ptp._onSocketClose = function (socket, hadError) {
console.log('server: client closed connection');

    var index = this._connections.indexOf(socket);

    if(index > -1) {
        this._connections.splice(index, 0);
    }
};
