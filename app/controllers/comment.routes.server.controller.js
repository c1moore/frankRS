'use strict';

/**
 * Module dependencies.
 */

//Who can view social comments? Anybody
//Who can view recruiter comments? Recruiters/Admin

//Okay, but does this mean that a user can learn that an event exists that they aren't supposed to know about? No, there should be a field in the comments schema specifying which event this comment was created for.  You should require that event_id and only return comments for that event

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	Comment = mongoose.model('Comment'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

var canViewComment = function(user,hasAuthorization,comment) {
	if (comment.stream=='social') return true;
	if (hasAuthorization(user,['admin'])) return true;
	if (hasAuthorization(user,['recruiter']) && comment.stream='recruiter') return true;
	return false;
};

exports.getCommentObj = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = req.body.comment_id;
	var query = Comment.findOne({_id: id});
	var user;
	//Retrieve the comment
	query.exec(function(err,result) {
		user = result;
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No comment found!"});return;}
		else if (!canViewComment(req.user,req.hasAuthorization,result)) {
			res.status(401).json({message: "You do not have permission to view this comment"});
		} else {
			res.status(200).json(result);
		}
	});
};

exports.getSocialCommentsForEvent = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = req.body.event_id;
	var query = Comment.find({event_id: id,stream: 'social'});
	var user;
	//Retrieve the comments
	query.exec(function(err,result) {
		user = result;
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No comments found!"});
		} else {
			res.status(200).json(result);
		}
	});
};

exports.getRecruiterCommentsForEvent = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = req.body.event_id;
	var query = Comment.find({event_id: id,stream: 'recruiter'});
	var user;
	//Retrieve the comments
	query.exec(function(err,result) {
		user = result;
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No comments found!"});
		} else if (!req.hasAuthorization(user,['recruiter'])) {
			res.status(401).json({message: "You are not a recruiter"});
		} else {
			res.status(200).json(result);
		}
	});
};

