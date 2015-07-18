'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	cluster = require('cluster');

var processes = config.forks;

if(cluster.isMaster && process.env.NODE_ENV !== 'test') {
	//Fork the master.
	for(var i = 0; i < processes; i++) {
		cluster.fork();
	}

	cluster.on('disconnect', function(worker) {
		console.error("Disconnect!");
		cluster.fork();
	});
} else {
	/**
	 * Main application entry file.
	 * Please note that the order of loading is important.
	 */

	// Bootstrap db connection
	var db_opts = {};
	if(config.db_options.username && config.db_options.pwd) {
		db_opts.user = config.db_options.username;
		db_opts.pass = config.db_options.pwd;
	}
	var db = mongoose.connect(config.db, db_opts, function(err) {
		if (err) {
			console.error('\x1b[31m', 'Could not connect to MongoDB!');
			console.log(err);
		}
	});

	// Init the express application
	var expressConfig = require('./config/express');
	var app = expressConfig.initialize(db);

	app.use(function(err, req, res, next) {
	  console.error(err);
	  res.send(401).json({your_message_buddy: "Nice try, idiot."});
	});


	// Bootstrap passport config
	require('./config/passport')();

	// Start the app by listening on <port>
	expressConfig.setServer(app.listen(config.port));

	// Expose app
	exports = module.exports = app;

	// Logging initialization
	console.log('MEAN.JS application started on port ' + config.port);
}
