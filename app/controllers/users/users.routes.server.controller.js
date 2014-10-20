'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/*exports.getDisplayName = function(req, res) {
	var id = req.session.id;
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

exports.getLeaderboard = function(req, res) {
	var id = req.session.id;
	var query = User.find({'role' : 'recruiter'});
	query.select('displayName rank inviteeList attendeeList');
	query.populate('inviteeList.user_id', 'displayName');
	query.populate('attendeeList.user_id', 'displayName');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({message : 'No recruiters found!'});
		} else {
			res.status(200).send(result);
		}
	});
};*/
