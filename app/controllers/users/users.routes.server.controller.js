'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Candidate = mongoose.model('Candidate'),
	Comment = mongoose.model('Comment'),
	Email = mongoose.model('Email'),
	config = require('../../../config/config'),
	crypto = require('crypto'),
	path = require('path'),
	async = require('async');

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
	if(!req.body.event_id) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : "User is not logged in."});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin"])) {
		User.aggregate([
			{$unwind : "$status"},
			{$match : {
					$or : [
						{'rank.event_id' : new mongoose.Types.ObjectId(req.body.event_id)},
						{$and : [
								{'status.event_id' : new mongoose.Types.ObjectId(req.body.event_id)},
								{'status.recruiter' : true}
						]}
					]
				}
			},
			{$group : {
				_id : "$_id",
				displayName : {$first : "$displayName"},
				rank : {$first : "$rank"},
				inviteeList : {$first : "$inviteeList"},
				attendeeList : {$first : "$attendeeList"}
			}}
		], function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result.length) {
				res.status(400).send({message : 'No recruiters found!'});
			} else {
				for(var i=0; i<result.length; i++) {
					result[i].inviteeList = searchByEvent(req.body.event_id, result[i].inviteeList);
					result[i].attendeeList = searchByEvent(req.body.event_id, result[i].attendeeList);
					result[i].invited = result[i].inviteeList.length;
					result[i].attending = result[i].attendeeList.length;
					delete result[i].inviteeList;
					delete result[i].attendeeList;

					for(var j=0; j<result[i].rank.length; j++) {
						if(result[i].rank[j].event_id.toString() === req.body.event_id.toString()) {
							var temp = parseInt(result[i].rank[j].place);
							delete result[i].rank;
							result[i].place = temp;
							break;
						}
					}

					if(!result[i].place) {
						delete result[i].rank;
						result[i].place = Number.POSITIVE_INFINITY;
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
	if(!req.body.event_id) {
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

					/**
					* Search the database for an email to the attendee from the recruiter for this event that the attendee
					* has read.  If found, set the attendeeList[data.index].read = true; else set it to false.
					*
					* @param data - object with following fields
					* 					- attendeeEmail - email address for attendee
					* 					- index - index in attendeeList for this attendee's entry
					* @param cb - callback function that should handle errors if any occur
					*/
					var aqueue = async.queue(function(data, cb) {
						//Find an email to this attendee from this recruiter for this event that has been read.
						//If none are found, the attendee has not read any of this recruiter's emails.
						Email.findOne({to : data.attendeeEmail, from : req.user.email, event_id : eid, read : true}, function(err, result) {
							if(err) {
								cb(err);
							} else {
								if(!result) {
									attendeeList[data.index].read = false;
								} else {
									attendeeList[data.index].read = true;
								}

								cb(false);
							}
						});
					});

					var aqueueErrors = false;
					var aqueueCallback = function(err) {
						if(err) {
							aqueueErrors = err;
						}
					};

					aqueue.drain = function() {
						if(aqueueErrors) {
							return res.status(400).send(err);
						} else {
							return res.status(200).send(attendeeList);
						}
					};

					aqueue.pause();
					var attendeeList = [];
					for(var i = 0; i < populatedAttendees.length; i++) {
						populatedAttendees[i].attendeeList.user_id = populatedAttendees[i].attendeeList.user_id.toObject();
						
						aqueue.push({attendeeEmail : populatedAttendees[i].attendeeList.user_id.email, index : i}, aqueueCallback);

						attendeeList.push(populatedAttendees[i].attendeeList.user_id);
					}
					aqueue.resume();
				});
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the invitee list of the currently logged in recruiter for the event specified.
*/
exports.getRecruiterInvitees = function(req, res) {
	if(!req.body.event_id) {
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

					/**
					* Search the database for an email to the invitee from the recruiter for this event that the invitee
					* has read.  If found, set the inviteeList[data.index].read = true; else set it to false.
					*
					* @param data - object with following fields
					* 					- inviteeEmail - email address for invitee
					* 					- index - index in inviteeList for this invitee's entry
					* @param cb - callback function that should handle errors if any occur
					*/
					var aqueue = async.queue(function(data, cb) {
						//Find an email to this invitee from this recruiter for this event that has been read.
						//If none are found, the invitee has not read any of this recruiter's emails.
						Email.findOne({to : data.inviteeEmail, from : req.user.email, event_id : eid, read : true}, function(err, result) {
							if(err) {
								cb(err);
							} else {
								if(!result) {
									inviteeList[data.index].read = false;
								} else {
									inviteeList[data.index].read = true;
								}

								cb(false);
							}
						});
					});

					var aqueueErrors = false;
					var aqueueCallback = function(err) {
						if(err) {
							aqueueErrors = err;
						}
					};

					aqueue.drain = function() {
						if(aqueueErrors) {
							return res.status(400).send(err);
						} else {
							return res.status(200).send(inviteeList);
						}
					};

					aqueue.pause();
					var inviteeList = [];
					for(var i = 0; i < populatedInvitees.length; i++) {
						populatedInvitees[i].inviteeList.user_id = populatedInvitees[i].inviteeList.user_id.toObject();
						
						aqueue.push({inviteeEmail : populatedInvitees[i].inviteeList.user_id.email, index : i}, aqueueCallback);

						inviteeList.push(populatedInvitees[i].inviteeList.user_id);
					}
					aqueue.resume();
				});
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the almost list of the currently logged in recruiter for the event specified.
*/
exports.getRecruiterAlmosts = function(req, res) {
	if(!req.body.event_id) {
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

					/**
					* Search the database for an email to the attendee from the recruiter for this event that the attendee
					* has read.  If found, set the almostList[data.index].read = true; else set it to false.
					*
					* @param data - object with following fields
					* 					- almostEmail - email address for attendee
					* 					- index - index in almostList for this attendee's entry
					* @param cb - callback function that should handle errors if any occur
					*/
					var aqueue = async.queue(function(data, cb) {
						//Find an email to this attendee from this recruiter for this event that has been read.
						//If none are found, the attendee has not read any of this recruiter's emails.
						Email.findOne({to : data.almostEmail, from : req.user.email, event_id : eid, read : true}, function(err, result) {
							if(err) {
								cb(err);
							} else {
								if(!result) {
									almostList[data.index].read = false;
								} else {
									almostList[data.index].read = true;
								}

								cb(false);
							}
						});
					});

					var aqueueErrors = false;
					var aqueueCallback = function(err) {
						if(err) {
							aqueueErrors = err;
						}
					};

					aqueue.drain = function() {
						if(aqueueErrors) {
							return res.status(400).send(err);
						} else {
							return res.status(200).send(almostList);
						}
					};

					aqueue.pause();
					var almostList = [];
					for(var i = 0; i < populatedAlmosts.length; i++) {
						populatedAlmosts[i].almostList.user_id = populatedAlmosts[i].almostList.user_id.toObject();
						
						aqueue.push({almostEmail : populatedAlmosts[i].almostList.user_id.email, index : i}, aqueueCallback);

						almostList.push(populatedAlmosts[i].almostList.user_id);
					}
					aqueue.resume();
				});
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Retrieve the list of all people who are signed up to attend the event.
*/
exports.getAttendees = function(req, res) {
	if(!req.body.event_id) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		async.parallel([
			function(next) {
				User.aggregate([
					{$match : {$or : [{roles : 'recruiter'}, {roles : 'admin'}]}},
					{$project : {recruiterName : "$displayName", attendeeList : 1, _id : 0}},
					{$unwind : "$attendeeList"},
					{$match : {"attendeeList.event_id" : new mongoose.Types.ObjectId(req.body.event_id)}}
				], function(err, results) {
					if(err) {
						next(err, false);
					} else if(!results || !results.length) {
						next(false, []);
					} else {
						User.populate(
							results, {
								path : "attendeeList.user_id",
								model : 'User',
								select : 'displayName organization'
							}, function(err, pResults) {
								if(err) {
									next(err, false);
								} else {
									for(var i=0; i<pResults.length; i++) {
										//If this user was deleted, just delete the record.
										if(pResults[i].attendeeList.user_id) {
											pResults[i].attendeeName = pResults[i].attendeeList.user_id.displayName;
											pResults[i].organization = pResults[i].attendeeList.user_id.organization;
											pResults[i]._id = pResults[i].attendeeList.user_id._id;

											delete pResults[i].attendeeList;
										} else {
											pResults.splice(i--, 1);
										}
									}

									next(false, pResults);	
								}
							}
						);
					}
				});
			}, function(next) {
				User.aggregate([
					{$unwind : "$status"},
					{$match : {$and : [{'status.event_id' : new mongoose.Types.ObjectId(req.body.event_id), 'status.attending' : true}]}},
					{$project : {attendeeName : "$displayName", organization : 1, recruiterName : {$literal : "N/A"}}}
				],	function(err, results) {
						if(err) {
							next(err, false);
						} else {
							next(false, results);
						}
					}
				);
			}
		], function(err, results) {
			if(err) {
				console.log(err);
				return res.status(400).send({message : err.toString()});
			} else {
				/**
				* After performing several tests on jsperf.com
				* (http://jsperf.com/removing-duplicates-using-hashmap/4), it appears that a linear search for
				* duplicates performs the better than using a sort method such as merge sort or using a hash map.
				* These tests were performed on a dataset of 100+ records with a same format to the one expected.
				*/

				var attendees = results[0].concat(results[1]);

				for(var i = 0; i < attendees.length; i++) {
					for(var j = (i + 1); j < attendees.length; j++) {
						if(attendees[i]._id.toString() === attendees[j]._id.toString()) {
							if(attendees[i].recruiterName === "N/A") {
								attendees.splice(i, 1);

								j = i + 1;
							} else {
								attendees.splice(j, 1);

								--j;
							}
						}
					}
				}

				return res.status(200).send(attendees);
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
	if(!req.body.event_id) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		User.aggregate([
			{$match : {$or : [{roles : 'recruiter'}, {roles : 'admin'}]}},
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
		if(!req.query.event_id) {
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

