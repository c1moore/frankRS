'use strict';

//Yes, this should probably go in routes, but I'm lazy

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.getDisplayName = function(req, res) {
	var id = req.body.session.id;
	var query = User.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({displayName: "No display name found!"});
		} else {
			res.status(200).json({displayName : result.displayName});
		}
	});
};
