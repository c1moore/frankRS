'use strict';

var images = require('../../app/controllers/images');

module.exports = function(app) {
	app.route('/image/logo').get(images.sendImage);	
};