'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	User = mongoose.model('User');

exports.getDisplayName = function(req, res) {
	var id = req.user._id;
	var query = User.findOne({'_id':id});
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({"message": "No display name found!"});
		} else {
			res.status(200).json({'displayName' : result.displayName});
		}
	});
};

//Get the data that will be displayed for in the leaderboard.
/*This method will need to be modified so it will only return the information related to the event the user specified.*/
exports.getLeaderboard = function(req, res) {
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : "User is not logged in."});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin"])) {
		var query = User.find({'roles' : 'recruiter'});
		query.select('displayName rank inviteeList attendeeList');
		query.populate('inviteeList.user_id', 'displayName');
		query.populate('attendeeList.user_id', 'displayName');0
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).send({message : 'No recruiters found!'});
			} else {
				res.status(200).send(result);
			}
		});
	} else {
		res.status(401).send({'message' : "User does not have permission."});
	}
};

//Get a list of events for which this user is a recruiter.
exports.getRecruiterEvents = function(req, res) {
	var id = req.user._id;
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
exports.getRecruiterAttendees = function(req, res) {
	var id = req.user._id;
	var query = User.findOne({'_id' : id});
	query.select('attendeeList');
	query.populate('attendeeList.user_id', 'displayName email');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result || !result.length) {
			res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
		} else {
			res.status(200).send(result);
		}
	});
};

//Get the list of invitees for the event specified.
/*This method will also need to be modified so it will return only the attendees for the specified event.*/
exports.getRecruiterInvitees = function(req, res) {
	var id = req.user._id;
	var query = User.findOne({'_id' : id});
	query.select('inviteeList');
	query.populate('attendeeList.user_id', 'displayName email');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result || !result.length) {
			res.status(400).json({'message' : 'User not found or the user has not invited anybody yet.'});
		} else {
			res.status(200).send(result);
		}
	});
};

//Retrieve the list of all people who are signed up to attend the event.
/*This will need to be modified so that only the event specified by the recruiter will be searched.  This can be done
easily by replacing 
	User.find({'role':'recruiter'});
with
	User.find({'role':'recruiter', 'attendeeList.event_id' : specifiedevent});*/
exports.getAttendees = function(req, res) {
	var query = User.find({'role' : 'recruiter'});
	query.select('attendeeList displayName');
	query.populate('attendeeList.user_id', 'displayName organization');
	query.exec(function(err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result || !result.length) {
			res.status(400).json({'message' : 'Nobody is attending yet.'});
		} else {
			res.status(200).send(result);
		}
	});
};

//Retrieve the list of all people who are invited to attend the specified event.
/*This will need to be modified so that only the event specified by the recruiter will be searched.  This can be done
easily by replacing 
	User.find({'role':'recruiter'});
with
	User.find({'role':'recruiter', 'inviteeList.event_id' : specifiedevent});*/
exports.getInvitees = function(req, res) {
	var query = User.find({'role' : 'recruiter'});
	query.select('inviteeList displayName');
	query.populate('inviteeList.user_id', 'displayName');
	query.exec(function (err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result || !result.length) {
			res.status(400).json({'message' : 'Nobody is attending yet.'});
		} else {
			res.status(200).send(result);
		}
	});
};

/*Send the information that will be displayed in the first tab of the leaderboard.  This
will include the recruiter's name, rank, and the number of people invited and attendding.*/
exports.getRecruiterInfo = function(req, res) {
	var id = req.user._id;
	var query = User.findOne({'_id' : id});
	query.select('fName lName rank attendeeList inviteeList');
	query.exec(function (err, result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result || !result.length) {
			res.status(400).json({'message' : 'User not found!'});
		} else {
			result.attending = result.attendeeList.length;
			result.invited = result.inviteeList.length;

			//Delete lists, no need to send them since we have the count.
			delete result.attendeeList;
			delete result.inviteeList;

			res.status(200).send(result);
		}
	});
};

