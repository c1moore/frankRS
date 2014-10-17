'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.getDisplayName = function(req, res) {
	var id = req.body.session.id;
	var query = User.findOne({_id:id });
	var theResult;
	var theError;
	query.exec(function(err,result) {
		theResult = result;
		theError = err; });
	if (theError) {
		res.status(400).send(theError);
	} else if (!theResult) {
		res.status(400).json({displayName: "No display name found!"});
	} else {
		res.status(200).json({displayName: theResult.displayName});
	}
};


