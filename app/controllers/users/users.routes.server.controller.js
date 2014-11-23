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
	config = require('../../../config/config'),
	crypto = require('crypto'),
	async = require('async');

/*
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

/*
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

/*
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


/*
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

/*
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
		query.populate('inviteeList.user_id', 'displayName email');
		query.populate('attendeeList.user_id', 'displayName email');
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

/*
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
					if(result.status[i].recruiter) {
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
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ["recruiter", "admin", "attendee"])) {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('status');
		query.populate('status.event_id');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).json({message : 'User not found or is not associated with any events!'});
			} else {
				res.status(200).send(result);
			}
		});
	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
	}
};

/*
* Get the list of attendees for the event specified and the recruiter that is currently logged in.
*/
/*This method will need to be modified so it will return only the attendees for the specified event.  This should be simple,
simply replace the the definition of query with the following line:
	var query = User.findOne({'_id' : id, 'attendeeList.event_id' : req.});*/
exports.getRecruiterAttendees = function(req, res) {
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('attendeeList');
		query.populate('attendeeList.user_id', 'displayName email');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result || !result.attendeeList.length) {
				res.status(400).json({'message' : 'User not found or nobody the user invited has signed up to attend yet.'});
			} else {
				var attendeeList = [], j=0;
				for(var i=0; i<result.attendeeList.length; i++) {
					if(result.attendeeList[i].event_id.toString() === req.body.event_id.toString()) {
						attendeeList[j] =result.attendeeList[i];
						j++;
					}
				}
				res.status(200).send(attendeeList);
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
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('inviteeList');
		query.populate('inviteeList.user_id', 'displayName email');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result || !result.inviteeList.length) {
				res.status(400).json({'message' : 'User not found or the user has not invited anybody yet.'});
			} else {
				var inviteeList = [], j=0;
				for(var i=0; i<result.inviteeList.length; i++) {
					if(result.inviteeList[i].event_id.toString() === req.body.event_id.toString()) {
						inviteeList[j] =result.inviteeList[i];
						j++;
					}
				}
				res.status(200).send(inviteeList);
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
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var id = req.user._id;
		var query = User.findOne({'_id' : id});
		query.select('almostList');
		query.populate('almostList.user_id', 'displayName email');
		query.exec(function(err, result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result || !result.almostList.length) {
				res.status(400).json({'message' : 'User not found or the user has not invited anybody yet.'});
			} else {
				var almostList = [], j=0;
				for(var i=0; i<result.almostList.length; i++) {
					if(result.almostList[i].event_id.toString() === req.body.event_id.toString()) {
						almostList[j] =result.almostList[i];
						j++;
					}
				}
				res.status(200).send(almostList);
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
	if(req.body.event_id == undefined) {
		res.status(400).send({'message' : 'Event not specified.'});
		return;
	}
	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		User.aggregate([
			{$match : {roles : 'recruiter', "status.event_id" : new mongoose.Types.ObjectId(req.body.event_id), "status.recruiter" : true}},
			{$project : {recruiterName : "$displayName", attendeeList : 1, _id : -1}},
			{$unwind : "$attendeeList"},
			{$match : {"attendeeList.event_id" : new mongoose.Types.ObjectId(req.body.event_id)}}
		], function(err, results) {
			if(err) {
				res.status(400).send(err);
			} else if(!results || !results.length) {
				res.status(400).json({'message' : 'Nobody is attending yet.', 'result' : result});
			} else {
				User.populate(
					results, {
						path : "attendeeList.user_id",
						model : 'User',
						select : 'displayName -_id'
					}, function(err, pResults) {
						if(err) {
							res.status(400).send({message : err});
						} else {
							for(var i=0; i<pResults.length; i++) {
								pResults[i].attendeeName = pResults[i].attendeeList.user_id.displayName;
								delete pResults[i].attendeeList;
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
								pResults[i].inviteeName = pResults[i].inviteeList.user_id.displayName;
								delete pResults[i].inviteeList;
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

/*
* This method sends an invitation to the invitee through the recruiter's email address.  If the invitee has not been invited before, the invitee is added to our database.  If the
* invitee has been invited before, but is not attending, this invitee is simply added to the recruiter's inviteeList.  In either of these cases, the recruiter's rank may have changed
* so their rank for this event must be updated.  However, if the user has been invited and is already attending the specified event, the invitee will be added to their almostList.
* Since the almostList does not affect the recruiter's rank, their rank does not have to be updated.
*
* TODO: A much more efficient method for updating this information, especially the recruiter's rank, should be researched and used when time permits.
*/
exports.sendInvitation = function(req, res) {
	if(req.body.fName == undefined || req.body.lName == undefined || req.body.email == undefined || req.body.event_id == undefined || req.body.event_name == undefined) {
		res.status(400).send({'message' : 'Required fields not specified.'});
		return;
	}

	if(!req.isAuthenticated()) {
		res.status(401).send({'message' : 'User is not logged in.'});
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
				res.status(400).send({'message' : 'User is not logged in or does not have permissions.'});
			} else if(!recruiter) {
				res.status(400).send({'message' : 'Recruiter not found.'});
			} else {
				var query2 = User.findOne({'email' : req.body.email, 'status.event_id' : req.body.event_id, 'status.attending' : true});
				query2.exec(function(err, invitee) {
					if(err) {
						res.status(400).send({'message' : 'Invitation could not be sent.  Please contact frank about this issue.'});
		
					//Either the specified user is not attending the event yet or has not even been invited.
					} else if(!invitee) {
						async.waterfall([
							function(callback) {
								User.findOne({'email' : req.body.email}, function(err, result) {
									if(err) {
										callback(true, null);//res.status(400).send({'message' : 'Invitation sent, but could not be added to Leaderboard.  Please contact frank with invitee information to get credit for this invitation.'});
									} else if(!result) {
										//Invitee is not in the db yet.  Add the invitee to the db and send the new User object to the next function.
										var newUser = new User({
											fName : req.body.fName,
											lName : req.body.lName,
											email : req.body.email,
											roles : ['attendee'],
											login_enabled : false,
											displayName : req.body.lName + ', ' + req.body.fName,
											status : [{'event_id' : req.body.event_id, 'attending' : false, 'recruiter' : false}],
											password : tempPass()
										});

										newUser.save(function(err, result2) {
											callback(err, result2);
										});
									} else {
										//Invitee is already in the db, send the User object to the next function to be added to the recruiter's inviteeList.
										callback(null, result);
									}
								});
							},
							function(invitee, callback) {
								//Add the invitee to the recruiter's inviteeList.
								recruiter.inviteeList.addToSet({'event_id' : req.body.event_id, 'user_id' : invitee._id});
								recruiter.save(function(err, result) {
									if(err) {
										callback(true, null);
									} else {
										callback(null, invitee);
									}
								});
							},
							function(invitee, callback) {
								res.render('templates/invitation-email', {
									name: req.body.fName,
									event: req.body.event_name,
									message: req.body.message
								}, function(err, emailHTML) {
									mailOptions.html = emailHTML;
									callback(err, invitee);
								});
							}
						], function(err, invitee) {
							if(err) {
								res.status(400).send({'message' : "Invitation was not sent.  We could not connect to the server, please try again later."});
							} else {
								smtpTransport.sendMail(mailOptions, function(err) {
									if(err) {
										res.status(400).send({'message' : 'Invitation was not sent.  Please try again later.', 'error' : err});
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
												});
											}],
											function(err, results) {
												if(err) {
													res.status(400).send({message: 'Invitation has been sent to ' + req.body.fName + ', but an error occurred.  Please contact frank about this error.'});
												} else {
													res.status(200).send({message: 'Invitation has been sent to ' + req.body.fName + '!'});
												}
											}
										);
									}
								});
							}
						});
					
					//This user has already been invited and is attending this event.
					} else {
						recruiter.almostList.addToSet({'event_id' : req.body.event_id, 'user_id' : invitee._id});
						recruiter.save(function(err, result) {
							res.status(200).send({message: req.body.fName + ' ' + req.body.lName + ' is already attending frank.  You\'re thinking of the right people '});
						});
					}
				});
			}
		});

	} else {
		res.status(401).send({'message' : 'User does not have permission.'});
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
*/
exports.acceptInvitation = function(req, res) {
	
};
