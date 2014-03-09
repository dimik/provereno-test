var net = require('net');

/**
 * TCP клиент, отслеживающий изменения в файле/папке.
 * @class
 * @name TCPFileWatcherClient
 */
var TCPFileWatcherClient = module.exports = function () {
    this._socket = this._createSocket();
    this._buf = [];
};

/**
 * @lends TCPFileWatcherClient.prototype
 */
var ptp = TCPFileWatcherClient.prototype;

/**
 * Подключиться к серверу.
 * @function
 * @name TCPFileWatcherClient.connect
 * @see http://nodejs.org/api/net.html#net_socket_connect_port_host_connectlistener
 * @returns {TCPFileWatcherClient}
 */
ptp.connect = function () {
    this._socket
        .once('connect', this._onConnect.bind(this))
        .connect.apply(this._socket, arguments);

    return this;
};

/**
 * Отключиться от сервера.
 * @function
 * @name TCPFileWatcherClient.disconnect
 * @returns {TCPFileWatcherClient}
 */
ptp.disconnect = function () {
    this._socket.end();

    return this;
};

/**
 * Закрыть клиентский сокет.
 * @function
 * @name TCPFileWatcherClient.destroy
 * @returns {TCPFileWatcherClient}
 */
ptp.destroy = function () {
    this._socket.destroy();

    return this;
};

/**
 * Обработка ответа сервера.
 * @function
 * @name TCPFileWatcherClient.process
 * @param {String} data Ответ сервера.
 */
ptp.process = function (data) {
    this._buf.push(data);

    try {
        var message = JSON.parse(this._buf.join(''));

        this._buf.length = 0;

        console.log(message);
    }
    catch (err) {}
};

/**
 * Создание клиентского сокета.
 * @function
 * @private
 * @name TCPFileWatcherClient._createSocket
 * @returns {netSocket}
 */
ptp._createSocket = function () {
    return new net.Socket();
};

/**
 * Обработчик соединения с сервером.
 * @function
 * @private
 * @name TCPFileWatcherClient._onConnect
 */
ptp._onConnect = function () {
    this._socket
        .on('data', this._onData.bind(this))
        .on('end', this._onEnd.bind(this));
};

/**
 * Обработчик получения данных от сервера.
 * @function
 * @private
 * @name TCPFileWatcherClient._onData
 * @param {Buffer} data
 */
ptp._onData = function (data) {
    this.process(data.toString());
};

/**
 * Обработчик отключения клиента от сервера.
 * @function
 * @private
 * @name TCPFileWatcherClient._onEnd
 */
ptp._onEnd = function () {
    console.log('server closed connection');
};
