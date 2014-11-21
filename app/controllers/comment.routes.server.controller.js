'use strict';

/**
 * Module dependencies.
 */

//Who can view social comments? Anybody
//Who can view recruiter comments? Recruiters/Admin

//Okay, but does this mean that a user can learn that an event exists that they aren't supposed to know about? No, there should be a field in the comments schema specifying which event this comment was created for.  You should require that event_id and only return comments for that event

//CONTINUE HERE TODO COMMENT ROUTES CONTROLLERS

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	Comment = mongoose.model('Comment'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

var canViewComment = function(user,hasAuthorization,comment) {
	if (comment.stream=='social') return true;
	if (hasAuthorization(user,['admin'])) return true;
	if (hasAuthorization(user,['recruiter']) && comment.stream='recruiter' && canViewEvent(
		user,comment.event_id,hasAuthorization)) return true;
	return false;
};

var canViewEvent = function(user,eventID,hasAuthorization) {
	var statusArray = user.status;
	for (var i = 0; i<statusArray.length;i++) {
		if(statusArray[i].event_id==eventID) {
			return true;
		}
	}
	if (hasAuthorization(user,['admin'])) return true;
	return false;
};

exports.getCommentObj = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = req.body.comment_id;
	var query = Comment.findOne({_id: id});
	//Retrieve the comment
	query.exec(function(err,result) {
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
	//Retrieve the comments
	query.exec(function(err,result) {
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
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No comments found!"});
		} else if (!req.hasAuthorization(user,['recruiter'])) {
			res.status(401).json({message: "You are not a recruiter"});
		} else if (!canViewEvent(user,result.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You are not authorized to view comments of this event"});
		} else {
			res.status(200).json(result);
		}
	});
};

exports.postCommentSocial = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var comment = req.body.comment;
	var event_id = req.body.event_id;
	var query = Comment.findOne({_id: id});
	var user = req.user;
	Comment.insert({user_id: user._id,event_id: event_id,comment:comment,stream:'social'});
};

exports.postComment

exports.delete = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = req.body.comment_id;
	var query = Comment.findOne({_id: id});
	//Retrieve the comments
	query.exec(function(err,result) {
		user = result;
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No comment found!"});
		} else if (req.user._id!=result.user_id && !req.hasAuthorization(req.user,['admin'])) {
			res.status(401).json({message: "You must be the comment author or admin to delete"});
		} else {
			result.remove();
			res.status(200).json({message: "Comment removed"});
		}
	});
};

