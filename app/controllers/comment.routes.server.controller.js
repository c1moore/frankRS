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
	path = require('path'),
	formidable = require('formidable');

//Full check to see if comment is visible to the user, but requires the comment
var canViewComment = function(user,hasAuthorization,comment) {
	if (comment.stream=='social') return true;
	if (hasAuthorization(user,['admin'])) return true;
	if (hasAuthorization(user,['recruiter']) && comment.stream=='recruiter' && isRecruitEvent(user,comment.event_id,hasAuthorization)) return true;
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
		res.status(401).json({message: "User is not logged in."});
		return;
	}
	if(!req.body.comment_id) {
		return res.status(400).send({message : "All required fields not specified."});
	}
	var id = mongoose.Types.ObjectId(req.body.comment_id);
	var query = Comment.findOne({_id: id});
	//Retrieve the comment
	query.exec(function(err,result) {
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
		return res.status(401).send({message: "User is not logged in."});
	}
	if(!req.body.event_id) {
		return res.status(400).send({message : "Event not specified."});
	}
	if(!canViewEvent(req.user, req.body.event_id, req.hasAuthorization)) {
		return res.status(401).send({message : "User does not have permission."});
	}
	var id = mongoose.Types.ObjectId(req.body.event_id);
	var query = Comment.find({event_id: id,stream: 'social'});
	query.populate('user_id', 'displayName -_id');
	//Retrieve the comments, any authenticated user may view the social stream
	//Hopefully, this won't encode the cursor itselt. At least I hope not...
	//	will have to test this
	query.exec(function(err,result) {
		if (err) {
			return res.status(400).send({message : err});
		} else if(!result.length) {
			return res.status(400).send({message: "No comments found!"});
		} else {
			return res.status(200).send(result);
		}
	});
};

/**
* Returns all comments that will be displayed on the leaderboard for a
* particular event.  Only recruiters and admin should see these comments.
*/
exports.getRecruiterCommentsForEvent = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		return res.status(401).json({message: "User is not logged in."});
	} else 	if(!req.body.event_id) {
		return res.status(400).send({message : "Event not specified."});
	} else {
		var id = mongoose.Types.ObjectId(req.body.event_id);
		var query = Comment.find({event_id: id, stream: 'recruiter'});
		query.populate('user_id', 'displayName -_id');
		//Retrieve the comments
		query.exec(function(err,result) {
			if (err) {
				return res.status(400).send({message : err});
			} else if(!result.length) {
				return res.status(400).json({message: "No comments found!"});
			} else if(!req.hasAuthorization(req.user,['recruiter','admin'])) {
				return res.status(401).json({message: "User does not have permission."});
			} else if(!canViewEvent(req.user, id, req.hasAuthorization) || !isRecruitEvent(req.user, id, req.hasAuthorization)) {
				res.status(401).json({message: "User does not have permission."});
			} else {
				res.status(200).json(result);
			}
		});
	}
};

exports.postCommentSocial = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		return res.status(401).json({message: "User is not logged in."});
	}
	if(!req.body.comment || !req.body.event_id) {
		return res.status(400).send({message : "Required field not specified."});
	}
	//Any authenticated user can post comments
	//Technically, it's possible for a user to post comments to events they cannot view, but
	//	such a user should not have known the eventID. And we can ban them if they insist
	//	on spamming--we already confer some limited trust in our users to not pollute the
	//	public discourse in any case, and spamming seems to be the only way in which this
	//	could be abused
	var comment = req.body.comment;
	var event_id = mongoose.Types.ObjectId(req.body.event_id);
	var user = req.user;

	if(req.body.interests) {
		var interests = req.body.interests;
		var newComment = new Comment({user_id: user._id,event_id: event_id,comment:comment,stream:'social',interests:interests});
	} else {
		var newComment = new Comment({user_id: user._id,event_id: event_id,comment:comment,stream:'social'});
	}

	newComment.save(function(err) {
		if (err) {
			return res.status(400).json({message : err});
		} else {
			return res.status(200).json({comment_id: newComment._id});
		}
	});
};

exports.postCommentRecruiter = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		return res.status(401).send({message: "User is not logged in."});
	}

	if(!req.body.comment || !req.body.event_id) {
		return res.status(400).send({message : "All required fields were not specified."});
	}

	var comment = req.body.comment;
	var event_id = mongoose.Types.ObjectId(req.body.event_id);
	var user = req.user;
	var commentObj = {user_id: new mongoose.Types.ObjectId(user._id), event_id: new mongoose.Types.ObjectId(event_id), comment: comment, stream:'recruiter'};

	if (!canViewComment(user,req.hasAuthorization,commentObj)) {
		return res.status(401).send({message: 'You do not have permission to write comments to this event.'});
	} else {
		var newComment = new Comment(commentObj);
		newComment.save(function(err) {
			if (err) {
				return res.status(400).send({message : err});
			} else {
				return res.status(200).send({comment_id: newComment._id});
			}
		});
	}
};

exports.delete = function(req, res) {
	if(!req.isAuthenticated()) { //Check if the user is authenticated
		return res.status(401).json({message: "User is not logged in."});
	} else if(!req.body.comment_id) {
		return res.status(400).send({message : "Missing required fields."});
	}
	
	var id = mongoose.Types.ObjectId(req.body.comment_id);
	var query = Comment.findOne({_id: id});
	//Retrieve the comments
	query.exec(function(err,result) {
		if (err) {res.status(400).send(err);return;}
		else if (!result) {res.status(400).send({message: "No comment found!"});
		} else if (req.user._id!=result.user_id && !req.hasAuthorization(req.user,['admin'])) {
			res.status(401).send({message: "You do not have permission to delete this comment (only admins and authors can delete comments)."});
		} else {
			result.remove(function(err) {
				if(err) {
					return res.status(400).send({message : err});
				} else {
					res.status(200).send({message: "Comment removed"});
				}
			});
		}
	});
};

exports.searchByInterests = function(req, res) {
	if (!req.isAuthenticated()) { //Check if the user is authenticated
		res.status(401).json({message: "User is not logged in."});
		return;
	}
	if(!req.body.event_id || req.body.interest) {
		return res.status(400).send({message : "All required fields not specified."});
	}
	
	var id = mongoose.Types.ObjectId(req.body.event_id);
	var interest = req.body.interest;
	if (!canViewEvent(req.user,id,req.hasAuthorization)) {
		res.status(401).send({message: "User does not have permission."});
		return;
	}
	var query = Comment.find({event_id: id,interest: interest});
	//Retrieve the comments, any authenticated user may view the social stream
	//Hopefully, this won't encode the cursor itself. At least I hope not...
	//	will have to test this
	query.exec(function(err,result) {
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
	var basePath = path.normalize(__dirname + "../../../public/img/recruiter/");
	if(!fs.existsSync(basePath)) {
		fs.mkdirSync(basePath, 766);
	}
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ['admin', 'recruiter'])) {
		return res.status(401).send({message : "You do not have permission to write comments to this event."});
	} else {
		var form = new formidable.IncomingForm({
			keepExtensions : true,
			uploadDir : basePath
		});

		form.on('error', function(err) {
			return res.status(400).send({message : err});
		});

		form.parse(req, function(err, fields, files) {
			if(!fields.event_id || !fields.flowFilename) {
				fs.unlink(files.file.path, function() {
					return res.status(400).send({message : "Required field not set correctly."});
				});
			} else {
				if(!canViewEvent(req.user, fields.event_id, req.hasAuthorization) || !isRecruitEvent(req.user, fields.event_id, req.hasAuthorization)) {
					fs.unlink(files.file.path, function() {
						return res.status(401).send({message : "You are not authorized to view the comments for this event."});
					});
				} else {
					fs.rename(files.file.path, path.normalize(basePath + fields.flowFilename), function(err) {
						if(err) {
							return res.status(400).send({message : err, err : errorHandler.getErrorMessage(err)});
						} else {
							return res.status(200).send({message : "Files uploaded!"});
						}
					});
				}
			}
		});
	}
};

/**
* This controller is save images that are uploaded by any registered user on the memoboard
* comment stream to a file on our server.
*/
exports.uploadSocialCommentImage = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else {
		var form = new formidable.IncomingForm({
			keepExtensions : true,
			uploadDir : path.normalize(__dirname + "../../../public/img/social")
		});

		form.parse(req, function(err, fields, files) {
			if(!fields.event_id || !fields.flowFilename) {
				fs.unlink(path.normalize(__dirname + "../../../public/img/social/" + files.file.name), function() {
					return res.status(400).send({message : "Required field not set correctly."});
				});
			} else {
				if(!canViewEvent(req.user, fields.event_id, req.hasAuthorization)) {
					fs.unlink(path.normalize(__dirname + "../../../public/img/social/" + files.file.name), function() {
						return res.status(401).send({message : "User does not have permission."});
					});
				} else {
					fs.rename(files.file.path, path.normalize(__dirname + "../../../public/img/social/" + fields.flowFilename), function(err) {
						if(err) {
							return res.status(400).send({message : err, err : errorHandler.getErrorMessage(err)});
						} else {
							return res.status(200).send({message : "Files uploaded!"});
						}
					});
				}
			}
		});
	}
};
