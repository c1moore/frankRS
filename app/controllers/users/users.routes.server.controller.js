'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	nodemailer = require('nodemailer'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Candidate = mongoose.model('Candidate'),
	Comment = mongoose.model('Comment'),
	config = require('../../../config/config'),
	crypto = require('crypto'),
	async = require('async'),
	path = require('path');

/**
* Helper function to search through one of the lists (invitee, attendee, almost) and return only those users who are attending the
* specified event.
*
* ONLY WORKS IF event_id HAS NOT BEEN POPULATED.
*/
var searchByEvent = function(eventID, arr) {
	var temp = [], j=0;
	for(var i=0; i<arr.length; i++) {
		if(arr[i].event_id.toString() === eventID.toString()) {
			temp[j] = arr[i];
			j++;
		}
	}

	return temp;
};

/**
* Create a temporary password.  This password will not be seen by the invitee, but is just a placeholder for the required password field.
*/
var tempPass = function() {
	var temp = new Buffer(crypto.randomBytes(32).toString('base64'), 'base64');
	var num = _.random(0, 7);
	for(var i=0; i<num; i++) {
		var tempran = _.random(0, temp.length);
		temp = temp.slice(tempran, tempran + 1);
	}

	return temp.toString();
};

/**
* Create a temporary password for a new attendee.  This password is the password that will
* be sent to the attendee so they can log into their account.
*
* @param credentialsArr - An array that will be used to build the personalized password.  This
* variable should follow the following format: [attendee_first_name, attendee_last_name,
* attendee_email, attendee_organization].
*/
var newAttendeePass = function(credentialsArr) {
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var password = [];
	var salt = '';

	for (var i=0; i<5; i++) {
		salt += chars[Math.round(_.random(0, 1, true) * (chars.length - 1))];
	}

	var pos = _.random(0, 2, false);
	password[pos] = salt;

	for(var i=0; i<3; i++) {
		if(!password[i])
			_.random(0, credentialsArr.length, false);
	}

	return password.join('');
};

/**
* Update the rank of all recruiters for the specified event.
*/
var updateRanks = function(event_id) {
	User.aggregate([
		{$match : {'status' : {'event_id' : event_id, 'recruiter' : true}}},
		//{$unwind : 'attendeeList'},
		//{$unwind : 'inviteeList'},
		//{$unwind : 'rank'},
		{$match : {$or : [{'attendeeList' : {'event_id' : event_id}}, {'inviteeList' : {'event_id' : event_id}}]}},
		{$project : {'_id' : 1, 'rank' : 1, 'attendeeLength' : {$size : "$attendeeList"}, 'inviteeLength' : {$size : "$inviteeList"}}},		//A better solution than this may be to add an additional field to the User schema and a presave method that will update this field everytime a user object is updated.
		{$sort : {'attendeeLength' : -1, 'inviteeLength' : -1}}
	], function(err, result) {
		var aqueue = async.queue(function(recruiter, callback) {
			User.findOne({'_id' : recruiter._id}, function(err, result) {
				if(!err) {
					for(var i=0; i<result.rank.length; i++) {
						if(result.rank[i].event_id.toString() === event_id.toString()) {
							result.rank.place = recruiter.place;
							result.save(callback);
							break;
						}
					}
				}
			});
		}, 10000);

		for(var i=0; i<result.length; i++) {
			var recruiter = {'_id' : result[i]._id, 'place' : i};
			aqueue.push(recruiter);
		}
	});
};


/**
* Remove a user from the database completely without remorse and wipe out any proof of their
* existence.
*
* @param user_id `_id` for the user that should be removed
*/
exports.deleteUser = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}
	if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}
	if(!req.body.user_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var uid = new mongoose.Types.ObjectId(req.body.user_id);
	User.remove({_id : uid}, function(err) {
		if(err) {
			return res.status(400).send(err);
		}

		Candidate.remove({user_id : uid}, function(err) {
			if(err) {
				return res.status(400).send(err);
			}

			Comment.remove({user_id : uid}, function(err) {
				if(err) {
					return res.status(400).send(err);
				}

				return res.status(200).send();
			});
		});
	});
};

/**
* Revoke a user's permissions for an event completely.  If each user had a separate account
* for each event, this would be equivalent to setting the login_enabled field for that
* event to false.
*
* @param user_id _id field of the user from which permissions should be revoked
* @param event_id _id field of the event from which to revoke permissions for the user
*/
exports.removePermissions = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}
	if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}
	if(!req.body.user_id || !req.body.event_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var uid = new mongoose.Types.ObjectId(req.body.user_id);
	User.findOne({_id : uid}, function(err, user) {
		if(err) {
			return res.status(400).send(err);
		}
		if(!user) {
			return res.status(400).send({message : "User not found."});
		}

		var i;
		var recruiter = false;
		var active = false;
		var updated = false;
		for(i = 0; i < user.status.length; i++) {
			if(user.status[i].event_id.toString() === req.body.event_id.toString()) {
				user.status[i].active = false;
				user.status[i].recruiter = false;

				updated = true;

				if(recruiter && active) {
					//Do not break prematurely.
					break;
				}
			} else {
				//Keep track of whether the user is a recruiter for another event.
				if(user.status[i].recruiter) {
					recruiter = true;
				}

				//Keep track of whether the user can access another event.
				if(user.status[i].active) {
					active = true;
				}

				if(recruiter && active && updated) {
					//Do not break prematurely.
					break;
				}
			}
		}

		//If the event was found, we need to save the updated user.
		if(i <= user.status.length) {
			//If the user is no longer a recruiter, take that role away.
			if(_.intersection(user.roles, ["recruiter"]).length && !recruiter) {
				for(var j = 0; j < user.roles.length; j++) {
					if(user.roles[j] === "recruiter") {
						user.roles.splice(j, 1);
					}
				}
			}

			//If the user cannot access any events, don't let them login anymore.
			if(!active) {
				user.login_enabled = false;
			}

			user.save(function(err) {
				if(err) {
					return res.status(400).send(err);
				}

				return res.status(200).send();
			});
		} else {
			return res.status(400).send({message : "User not associated with this event."});
		}
	});
};

/**
* Revoke a user's permissions for all events and set login_enabled to false for the user.
*
* @param user_id _id field of the user from which permissions should be revoked
* @param event_id _id field of the event from which to revoke permissions for the user
*/
exports.removeAllPermissions = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}
	if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}
	if(!req.body.user_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var uid = new mongoose.Types.ObjectId(req.body.user_id);
	User.findOne({_id : uid}, function(err, user) {
		if(err) {
			return res.status(400).send(err);
		}
		if(!user) {
			return res.status(400).send({message : "User not found."});
		}

		for(var i = 0; i < user.status.length; i++) {
			user.status[i].active = false;
			user.status[i].recruiter = false;
		}

		//If the user was a recruiter, take that role away.
		if(_.intersection(user.roles, ["recruiter"]).length) {
			for(var j = 0; j < user.roles.length; j++) {
				if(user.roles[j] === "recruiter") {
					user.roles.splice(j, 1);
				}
			}
		}

		if(!user.roles.length) {
			user.roles = ["attendee"];
		}

		user.login_enabled = false;

		user.save(function(err) {
			if(err) {
				return res.status(400).send(err);
			}

			return res.status(200).send();
		});
	});
};

/**
* Remove a user's recruiter permissions for a specified event.  If the specified event is the
* only event with which the user is affiliated, the following actions will be take:
* 		- If the user is attending the event, the user's role will be changed to attendee
* 		- If the user is not attending the event, the user's account will be deleted
* If the user is not a recruiter (for the specified event), status 200 will be returned
* without modifying the user's account.
*
* @param user_id `_id` for the recruiter that should have their account updated
* @param event_id `_id` of the event the user's recruiter status should be removed
*/
exports.removeRecruiterRole = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}
	if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}
	if(!req.body.user_id || !req.body.event_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	User.findOne({_id : new mongoose.Types.ObjectId(req.body.user_id)}, function(err, recruiter) {
		if(err) {
			return res.status(400).send(err);
		}
		if(!recruiter) {
			return res.status(400).send({message : "Recruiter not found."});
		}
		var t;
		for(t = 0; t < recruiter.roles.length; t++) {
			if(recruiter.roles[t] === "recruiter") {
				break;
			}
		}
		if(t === recruiter.roles.length) {
			return res.status(200).send();
		}

		//Take care of the case that only 1 event is in this user's status array.
		if(recruiter.status.length === 1) {
			if(recruiter.status[0].event_id.toString() === req.body.event_id.toString() && recruiter.status[0].recruiter) {
				//Delete the user.
				recruiter.remove(function(err) {
					if(err) {
						return res.status(400).send(err);
					}

					return res.status(200).send();
				});
			} else {
				//This user is not a recruiter for this event.
				return res.status(200).send();
			}
		} else {
			var i = 0;
			for(; i < recruiter.status.length; i++) {
				if(recruiter.status[i].event_id.toString() === req.body.event_id.toString() && recruiter.status[i].recruiter) {
					if(recruiter.status[i].attending) {
						recruiter.status[i].recruiter = false;
					} else {
						recruiter.status.pull({event_id : new mongoose.Types.ObjectId(req.body.event_id)});
					}

					var j;
					for(j = 0; j < recruiter.status.length; j++) {
						if(recruiter.status[j].recruiter) {
							break;
						}
					}

					if(j === recruiter.status.length) {
						//This user is no longer a recruiter, strip their permissions.
						recruiter.roles.pull("recruiter");
						recruiter.roles.addToSet("attendee");
					}

					recruiter.save(function(err, result) {
						if(err) {
							return res.status(400).send(err);
						}

						return res.status(200).send();
					});

					break;
				}
			}

			if(i === recruiter.status.length) {
				//This user is not a recruiter for this event, just return 200.
				return res.status(200).send();
			}
		}
	});
};

/**
* Return the user's displayname (Last, First).
*/
exports.getDisplayName = function(req, res) {
	if(!req.isAuthenticated())
		res.status(401).send({'message' : 'User is not logged in.'});
	else {
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
	}
};

/**
* Get the data that will be displayed for in the leaderboard.  This data includes all of the recruiter names, their rank,
* and the inviteeList and attendeeList, properly populated with the displayName of each user in one of these lists.
*/
exports.getLeaderboard = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : "User is not logged in."});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin"])) {
		var query = User.find({'roles' : 'recruiter', 'status.event_id' : req.body.event_id, 'status.recruiter' : true});
		query.select('displayName rank inviteeList attendeeList');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result.length) {
				res.status(400).send({message : 'No recruiters found!'});
			} else {
				for(var i=0; i<result.length; i++) {
					result[i] = result[i].toObject();
					
					result[i].inviteeList = searchByEvent(req.body.event_id, result[i].inviteeList);
					result[i].attendeeList = searchByEvent(req.body.event_id, result[i].attendeeList);
					result[i].invited = result[i].inviteeList.length;
					result[i].attending = result[i].attendeeList.length;
					delete result[i].inviteeList;
					delete result[i].attendeeList;

					for(var j=0; j<result[i].rank.length; j++) {
						if(result[i].rank[j].event_id.toString() === req.body.event_id.toString()) {
							var temp = parseInt(result[i].rank[j].place);
							delete result[i].rank;//result[i].rank = null;
							result[i].place = temp;//result[i].rank[j].place;
							break;
						}
					}
				}

				res.status(200).send(result);
			}
		});
	} else {
		res.status(401).send({'message' : "User does not have permission."});
	}
};

/**
* Get a list of events for which this user is a recruiter.  The method first queries the database for the currently logged in recruiter,
* then, if found, goes through the array of all events with which this recruiter is associated and returns only those events for which the
* user is a recruiter.
*/
exports.getRecruiterEvents = function(req, res) {
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin"])) {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('status');
		query.populate('status.event_id');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).json({message : 'User not found or is not a recruiter!'});
			} else {
				var events = [], j=0;
				for(var i=0; i<result.status.length; i++) {
					if(result.status[i].recruiter && result.status[i].active) {
						events[j] = result.status[i];
						j++;
					}
				}
				res.status(200).send(events);
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get a list of events for the currently logged in user.  This list will be obtained through the user's status array.  Information about
* whether or not the user is a recruiter for this event will be retained so that the front-end can differentiate between events this user
* is attending vs. ones for which they are recruiting.
*/
exports.getUserEvents = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin", "attendee"])) {
		if(req.hasAuthorization(req.user, ['admin'])) {
			var query = Event.find({});
			query.exec(function(err, result) {
				if(err) {
					return res.status(400).send({message : err});
				} else if(!result.length) {
					return res.status(400).send({message : 'No events found.'});
				} else {
					return res.status(200).send(result);
				}
			});
		} else {
			var id = new mongoose.Types.ObjectId(req.user._id);

			User.aggregate([
				{$match : {_id : id}},
				{$project : {_id : 0, status : 1}},
				{$unwind : "$status"},
				{$match : {"status.active" : true}}
			], function(err, results) {
				if(err) {
					return res.status(400).send(err);
				}
				if(!results || !results.length) {
					return res.status(400).send({message : 'User not found or is not associated with any events!'});
				}
				User.populate(results, {
					path : "status.event_id",
					model : "Event"
				}, function(err, populatedResults) {
					if(err) {
						return res.status(400).send(err);
					}

					//Transform the results in a form previously expected by the frontend (i.e. an object with a status field that is an array of event objects).
					var rval = {status : []};
					for(var i = 0; i < populatedResults.length; i++) {
						//Only add those events that still exist.
						if(populatedResults[i].status.event_id) {
							rval.status.push(populatedResults[i].status);
						}
					}

					return res.status(200).send(rval);
				});
			});
		}
	} else {
		return res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the list of attendees for the event specified and the recruiter that is currently logged in.
*/
exports.getRecruiterAttendees = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var uid = new mongoose.Types.ObjectId(req.user._id);
		var eid = new mongoose.Types.ObjectId(req.body.event_id);

		User.aggregate([
			{$match : {_id : uid}},
			{$project : {_id : 0, attendeeList : 1}},
			{$unwind : "$attendeeList"},
			{$match : {"attendeeList.event_id" : eid}}
		], function(err, attendees) {
			if(err) {
				res.status(400).send(err);
			} else if(!attendees || !attendees.length) {
				res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
			} else {
				User.populate(attendees, {
					path : "attendeeList.user_id",
					model : "User",
					select : "-_id displayName email"
				}, function(err, populatedAttendees) {
					if(err) {
						res.status(400).send(err);
					}

					var attendeeList = [];
					for(var i = 0; i < populatedAttendees.length; i++) {
						populatedAttendees[i].attendeeList.user_id = populatedAttendees[i].attendeeList.user_id.toObject();
						populatedAttendees[i].attendeeList.user_id.read = populatedAttendees[i].attendeeList.read;
						attendeeList.push(populatedAttendees[i].attendeeList.user_id);
					}

					res.status(200).send(attendeeList);
				});
			}
		});

		// var query = User.findOne({'_id' : id});
		// query.select('attendeeList');
		// query.populate('attendeeList.user_id', 'displayName email');
		// query.exec(function(err, result) {
		// 	if(err) {
		// 		res.status(400).send(err);
		// 	} else if(!result || !result.attendeeList.length) {
		// 		res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
		// 	} else {
		// 		var attendeeList = [], j=0;
		// 		result = result.toObject();
		// 		for(var i=0; i<result.attendeeList.length; i++) {
		// 			if(result.attendeeList[i].event_id.toString() === req.body.event_id.toString() && result.attendeeList[i].user_id) {
		// 				attendeeList[j] =result.attendeeList[i];
		// 				j++;
		// 			}
		// 		}
		// 		res.status(200).send(attendeeList);
		// 	}
		// });
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the invitee list of the currently logged in recruiter for the event specified.
*/
exports.getRecruiterInvitees = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var uid = new mongoose.Types.ObjectId(req.user._id);
		var eid = new mongoose.Types.ObjectId(req.body.event_id);

		User.aggregate([
			{$match : {_id : uid}},
			{$project : {_id : 0, inviteeList : 1}},
			{$unwind : "$inviteeList"},
			{$match : {"inviteeList.event_id" : eid}}
		], function(err, invitees) {
			if(err) {
				res.status(400).send(err);
			} else if(!invitees || !invitees.length) {
				res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
			} else {
				User.populate(invitees, {
					path : "inviteeList.user_id",
					model : "User",
					select : "-_id displayName email"
				}, function(err, populatedInvitees) {
					if(err) {
						res.status(400).send(err);
					}

					var inviteeList = [];
					for(var i = 0; i < populatedInvitees.length; i++) {
						populatedInvitees[i].inviteeList.user_id = populatedInvitees[i].inviteeList.user_id.toObject();
						populatedInvitees[i].inviteeList.user_id.read = populatedInvitees[i].inviteeList.read;
						inviteeList.push(populatedInvitees[i].inviteeList.user_id);
					}

					res.status(200).send(inviteeList);
				});
			}
		});

		// var query = User.findOne({'_id' : id});
		// query.select('inviteeList');
		// query.populate('inviteeList.user_id', 'displayName email');
		// query.exec(function(err, result) {
		// 	if(err) {
		// 		res.status(400).send(err);
		// 	} else if(!result || !result.inviteeList.length) {
		// 		res.status(400).json({'message' : 'User not found or the user has not invited anybody yet.'});
		// 	} else {
		// 		var inviteeList = [], j=0;
		// 		for(var i=0; i<result.inviteeList.length; i++) {
		// 			if(result.inviteeList[i].event_id.toString() === req.body.event_id.toString() && result.inviteeList[i].user_id) {
		// 				inviteeList[j] =result.inviteeList[i];
		// 				j++;
		// 			}
		// 		}
		// 		res.status(200).send(inviteeList);
		// 	}
		// });
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the almost list of the currently logged in recruiter for the event specified.
*/
exports.getRecruiterAlmosts = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var uid = new mongoose.Types.ObjectId(req.user._id);
		var eid = new mongoose.Types.ObjectId(req.body.event_id);

		User.aggregate([
			{$match : {_id : uid}},
			{$project : {_id : 0, almostList : 1}},
			{$unwind : "$almostList"},
			{$match : {"almostList.event_id" : eid}}
		], function(err, almosts) {
			if(err) {
				res.status(400).send(err);
			} else if(!almosts || !almosts.length) {
				res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
			} else {
				User.populate(almosts, {
					path : "almostList.user_id",
					model : "User",
					select : "-_id displayName email"
				}, function(err, populatedAlmosts) {
					if(err) {
						res.status(400).send(err);
					}

					var almostList = [];
					for(var i = 0; i < populatedAlmosts.length; i++) {
						populatedAlmosts[i].almostList.user_id = populatedAlmosts[i].almostList.user_id.toObject();
						populatedAlmosts[i].almostList.user_id.read = populatedAlmosts[i].almostList.read;
						almostList.push(populatedAlmosts[i].almostList.user_id);
					}

					res.status(200).send(almostList);
				});
			}
		});

		// var id = req.user._id;
		// var query = User.findOne({'_id' : id});
		// query.select('almostList');
		// query.populate('almostList.user_id', 'displayName email');
		// query.exec(function(err, result) {
		// 	if(err) {
		// 		res.status(400).send(err);
		// 	} else if(!result || !result.almostList.length) {
		// 		res.status(400).json({'message' : 'User not found or the user has not invited anybody yet.'});
		// 	} else {
		// 		var almostList = [], j=0;
		// 		for(var i=0; i<result.almostList.length; i++) {
		// 			if(result.almostList[i].event_id.toString() === req.body.event_id.toString() && result.almostList[i].user_id) {
		// 				almostList[j] =result.almostList[i];
		// 				j++;
		// 			}
		// 		}
		// 		res.status(200).send(almostList);
		// 	}
		// });
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Retrieve the list of all people who are signed up to attend the event.
*/
exports.getAttendees = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		User.aggregate([
			{$match : {roles : 'recruiter', "status.event_id" : new mongoose.Types.ObjectId(req.body.event_id), "status.recruiter" : true}},
			{$project : {recruiterName : "$displayName", attendeeList : 1, _id : 0}},
			{$unwind : "$attendeeList"},
			{$match : {"attendeeList.event_id" : new mongoose.Types.ObjectId(req.body.event_id)}}
		], function(err, results) {
			if(err) {
				res.status(400).send(err);
			} else if(!results || !results.length) {
				res.status(400).json({'message' : 'Nobody is attending yet.'});
			} else {
				User.populate(
					results, {
						path : "attendeeList.user_id",
						model : 'User',
						select : 'displayName organization -_id'
					}, function(err, pResults) {
						if(err) {
							res.status(400).send({message : err});
						} else {
							for(var i=0; i<pResults.length; i++) {
								//If this user was deleted, just delete the record.
								if(pResults[i].attendeeList.user_id) {
									pResults[i].attendeeName = pResults[i].attendeeList.user_id.displayName;
									pResults[i].organization = pResults[i].attendeeList.user_id.organization;

									delete pResults[i].attendeeList;
								} else {
									pResults.splice(i--, 1);
								}
							}

							res.status(200).send(pResults);	
						}
					}
				);
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Retrieve the list of all people who are invited to attend the specified event.
*/
exports.getInvitees = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		User.aggregate([
			{$match : {roles : 'recruiter', "status.event_id" : new mongoose.Types.ObjectId(req.body.event_id), "status.recruiter" : true}},
			{$project : {recruiterName : "$displayName", inviteeList : 1, _id : -1}},
			{$unwind : "$inviteeList"},
			{$match : {"inviteeList.event_id" : new mongoose.Types.ObjectId(req.body.event_id)}}
		], function(err, results) {
			if(err) {
				res.status(400).send(err);
			} else if(!results || !results.length) {
				res.status(400).json({'message' : 'Nobody is attending yet.'});
			} else {
				User.populate(
					results, {
						path : "inviteeList.user_id",
						model : 'User',
						select : 'displayName -_id'
					}, function(err, pResults) {
						if(err) {
							res.status(400).send({message : err});
						} else {
							for(var i=0; i<pResults.length; i++) {
								//If the user was deleted, delete the array entry.
								if(pResults[i].inviteeList.user_id) {
									pResults[i].inviteeName = pResults[i].inviteeList.user_id.displayName;
								
									delete pResults[i].inviteeList;
								} else {
									pResults.splice(i--, 1);
								}
							}

							res.status(200).send(pResults);	
						}
					}
				);
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});	
	}
};

/*Send the information that will be displayed in the first tab of the leaderboard.  This
will include the recruiter's name, rank, and the number of people invited and attendding.*/
exports.getRecruiterInfo = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		return res.status(401).send({message : 'User does not have permission.'});
	} else {
		if(req.query.event_id == undefined) {
			return res.status(400).send({message : 'Event not specified.'});
		} else {
			var id = req.user._id;
			var query = User.findOne({'_id' : id});
			query.select('fName lName rank attendeeList inviteeList');
			query.exec(function (err, result) {
				if(err) {
					res.status(400).send(err);
				} else if(!result) {
					res.status(400).json({'message' : 'User not found!'});
				} else {
					result = result.toObject();
					result.attending = 0;
					result.invited = 0;
					result.place = null;

					for(var i=0; i<result.attendeeList.length; i++) {
						if(result.attendeeList[i].event_id.toString() === req.query.event_id.toString()) {
							result.attending++;
						}
					}

					for(var i=0; i<result.inviteeList.length; i++) {
						if(result.inviteeList[i].event_id.toString() === req.query.event_id.toString()) {
							result.invited++;
						}
					}

					for(var i=0; i<result.rank.length; i++) {
						if(result.rank[i].event_id.toString() === req.query.event_id.toString()) {
							result.place = result.rank[i].place;
							break;
						}
					}

					//Delete lists, no need to send them since we have the count.
					delete result.attendeeList;
					delete result.inviteeList;
					delete result.rank;

					res.status(200).send(result);
				}
			});
		}
	}
};

/*
* This method returns any and all templates saved for this user.
* If no templates are found, returns a JSON object with field message
* set as 'No templates have been saved.'  If there was an error, the
* error is returned.  If there were no errors, the result is returned.
*/
exports.getUserTemplates = function(req, res) {
	if(!req.isAuthenticated())
		res.status(401).send({'message' : 'User is not logged in.'});
	else {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('templates');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result || !result.length) {
				res.status(400).json({'message' : 'No templates have been saved.'});
			} else {
				res.status(200).send(result);
			}
		});
	}
};

/*
* This method returns the email address for the user currently signed in.
*/
exports.getEmail = function(req, res) {
	if(!req.isAuthenticated())
		res.status(401).send({'message' : 'User is not logged in.'});
	else {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('email');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).json({'message' : 'The impossible has occurred: no email found for user.'});
			} else {
				res.status(200).send({'email' : result.email});
			}
		});
	}
};

/**
* This method will return all users for the specified event.
*
* @param event_id - The _id field for the event for which users should be returned.
*/
exports.getUsers = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}

	if(!req.body.event_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	User.aggregate([
		{$match : {'status.event_id' : new mongoose.Types.ObjectId(req.body.event_id), 'login_enabled' : true}},
		{$unwind : "$status"},
		{$match : {'status.event_id' : new mongoose.Types.ObjectId(req.body.event_id)}},
		{$project : {fName : 1, lName : 1, displayName : 1, email : 1, organization : 1, attending : "$status.attending", active : "$status.active"}}
	], function(err, result) {
		if(err) {
			return res.status(400).send(err);
		}

		if(!result) {
			return res.status(400).send({message : "No users found for this event."});
		}

		return res.status(200).send(result);
	});
};

/**
* This method will return all recruiters for the specified event.
*
* @param event_id - The _id field for the event for which recruiters should be returned.
*/
exports.getRecruiters = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ['admin'])) {
		return res.status(401).send({message : "User does not have permission."});
	}

	if(!req.query.event_id) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	User.aggregate([
		{$match : {'status.event_id' : new mongoose.Types.ObjectId(req.query.event_id), 'status.recruiter' : true}}
	], function(err, result) {
		if(err) {
			return res.status(400).send(err);
		}

		if(!result) {
			return res.status(400).send({message : "No recruiters found for this event."});
		}

		return res.status(200).send(result);
	});
};

/*
* This method sends an invitation to the invitee through the recruiter's email address.  If the invitee has not been invited before, the invitee is added to our database.  If the
* invitee has been invited before, but is not attending, this invitee is simply added to the recruiter's inviteeList.  In either of these cases, the recruiter's rank may have changed
* so their rank for this event must be updated.  Furthermore, the number of people attending this event may need to be updated if the person has not yet been invited to this event.
* However, if the user has been invited and is already attending the specified event, the invitee will be added to their almostList.  Since the almostList does not affect the
* recruiter's rank, their rank does not have to be updated.
*
* TODO: A much more efficient method for updating this information, especially the recruiter's rank, should be researched and used when time permits.
*/
exports.sendInvitation = function(req, res) {
	if(req.body.fName == undefined || req.body.lName == undefined || req.body.email == undefined || req.body.event_id == undefined || req.body.event_name == undefined) {
		return res.status(400).send({'message' : 'Required fields not specified.'});
	}

	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var smtpTransport = nodemailer.createTransport(config.mailer.options);
		var mailOptions = {
			to: req.body.email,
			from: req.user.email,
			sender: req.user.email,
			replyTo: req.user.email,
			subject: "You're Invied to frank!"
		};
		var query = User.findOne({'_id' : req.user._id});
		query.exec(function(err, recruiter) {
			if(err) {
				return res.status(400).send({'message' : 'User is not logged in or does not have permissions.'});
			} else if(!recruiter) {
				return res.status(400).send({'message' : 'Recruiter not found.'});
			} else {
				/**
				* First, determine if the user is in fact a recruiter for this event and that the
				* user has access to this event (i.e. active in the status array is not false).
				*/
				var tempi = 0;
				for(; tempi < recruiter.status.length; tempi++) {
					if(recruiter.status[tempi].event_id.toString() === req.body.event_id.toString()) {
						if(!recruiter.status[tempi].recruiter || !recruiter.status[tempi].active) {
							//This user should not be recruiting for this event.
							return res.status(401).send({message : 'User does not have permission to send invitations for this event.'});
						}

						break;
					}
				}

				if(tempi === recruiter.status.length) {
					//This user is not even associated with this event.
					return res.status(401).send({message : 'User does not have permission to send invitations for this event.'});
				}

				/**
				* We need to determine if the user is already attending the event.  If not,
				* we need to either add them to the database or update their status array
				* to show they have been invited, but not yet attending.  The invitee should
				* also be sent the email invitation since they are not attending.  These cases will be
				* taken care of if this query does not return a result.  If it does return a
				* result, however, the user is already attending this event and the only thing
				* that needs to be done is to add the invitee to the recruiter's almostList.
				*/
				var query2 = User.findOne({'email' : req.body.email, 'status.event_id' : req.body.event_id, 'status.attending' : true});
				query2.exec(function(err, invitee) {
					if(err) {
						return res.status(400).send({'message' : 'Invitation could not be sent.  Please contact frank about this issue.'});
		
					//Either the specified user is not attending the event yet or has not even been invited.
					} else if(!invitee) {
						async.waterfall([
							function(callback) {
								/**
								* This query will determine if the user is already in the database 
								* (either from being invited to this event or another) or if the
								* invitee should be added to the database.  The former case will
								* return a result, while the latter will return nothing.
								*/
								User.findOne({'email' : req.body.email}, function(err, result) {
									if(err) {
										callback(true, null);
									} else if(!result) {
										/**
										* Invitee is not in the db yet.  Add the invitee to the db and send the new User
										* object to the next function.  We will use a temporary password that will be
										* reset when the user accepts the invitation.  We can determine if the user needs
										* a real password by checking the login_enabled field.
										*/
										var newUser = new User({
											fName : req.body.fName,
											lName : req.body.lName,
											email : req.body.email,
											roles : ['attendee'],
											login_enabled : false,
											displayName : req.body.lName + ', ' + req.body.fName,
											status : [{'event_id' : new mongoose.Types.ObjectId(req.body.event_id), 'attending' : false, 'recruiter' : false}],
											password : tempPass()
										});

										newUser.save(function(err, result2) {
											Event.findByIdAndUpdate(new mongoose.Types.ObjectId(req.body.event_id), {$inc : {invited : 1}}, function(err) {
												if(err) {
													callback(err, null);
												} else {
													callback(err, result2);
												}
											});
										});
									} else {
										/**
										* Invitee is already in the db, all we need to do is
										* add this event to the user's status array, if it is
										* not already there, and send the User object to the
										* next function to be added to the recruiter's inviteeList.
										*/
										var i;
										for(i = 0; i < result.status.length; i++) {
											if(result.status[i].event_id.toString() === req.body.event_id.toString())
												break;
										}

										if(i === result.status.length) {
											//The invitee has not been invited to the event yet, increment the event invited count and add this event to the invitee status array.
											var evnt_id = new mongoose.Types.ObjectId(req.body.event_id);

											result.status.addToSet({'event_id' : evnt_id, 'attending' : false, 'recruiter' : false});
											result.save(function(err, updatedUser) {
												Event.findByIdAndUpdate(evnt_id, {$inc : {invited : 1}}, function(err) {
													if(err) {
														callback(err, null);
													} else {
														callback(err, updatedUser);
													}
												});
											});
										} else {
											//The invitee has already been invited to this event.  Simply send result on to the next function.
											callback(null, result);
										}
									}
								});
							},
							function(invitee, callback) {
								//Add the invitee to the recruiter's inviteeList.
								recruiter.inviteeList.addToSet({'event_id' : new mongoose.Types.ObjectId(req.body.event_id), 'user_id' : invitee._id});
								recruiter.save(function(err, result) {
									if(err) {
										callback(true, null);
									} else {
										callback(null, invitee);
									}
								});
							},
							/**
							* Get the template for this event and populate the fields
							* accordingly.
							*/
							function(invitee, callback) {
								var fileName = req.body.event_name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g,"");
								fileName = fileName.replace(/\s{2,}/g," ");
								fileName = fileName.replace(/ /g, "_");

								var filepath = path.normalize(__dirname + "/../../views/templates/preview/" + fileName.toLowerCase());

								res.render(filepath, {
									receiver_name: req.body.fName,
									event_name: req.body.event_name,
									message: req.body.message
								}, function(err, emailHTML) {
									mailOptions.html = emailHTML;
									callback(err, invitee);
								});
							}
						/**
						* If there were no errors up to this point, send the invitee their
						* email invitation.  If the invitation was sent correctly, update
						* the ranks for the users.  Since the ranks will be updated every
						* time an invitation is sent (to sombebody not attending the event
						* yet), if an error occurs while updating the ranks, we do not have
						* to worry.  This is why the ranks are updated last, it is the least
						* important step in the process and easily corrected the next time
						* an invitation is sent.
						*/
						], function(err, invitee) {
							if(err) {
								return res.status(400).send({'message' : "Invitation was not sent.  We could not connect to the server, please try again later."});
							} else {
								smtpTransport.sendMail(mailOptions, function(err) {
									if(err) {
										return res.status(400).send({'message' : 'Invitation was not sent.  Please try again later.', 'error' : err});
									} else {
										//updateRanks(req.body.event_id);
										async.waterfall([
											function(next) {
												User.aggregate([
													{$match : {'status.event_id' : new mongoose.Types.ObjectId(req.body.event_id), 'status.recruiter' : true}},
													{$match : {$or : [{'attendeeList.event_id' : new mongoose.Types.ObjectId(req.body.event_id)}, {'inviteeList.event_id' : new mongoose.Types.ObjectId(req.body.event_id)}]}},
													{$project : {'_id' : 1, 'rank' : 1, 'attendeeLength' : {$size : "$attendeeList"}, 'inviteeLength' : {$size : "$inviteeList"}}},
													{$sort : {'attendeeLength' : -1, 'inviteeLength' : -1}}
												], function(err, result) {
													if(err) {
														next(err, false);
													} else {
														var aqueue = async.queue(function(recruiter, callback) {
															User.findOne({'_id' : recruiter._id}, function(err, result) {
																if(!err) {
																	for(var i=0; i<result.rank.length; i++) {
																		if(result.rank[i].event_id.toString() === req.body.event_id.toString()) {
																			result.rank.place = recruiter.place;
																			result.save(function() {
																				callback();
																			});
																			break;
																		}
																	}

																	if(i===result.rank.length) {
																		result.rank.push({event_id : new mongoose.Types.ObjectId(req.body.event_id), place : recruiter.place});
																		result.save(function() {
																			callback();
																		});
																	}
																}
															});
														}, 20);

														var i=0;

														aqueue.drain = function() {
															if(i===result.length)
																next(null, true);
														};

														for(; i<result.length; i++) {
															var recruiter = {'_id' : result[i]._id, 'place' : i};
															aqueue.push(recruiter);
														}
													}
												});
											}],
											function(err, results) {
												if(err) {
													return res.status(400).send({message: 'Invitation has been sent to ' + req.body.fName + ', but an error occurred.  Please contact frank about this error.', error : err});
												} else {
													return res.status(200).send({message: 'Invitation has been sent to ' + req.body.fName + '!'});
												}
											}
										);
									}
								});
							}
						});
					
					/**
					* This user has already been invited and is attending this event.  Simply
					* add this 'invitee' to the recruiter's almostList and send a message
					* informing the recruiter that this person is already attending the
					* event.
					*/
					} else {
						recruiter.almostList.addToSet({'event_id' : req.body.event_id, 'user_id' : invitee._id});
						recruiter.save(function(err, result) {
							return res.status(200).send({message: req.body.fName + ' ' + req.body.lName + ' is already attending frank.  You\'re thinking of the right people.'});
						});
					}
				});
			}
		});

	} else {
		return res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* This method should only be triggered by Zapier.com.  This method will be used only when someobody signs up to attend
* an event on Eventbrite.  Once this occurs, Zapier will send us a webhook with all the information we need to add the
* attendee to the database.  If the attendee is not currently in the database (which suggests they were invited by
* means other than the recruiter system), they will be added to the database with the recruiter they specified in the
* Eventbrite form as the user that recruited them.  If they are in the database, their information will be updated and
* all inviteeLists will have to be searched to update the information properly.
*
* If the attendee is not already an attendee for another event or if they are not a recruiter or admin (which can be
* determined by checking the login_enable), they will need to be given permission to log into the system by setting
* login_enable to true and resetting their password from the random one created when they were first invited.  This
* new password will then be sent to them in an email telling them of their account on this website.
*
* If the attendee is added to the db, we need to increment the number of people attending and decrement the total
* number of people invited for this event (invitation count is only for those invited, but not attending).
*
* TODO: Change the API before production.
*/
exports.acceptInvitation = function(req, res) {
	//We will use an API key to determine whether or not this is an authenticated request.
	if(!(req.body.api_key === 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe')) {
		return res.status(400).send({message : 'You are not authorized to make this request.'});
	} else {
		/**
		* These are the fields we will expect from Zapier.  We need to check to make sure
		* they are specified in the request and have a typeof value of 'string'.  If both
		* of these conditions are not met, we will return a 400 error.
		*/

		var expectedFields = ['api_key', 'invitee_fName', 'invitee_lName', 'invitee_email', 'organization', 'event_name', 'recruiter_email'];

		for(var i=0; i<expectedFields.length; i++) {
			if(req.body[expectedFields[i]] == undefined) {
				return res.status(400).send({message : 'All required fields not specified.'});
			} else if(typeof req.body[expectedFields[i]] !== 'string') {
				return res.status(400).send({message : 'Illegal value for field ' + expectedFields[i] + '.'});
			}
		}

		User.findOne({email : req.body.invitee_email}, function(err, attendee) {
			if(err) {
				return res.status(400).send({message : err});
			} else {
				Event.findOne({name : req.body.event_name}, function(err, evnt) {
					if(err) {
						return res.status(400).send({message : err});
					} else if(!evnt) {
						return res.status(400).send({message : 'Event not found.'});
					} else {
						if(!attendee) {
							/**
							* The attendee has not been added to the db before (meaning they were invited
							* outside of the recruiter system) and needs to be added as an attendee.  This
							* could also mean that the user was using another email when they received their
							* invitation.  This situation will not be considered as there are no good ways
							* to determine if a user account should belong to this attendee.
							*/

							var pass = newAttendeePass([req.body.invitee_fName, req.body.invitee_lName, req.body.invitee_email, req.body.organization]);

							var newAttendee = new User({
								fName : req.body.invitee_fName,
								lName : req.body.invitee_lName,
								email : req.body.invitee_email,
								displayName : req.body.invitee_lName + ', ' + req.body.invitee_fName,
								roles : ['attendee'],
								login_enabled : true,
								status : [{event_id : evnt._id, attending : true, recruiter : false}],
								password : pass
							});

							newAttendee.save(function(err, result) {
								if(err) {
									return res.status(400).send({message : err});
								} else {
									/**
									* Now we can send the attendee an email about their new account
									* and inform the recruiter that one of their invitations were
									* accepted.
									*/
									var smtpTransport = nodemailer.createTransport(config.mailer.options);
									var attendeeMailOptions = {
										to: req.body.invitee_email,
										from: 'frank@jou.ufl.edu',
										sender: 'frank@jou.ufl.edu',
										replyTo: 'frank@jou.ufl.edu',
										subject: "New frank account for " + req.body.event_name
									};
									var recruiterMailOptions = {
										to: req.body.recruiter_email,
										from: 'frank@jou.ufl.edu',
										sender: 'frank@jou.ufl.edu',
										replyTo: 'frank@jou.ufl.edu',
										subject: 'Yet Another Invitation Accepted'
									};
									
									async.parallel([
										//Send message to attendee.
										function(callback) {
											res.render('templates/invitation-accepted-attendee-email', {
												name: req.body.invitee_fName,
												event: req.body.event_name,
												password : pass,
												address : 'http://frank.jou.ufl.edu/recruiters'
											}, function(err, emailHTML) {
												attendeeMailOptions.html = emailHTML;
												smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
													if(err) {
														callback(err, false);
													} else {
														callback(false, info.response);
													}
												});
											});
										},
										//Get recruiter information and send notification.
										function(callback) {
											User.findOne({email : req.body.recruiter_email}, function(err, result) {
												if(err) {
													callback(err, false);
												} else if(!result) {
													callback(true, false);
												} else {
													result.attendeeList.addToSet({event_id : evnt._id, user_id : newAttendee._id});
													result.save(function(err) {
														if(err) {
															return res.status(400).send({message : err});
														} else {
															res.render('templates/invitation-accepted-recruiter-email', {
																recruiter_name : result.fName,
																event: req.body.event_name,
																attendee_name: req.body.invitee_fName + " " + req.body.invitee_lName,
																address : 'http://frank.jou.ufl.edu/recruiters/!#/leaderboard'
															}, function(err, emailHTML) {
																recruiterMailOptions.html = emailHTML;
																smtpTransport.sendMail(recruiterMailOptions, function(err, info) {
																	if(err) {
																		callback(err, false);
																	} else {
																		callback(false, info.response);
																	}
																});
															});
														}
													});
												}
											});
										},
									],
										//Callback function.
										function(err, results) {
											if(err) {
												return res.status(400).send({message : err});
											} else {
												Event.findByIdAndUpdate(evnt._id, {$inc : {attending : 1, invited : -1}}, function(err) {
													if(err) {
														return res.status(400).send({message : "Error updating attending and invited.", error : err});
													} else {
														return res.status(200).send({message : "As expected, everything worked perfectly."});
													}
												});
											}
										}
									);
								}
							});
						} else {
							/**
							* The attendee has been added to the db, but this does not mean they have
							* been invited to attend this event through the recruiter system.  We
							* simply need to update their status array by either updating the event
							* to show they are attending or adding the event to their status array,
							* change their password if login_enabled is false, and send them an email.
							*/

							var i;
							for(i=0; i<attendee.status.length; i++) {
								if(attendee.status[i].event_id.toString() === evnt._id.toString()) {
									attendee.status[i].attending = true;
									break;
								}
							}

							if(i === attendee.status.length) {
								attendee.status.addToSet({event_id : evnt._id, attending : true, recruiter : false});
							}

							//If login_enabled is false, reset password and set login_enabled to true.
							var pass, new_accnt = false;
							if(!attendee.login_enabled) {
								pass = newAttendeePass([req.body.invitee_fName, req.body.invitee_lName, req.body.invitee_email, req.body.organization]);
								new_accnt = true;

								attendee.login_enabled = true;
								attendee.password = pass;
							}

							attendee.save(function(err) {
								if(err) {
									return res.status(400).send({message : err});
								} else {
									var smtpTransport = nodemailer.createTransport(config.mailer.options);
									var attendeeMailOptions = {
										to: req.body.invitee_email,
										from: 'frank@jou.ufl.edu',
										sender: 'frank@jou.ufl.edu',
										replyTo: 'frank@jou.ufl.edu',
										subject: "New frank account for " + req.body.event_name
									};
									var recruiterMailOptions = {
										to: req.body.recruiter_email,
										from: 'frank@jou.ufl.edu',
										sender: 'frank@jou.ufl.edu',
										replyTo: 'frank@jou.ufl.edu',
										subject: 'Yet Another Invitation Accepted'
									};
									
									async.parallel([
										//Send message to attendee.
										function(callback) {
											if(!new_accnt) {
												res.render('templates/invitation-accepted-user-email', {
													name: req.body.invitee_fName,
													event: req.body.event_name,
													address : 'http://frank.jou.ufl.edu/recruiters'
												}, function(err, emailHTML) {
													attendeeMailOptions.html = emailHTML;
													smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
														if(err) {
															callback(err, false);
														} else {
															callback(false, info.response);
														}
													});
												});
											} else {
												res.render('templates/invitation-accepted-attendee-email', {
													name: req.body.invitee_fName,
													event: req.body.event_name,
													password : pass,
													address : 'http://frank.jou.ufl.edu/recruiters'
												}, function(err, emailHTML) {
													attendeeMailOptions.html = emailHTML;
													smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
														if(err) {
															callback(err, false);
														} else {
															callback(false, info.response);
														}
													});
												});
											}
										},
										//Get recruiter information and send notification.
										function(callback) {
											User.findOne({email : req.body.recruiter_email}, function(err, result) {
												if(err) {
													callback(err, false);
												} else if(!result) {
													callback(true, false);
												} else {
													result.attendeeList.addToSet({event_id : evnt._id, user_id : attendee._id});
													result.save(function(err) {
														if(err) {
															return res.status(400).send({message : err});
														} else {
															res.render('templates/invitation-accepted-recruiter-email', {
																recruiter_name : result.fName,
																event: req.body.event_name,
																attendee_name: req.body.invitee_fName + " " + req.body.invitee_lName,
																address : 'http://frank.jou.ufl.edu/recruiters/!#/leaderboard'
															}, function(err, emailHTML) {
																recruiterMailOptions.html = emailHTML;
																smtpTransport.sendMail(recruiterMailOptions, function(err, info) {
																	if(err) {
																		callback(err, false);
																	} else {
																		callback(false, info.response);
																	}
																});
															});
														}
													});
												}
											});
										},
									],
										//Callback function.
										function(err, results) {
											if(err) {
												return res.status(400).send({message : err});
											} else {
												Event.findByIdAndUpdate(evnt._id, {$inc : {attending : 1, invited : -1}}, function(err) {
													if(err) {
														return res.status(400).send({message : "Error updating attending and invited.", error : err});
													} else {
														return res.status(200).send({message : "As expected, everything worked perfectly."});
													}
												});
											}
										}
									);
								}
							});
						}
					}
				});
			}
		});
	}
};

/**
* This function sends an email to the currently assigned programmer for this system as defined by the environment
* variable PROGRAMMER_EMAIL.  This route should be used mainly for problem reporting and enhancement requests.
* The user must be signed in to send an email.  The from and reply to fields will be set to the user's email.
*
* @param subject - email subject
* @param message - email message
*/
exports.emailProgrammer = function(req, res) {
	try {
		if(!req.isAuthenticated()) {
			return res.status(401).send({message : "User is not logged in."});
		} else if(!req.body.subject) {
			return res.status(400).send({message : "Required field not specified."});
		} else if(!req.body.message) {
			return res.status(400).send({message : "Required field not specified."});
		} else {
			var smtpTransport = nodemailer.createTransport(config.mailer.options);
			smtpTransport.sendMail({
				to : config.programmer.email,
				from : req.user.email,
				sender : req.user.email,
				replyTo : req.user.email,
				subject : req.body.subject,
				html : req.body.message
			}, function(err, info) {
				if(err) {
					return res.status(400).send({message : "Message was not sent.", error : err, info : info});
				} else {
					return res.status(200).send({message : "Email(s) sent!", info : info});
				}
			});
		}
	} catch(err) {
		console.log(err);
		return res.status(500).send();
	}
};
