#!/usr/local/bin/node

var path = require('path'),
    fs = require('fs'),
    argv = process.argv,
    filepath = argv[2];

if(filepath) {
    filepath = path.normalize(filepath);
}
else {
    console.log('Usage: "%s _path_to_file_or_folder_"', path.basename(argv[1]));
    process.exit(1);
}


/**
 * Проверяем наличие файла/папки по указанному пути.
 */
fs.stat(filepath, function (err, stats) {
    if(err || !(stats.isFile() || stats.isDirectory())) {
        console.log('File or folder "%s" was not found', filepath);
        process.exit(1);
    }

    var TCPFileWatcherServer = require('./lib/server'),
        server = new TCPFileWatcherServer(filepath);
        ServerLogger = require('./lib/logger'),
        // Создаем экземпляр логгера с нужным транспортом (MySQL)
        logger = new ServerLogger({
            transports: [
                // new ServerLogger.transports.Console()
                new ServerLogger.transports.MySQL({
                    database: 'test',
                    table: 'file_log'
                })
            ]
        });

    server.start(8888);

    /**
     * При изменениях в отслеживаемом файле/папке пишем в лог.
     */
    server.on('watchedchange', function (e, filename) {
        logger.write({
            file_name: filename,
            change_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
    });

    /**
     * Корректно завершаем работу серера.
     */
    process.on('SIGINT', function () {
        console.log('Server was closed by user');
        server.stop(function () {
            process.exit(0);
        });
    });
});
