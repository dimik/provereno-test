#!/usr/local/bin/node

var TCPFileWatcherClient = require('./lib/client'),
    client = new TCPFileWatcherClient();

client.connect(8888);

/**
 * Корректно закрываем клиент.
 */
process.on('SIGINT', function () {
    console.log('Client was closed by user');
    client.destroy();
    process.exit(0);
});
