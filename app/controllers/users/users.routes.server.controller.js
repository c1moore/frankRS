'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.getDisplayName = function(req, res) {
	var id = req.session.id;
	var query = User.findOne({'_id':id});
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

//Get the data that will be displayed for in the leaderboard.
/*This method will need to be modified so it will only return the information related to the event the user specified.*/
exports.getLeaderboard = function(req, res) {
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
};

//Get a list of events for which this user is a recruiter.
exports.getRecruiterEvents = function(req, res) {
	var id = req.session.id;
	var query = User.findOne({'_id' : id, 'status.recruiter' : true});
	query.select('status');
	query.populate('status.event_id');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({message : 'User not found or is not a recruiter!'});
		} else {
			res.status(200).send(result);
		}
	});
};

//Get the list of attendees for the event specified.
/*This method will need to be modified so it will return only the attendees for the specified event.  This should be simple,
simply replace the the definition of query with the following line:
	var query = User.findOne({'_id' : id, 'attendeeList.event_id' : req.});*/
exports.getAttendees = function(req, res) {
	var id = req.session.id;
	var query = User.findOne({'_id' : id});
	query.select('attendeeList');
	query.populate('attendeeList.user_id');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({message : 'User not found or is not a recruiter!'});
		} else {
			res.status(200).send(result);
		}
	});
};
