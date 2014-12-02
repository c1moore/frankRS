'use strict';

/**
 * Module dependencies.
 */

//What follows is a discussion with Calvin on the intentions of these schema

//Who can view social comments? Anybody
//Who can view recruiter comments? Recruiters/Admin

//Okay, but does this mean that a user can learn that an event exists that they aren't supposed to know about? No, there should be a field in the comments schema specifying which event this comment was created for.  You should require that event_id and only return comments for that event

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	Comment = mongoose.model('Comment'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	fs = require('fs'),
	path = require('path');

//Full check to see if comment is visible to the user, but requires the comment
var canViewComment = function(user,hasAuthorization,comment) {
	if (comment.stream=='social') return true;
	if (hasAuthorization(user,['admin'])) return true;
	if (hasAuthorization(user,['recruiter']) && comment.stream=='recruiter' && isRecruitEvent(
		user,comment.event_id,hasAuthorization)) return true;
	return false;
};

//Check if it's possible that the user can view the comment
var canViewEvent = function(user,eventID,hasAuthorization) {
	var statusArray = user.status;
	for (var i = 0; i<statusArray.length;i++) {
		if(statusArray[i].event_id.toString()==eventID.toString()) {
			return true;
		}
	}
	if (hasAuthorization(user,['admin'])) return true;
	return false;
};

//Check if the recruiter is actively recruiting for the event
var isRecruitEvent = function(user,eventID,hasAuthorization) {
	var statusArray = user.status;
	for (var i = 0; i<statusArray.length;i++) {
		if(statusArray[i].event_id.toString()==eventID.toString() && statusArray[i].recruiter==true) {
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
	var id = mongoose.Types.ObjectId(req.body.comment_id);
	var body = Comment.findOne({_id: id});
	//Retrieve the comment
	body.exec(function(err,result) {
		if (err) {res.status(400).send(err);return;}
		else if (!result) {
			res.status(400).json({message: "No comment with that id"});
		} else if (!canViewComment(req.user,req.hasAuthorization,result)) {
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
	if(req.body.event_id == undefined) {
		return res.status(400).send({message : "Event not specified."});
	}
	var id = mongoose.Types.ObjectId(req.body.event_id);
	var body = Comment.find({event_id: id,stream: 'social'});
	//Retrieve the comments, any authenticated user may view the social stream
	//Hopefully, this won't encode the cursor itselt. At least I hope not...
	//	will have to test this
	body.exec(function(err,result) {
		if (err) {res.status(400).send(err);return;}
		else if (!result) {res.status(400).json({message: "No comments found!"});
		} else {
			res.status(200).json(result);
		}
	});
};

/**
* Returns all comments that will be displayed on the leaderboard for a
* particular event.  Only recruiters and admin should see these comments.
*/
exports.getRecruiterCommentsForEvent = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		return res.status(401).json({message: "You are not logged in"});
	} else 	if(req.body.event_id == undefined) {
		return res.status(400).send({message : "Event not specified."});
	} else {
		var id = mongoose.Types.ObjectId(req.body.event_id);
		var body = Comment.find({event_id: id, stream: 'recruiter'});
		body.populate('user_id displayName -_id');
		//Retrieve the comments
		body.exec(function(err,result) {
			if (err) {
				return res.status(400).send({message : err});
			} else if(!result.length) {
				return res.status(400).json({message: "No comments found!"});
			} else if(!req.hasAuthorization(req.user,['recruiter','admin'])) {
				return res.status(401).json({message: "User does not have permission."});
			} else if(!canViewEvent(req.user, id, req.hasAuthorization) || !isRecruitEvent(req.user, id, req.hasAuthorization)) {
				res.status(401).json({message: "You are not authorized to view the comments of this event"});
			} else {
				res.status(200).json(result);
			}
		});
	}
};

exports.postCommentSocial = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	//Any authenticated user can post comments
	//Technically, it's possible for a user to post comments to events they cannot view, but
	//	such a user should not have known the eventID. And we can ban them if they insist
	//	on spamming--we already confer some limited trust in our users to not pollute the
	//	public discourse in any case, and spamming seems to be the only way in which this
	//	could be abused
	var comment = req.body.comment;
	var event_id = mongoose.Types.ObjectId(req.body.event_id);
	var body = Comment.findOne({_id: id});
	var interests = req.body.interests;
	var user = req.user;
	var newComment = new Comment({user_id: user._id,event_id: event_id,comment:comment,stream:'social',
				interests:interests});
	newComment.save(function(err) {
		if (err) {
			res.send(400).json(err);
		} else {
			res.send(200).json({comment_id: newComment._id});
		}
	});
};

exports.postCommentRecruiter = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var comment = req.body.comment;
	var event_id = mongoose.Types.ObjectId(req.body.event_id);
	var user = req.user;
	var interests = req.body.interests;
	var commentObj = {user_id: user._id,event_id: event_id,comment:comment,stream:'social',
		interests:interests};
	if (!canViewComment(user,req.hasAuthorization,commentObj)) {
		req.status(401).json({message: 'You do not have permissions to post that comment'});
	} else {
		var newComment = new Comment(commentObj);
		newComment.save(function(err) {
			if (err) {
				res.send(400).json(err);
			} else {
				res.send(200).json({comment_id: newComment._id});
			}
		});
	}
};

exports.delete = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = mongoose.Types.ObjectId(req.body.comment_id);
	var body = Comment.findOne({_id: id});
	//Retrieve the comments
	body.exec(function(err,result) {
		if (err) {res.status(400).send(err);return;}
		else if (!result) {res.status(400).json({message: "No comment found!"});
		} else if (req.user._id!=result.user_id && !req.hasAuthorization(req.user,['admin'])) {
			res.status(401).json({message: "You must be the comment author or admin to delete"});
		} else {
			result.remove();
			res.status(200).json({message: "Comment removed"});
		}
	});
};

exports.searchByInterests = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "You are not logged in"});
		return;
	}
	var id = mongoose.Types.ObjectId(req.body.event_id);
	var interest = req.body.interest;
	if (!canViewEvent(req.user,id,req.hasAuthorization)) {
		res.status(401).send({message: "You do not have permission to perform this search"});
		return;
	}
	var body = Comment.find({event_id: id,interest: interest});
	//Retrieve the comments, any authenticated user may view the social stream
	//Hopefully, this won't encode the cursor itself. At least I hope not...
	//	will have to test this
	body.exec(function(err,result) {
		if (err) {res.status(400).send(err);return;}
		else if (!result) {res.status(400).json({message: "No comments found!"});
		} else {
			res.status(200).json(result);
		}
	});
};

/**
* This controller is save images that are uploaded by recruiters on the leaderboard
* comment stream to a file on our server.
*/
exports.uploadRecruiterCommentImage = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.file || !req.body.event_id) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.hasAuthorization(req.user, ['admin', 'recruiter'])) {
		return res.status(401).send({message : "User does not have permission."});
	} else if(!canViewEvent(req.user, req.body.event_id, req.hasAuthorization) || !isRecruitEvent(req.user, req.body.event_id, req.hasAuthorization)) {
		res.status(401).json({message: "You are not authorized to view the comments of this event"});
	} else {
		var path = path.normalize(__dirname + "../../public/img/recruiter");
		console.log(req.files.file);

	}
};