'use strict';

var preview = require('../../app/controllers/preview');

module.exports = function(app) {
	app.route('/preview/invitation').get(preview.getPreviewTemplate);	
};