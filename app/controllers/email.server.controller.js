'use strict';

/**
* Module dependencies
*/
var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	nodemailer = require('nodemailer'),
	sgTransport = require('nodemailer-sendgrid-transport'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Candidate = mongoose.model('Candidate'),
	Email = mongoose.model('Email'),
	config = require('../../config/config'),
	crypto = require('crypto'),
	async = require('async'),
	path = require('path'),
	bufEqual = require('buffer-equal-constant-time');


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
	var pwd = '';
	while(!pwd) {
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?.";
		var password = [];
		var salt = '';

		for (var i=0; i<5; i++) {
			salt += chars[Math.round(_.random(0, 1, true) * (chars.length - 1))];
		}

		var pos = _.random(0, 2, false);
		password[pos] = salt;

		for(var i=0; i<3; i++) {
			if(!password[i]) {
				password[i] = _.random(0, credentialsArr.length, false);
			}
		}

		pwd = password.join('');
	}

	return pwd;
};

/**
* Update the rank of all recruiters for the specified event.
*/
var updateRanks = function(event_id, cb) {
	var mapReduceObj = {};
	mapReduceObj.map = function() {
		var isAdmin = false;
		var isRecruiter = false;

		for(var i = 0; i < this.roles.length; i++) {
			if(this.roles[i] === 'admin') {
				isAdmin = true;
				break;
			} else if(this.roles[i] === 'recruiter') {
				isRecruiter = true;
			}
		}

		var event_idStringified = event_id.valueOf();

		if(isAdmin) {
			var hasPoints = false;		//Does the user have any points?

			if(this.attendeeList) {
				for(var j = 0, attendeeLength = this.attendeeList.length; j < attendeeLength; j++) {
					if(this.attendeeList[j].event_id.valueOf() === event_idStringified) {
						emit(this._id, 10);		//People attending are worth 10 points.
						hasPoints = true;
					}
				}
			}

			if(this.inviteeList) {
				for(var j = 0, inviteeLength = this.inviteeList.length; j < inviteeLength; j++) {
					if(this.inviteeList[j].event_id.valueOf() === event_idStringified) {
						emit(this._id, 0.5);	//People invited are worth 0.5 points.  The only time invites will make a big enough contribution is when there is a tie between recruiters from number of people attending.
						hasPoints = true;
					}
				}
			}

			if(!hasPoints) {
				emit(this._id, 0);
			}
		} else if(isRecruiter) {
			for(var i = 0, statusLength = this.status.length; i < statusLength; i++) {
				if(this.status[i].event_id.valueOf() === event_idStringified) {
					if(!this.status[i].recruiter) {
						break;
					}

					var hasPoints = false;		//Does the user have any points?

					if(this.attendeeList) {
						for(var j = 0, attendeeLength = this.attendeeList.length; j < attendeeLength; j++) {
							if(this.attendeeList[j].event_id.valueOf() === event_idStringified) {
								emit(this._id, 10);		//People attending are worth 10 points.
								hasPoints = true;
							}
						}
					}

					if(this.inviteeList) {
						for(var j = 0, inviteeLength = this.inviteeList.length; j < inviteeLength; j++) {
							if(this.inviteeList[j].event_id.valueOf() === event_idStringified) {
								emit(this._id, 0.5);	//People invited are worth 0.5 points.  The only time invites will make a big enough contribution is when there is a tie between recruiters from number of people attending.
								hasPoints = true;
							}
						}
					}

					if(!hasPoints) {
						emit(this._id, 0);
					}

					break;
				}
			}
		}
	};

	mapReduceObj.reduce = function(recruiterId, points) {
		var totalPoints = 0;
		var pointsLength = points.length;

		for(var i = 0; i < pointsLength; i++) {
			totalPoints += points[i];
		}

		return totalPoints;
	};

	mapReduceObj.scope = {event_id : event_id};
	mapReduceObj.sort = {_id : 1};
	mapReduceObj.query = {roles : {"$in" : ['admin', 'recruiter']}};

	User.mapReduce(mapReduceObj, function(err, result) {
		if(err) {
			console.log("Error updating inviteeLists/almostLists (1): " + err);
			cb(err);
		} else if(!result || !result.length) {
			cb(null);
		} else {
			var aqueue = async.queue(function(recruiter, callback) {
				User.update(
					{"_id" : recruiter._id, "rank.event_id" : event_id},
					{$set : {"rank.$.place" : recruiter.place}},
					function(err, numAffected) {
						if(err) {
							return callback(err);
						} else if(numAffected === 0) {
							User.update(
								{_id : recruiter._id},
								{$addToSet : {rank : {event_id : event_id, place : recruiter.place}}},
								callback
							);
						} else {
							callback(false);
						}
					}
				);
			}, 20);

			var errs = false;
			var task_cb = function(err, result) {
				if(err) {
					errs = err;
					console.log("Error updating inviteeLists/almostLists (2): " + err);
				}
			};

			var sortedResults = result.sort(function(a, b) {
				return b.value - a.value;
			});

			aqueue.pause();
			for(var i=0, resultsLength = sortedResults.length; i < resultsLength; i++) {
				var recruiter = {'_id' : sortedResults[i]._id, 'place' : (i + 1)};
				aqueue.push(recruiter, task_cb);
			}
			aqueue.resume();

			var timer;
			var aQueueDrain = function() {
				if(aqueue.length() === 0 && aqueue.running() === 0) {
					//The queue is in deed empty and we can move on.
					if(timer) {
						clearTimeout(timer);
						timer.unref();
					}

					cb(errs);
				} else {
					//The queue is not empty.  Just in case, set a timeout to check again in 20ms.
					if(timer) {
						clearTimeout(timer);
						timer.unref();

						timer = null;
					}

					timer = setTimeout(aQueueDrain, 500);
				}
			};

			aqueue.drain = aQueueDrain;
		}
	});
};

/**
* Update all recruiter's lists so as to reflect a new user attending an event.  Users that have invited the new
* attendee will have their inviteeList reduced (the attendee will be removed) and almostList increased (the
* attendee will be added).  This method must be called AFTER setting the victorious recruiter's attendeeList
* and inviteeList to reflect their win.
*
* @param user_id - new attendee's id
* @param event_id - id of event to update
*/
var updateEventLists = function(user_id, event_id, callback) {
	event_id = new mongoose.Types.ObjectId(event_id);
	user_id = new mongoose.Types.ObjectId(user_id);

	User.find().elemMatch("inviteeList", {"event_id" : event_id, "user_id" : user_id}).exec(function(err, recruiters) {
		if(err) {
			console.log("Error updating inviteeLists/almostLists (1): " + err);
			callback(err);
		} else if(!recruiters || !recruiters.length) {
			callback(null);
		} else {
			var aqueue = async.queue(function(recruiter, cb) {
				User.findOneAndUpdate(
					{_id : recruiter._id},
					{$push : {almostList : {event_id : event_id, user_id : user_id}}, $pull : {inviteeList : {event_id : event_id, user_id : user_id}}},
					function(err) {
						if(err) {
							console.log("Error updating inviteeLists/almostLists (2): " + err);
							cb(err);
						} else {
							cb(null);
						}
					}
				);

				// var index = 0;

				// for(; index < recruiter.inviteeList.length; index++) {
				// 	if(recruiter.inviteeList[index].event_id.toString() === event_id.toString() && recruiter.inviteeList[index].user_id.toString() === user_id.toString()) {
				// 		break;
				// 	}
				// }

				// recruiter.almostList.push({event_id : event_id, user_id : user_id});
				// recruiter.inviteeList.pull({event_id : event_id, user_id : user_id});

				// recruiter.save(function(err) {
				// 	if(err) {
				// 		console.log("Error updating inviteeLists/almostLists (2): " + err);
				// 		cb(err);
				// 	} else {
				// 		cb(null);
				// 	}
				// });
			}, 10000);

			var errs = false;
			var task_cb = function(err) {
				if(err) {
					errs = err;
				}
			};

			aqueue.pause();
			for(var i = 0; i < recruiters.length; i++) {
				aqueue.push(recruiters[i], task_cb);
			}
			aqueue.resume();

			var timer;
			var aQueueDrain = function() {
				if(aqueue.length() === 0 && aqueue.running() === 0) {
					//The queue is in deed empty and we can move on.
					if(timer) {
						clearTimeout(timer);
						timer.unref();
					}

					callback(errs);
				} else {
					//The queue is not empty.  Just in case, set a timeout to check again in 20ms.
					if(timer) {
						clearTimeout(timer);
						timer.unref();

						timer = null;
					}

					timer = setTimeout(aQueueDrain, 20);
				}
			};

			aqueue.drain = aQueueDrain;
		}
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
	if(!req.body.fName || !req.body.lName || !req.body.email || !req.body.event_id || !req.body.event_name) {
		return res.status(400).send({'message' : 'Required fields not specified.'});
	}

	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else if(req.hasAuthorization(req.user, ['recruiter', 'admin'])) {
		var invitationEmail = new Email({
			to: 		req.body.email,
			from: 		req.user.email,
			subject: 	"You're Invited to " + req.body.event_name,
			event_id: 	new mongoose.Types.ObjectId(req.body.event_id)
		});

		var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
		var mailOptions = {
			to: 		invitationEmail.to,
			from: 		invitationEmail.from,
			sender: 	invitationEmail.from,
			replyTo: 	invitationEmail.from,
			subject: 	invitationEmail.subject
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
				var isAdmin = req.hasAuthorization(req.user, ['admin']);
				var tempi = 0;
				if(!isAdmin) {
					for(; tempi < recruiter.status.length; tempi++) {
						if(recruiter.status[tempi].event_id.toString() === req.body.event_id.toString()) {
							if(!recruiter.status[tempi].recruiter || !recruiter.status[tempi].active) {
								//This user should not be recruiting for this event.
								return res.status(401).send({message : 'User does not have permission to send invitations for this event.'});
							}

							break;
						}
					}
				}

				if(tempi === recruiter.status.length && !isAdmin) {
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
										callback(err, null);
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
											if(err) {
												callback(err, null);
											}

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

											User.findByIdAndUpdate(result._id, {status : {
												$addToSet : {
													event_id : evnt_id,
													attending : false,
													recruiter : false
												}
											}}, function(err, updatedUser) {
												if(err) {
													callback(err, null);
												}

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
										callback(err, null);
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

								var filepath = path.normalize(__dirname + "/../views/templates/preview/" + fileName.toLowerCase());

								res.render(filepath, {
									recruiter_name: req.user.fName,
									receiver_name: req.body.fName,
									event_name: req.body.event_name,
									message: req.body.message,
									email_id: invitationEmail._id.toString()
								}, function(err, emailHTML) {
									invitationEmail.message = mailOptions.html = emailHTML;
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
								console.error("Line 418", err);
								return res.status(400).send({'message' : "Invitation was not sent.  We could not connect to the server, please try again later."});
							} else {
								smtpTransport.sendMail(mailOptions, function(err) {
									if(err) {
										console.error("Error sending message: ", err);
										return res.status(400).send({'message' : 'Invitation was not sent.  Please try again later.', 'error' : err});
									} else {
										async.parallel([
											function(next) {
												updateRanks(req.body.event_id, function(err) {
													next(err, true);
												});
											}, function(next) {
												var super_next = next;
												invitationEmail.save(function(err) {
													if(err) {
														console.log(err);
														super_next(err, false);
													}

													super_next(false, true);
												});
											}],
											function(err, results) {
												if(err) {
													console.log("Line 435", err);
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
*/
exports.acceptInvitation = function(req, res) {
	//We will use an API key to determine whether or not this is an authenticated request.
	if(!req.body.api_key) {
		return res.status(400).send({message : 'You are not authorized to make this request.'});
	}
	
	var api_key = new Buffer(req.body.api_key),
		zapier_api = new Buffer(config.zapier_api);

	if(!bufEqual(api_key, zapier_api)) {
		//bufEqual is not truly constant time.  Let's sleep a random amount of time to confuse any possible attackers.
		//This method is not perfect, but it will add an extra layer of security and may work against some unsophisticated attackers.
		crypto.randomBytes(32, function(err, buf) {
			if(err) {
				return res.status(400).send({message : 'You are not authorized to make this request.'});
			}

			var timeouts = [];
			timeouts[0] = buf.readUInt8BE(0);
			timeouts[1] = buf.readUInt8BE(8);
			timeouts[2] = buf.readUInt8BE(16);
			timeouts[3] = buf.readUInt8BE(24);

			var timeoutMillis = Math.ceil(timeouts[0] + timeouts[1] + timeouts[2] + timeouts[3]);
			console.log(timeoutMillis);
			setTimeout(function() {
				return res.status(400).send({message : 'You are not authorized to make this request.'});
			}, timeoutMillis);
		});
	} else {
		/**
		* These are the fields we will expect from Zapier.  We need to check to make sure
		* they are specified in the request and have a typeof value of 'string'.  If both
		* of these conditions are not met, we will return a 400 error.
		*/

		var expectedFields = ['api_key', 'invitee_fName', 'invitee_lName', 'invitee_email', 'organization', 'event_name', 'recruiter_email'];

		for(var i=0; i<expectedFields.length; i++) {
			if(!req.body[expectedFields[i]]) {
				return res.status(400).send({message : 'All required fields not specified.'});
			} else if(typeof req.body[expectedFields[i]] !== 'string') {
				return res.status(400).send({message : 'Illegal value for field ' + expectedFields[i] + '.'});
			}
		}

		//If the recruiter field does not specify a recruiter, set the field to null.
		if(req.body.recruiter_email === "Other" || req.body.recruiter_email === "The frank team - I'm an original") {
			req.body.recruiter_email = null;
		}

		//Remove the name from the recruiter field.
		if(req.body.recruiter_email) {
			var startRegex = /.*?\(/g;
			var endRegex = /\).*/g;
			req.body.recruiter_email = req.body.recruiter_email.replace(startRegex, '');
			req.body.recruiter_email = req.body.recruiter_email.replace(endRegex, '');
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
									var attendeeEmail = new Email({
										to: 		req.body.invitee_email,
										from: 		'frank@jou.ufl.edu',
										sender: 	'frank@jou.ufl.edu',
										replyTo: 	'frank@jou.ufl.edu',
										subject: 	'New frank Account for ' + req.body.event_name,
										event_id: 	evnt._id
									});

									var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
									var attendeeMailOptions = {
										to: 		attendeeEmail.to,
										from: 		attendeeEmail.from,
										sender: 	attendeeEmail.from,
										replyTo: 	attendeeEmail.from,
										subject: 	attendeeEmail.subject
									};

									if(req.body.recruiter_email) {
										var recruiterEmail = new Email({
											to: 		req.body.recruiter_email,
											from: 		'frank@jou.ufl.edu',
											sender: 	'frank@jou.ufl.edu',
											replyTo: 	'frank@jou.ufl.edu',
											subject: 	'Yet Another Invitation Accepted',
											event_id: 	evnt._id
										});

										var recruiterMailOptions = {
											to: 		recruiterEmail.to,
											from: 		recruiterEmail.from,
											sender: 	recruiterEmail.from,
											replyTo: 	recruiterEmail.from,
											subject: 	recruiterEmail.subject
										};
									}
									
									async.parallel([
										//Send message to attendee.
										function(callback) {
											res.render('templates/invitation-accepted-attendee-email', {
												name: req.body.invitee_fName,
												event: req.body.event_name,
												password : pass,
												address : 'http://frank.jou.ufl.edu/recruiters',
												email_id: attendeeEmail._id.toString()
											}, function(err, emailHTML) {
												attendeeEmail.message = attendeeMailOptions.html = emailHTML;
												smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
													if(err) {
														callback(err, false);
													} else {
														attendeeEmail.save(function(err) {
															if(err) {
																callback(err, false);
															} else {
																callback(false, info.response);
															}
														});
													}
												});
											});
										},
										//Get recruiter information and send notification.
										function(callback) {
											if(req.body.recruiter_email) {
												User.findOne({email : req.body.recruiter_email}, function(err, result) {
													if(err) {
														callback(err, false);
													} else if(!result) {
														callback(new Error("Recruiter not found."), false);
													} else {
														User.update(
															{_id : result._id},
															{$pull : {inviteeList : {event_id : evnt._id, user_id : newAttendee._id}}, $push : {attendeeList : {event_id : evnt._id, user_id : newAttendee._id}}},
															function(err) {
																if(err) {
																	return callback(err, false);
																}

																updateEventLists(newAttendee._id, evnt._id, function(err) {
																	if(err) {
																		//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
																		console.log(err);
																	}
																	updateRanks(evnt._id, function(err) {
																		if(err) {
																			//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
																			console.log(err);
																		}
																		res.render('templates/invitation-accepted-recruiter-email', {
																			recruiter_name : result.fName,
																			event: req.body.event_name,
																			attendee_name: req.body.invitee_fName + " " + req.body.invitee_lName,
																			address : 'http://frank.jou.ufl.edu/recruiters/!#/leaderboard',
																			email_id: recruiterEmail._id.toString()
																		}, function(err, emailHTML) {
																			recruiterEmail.message = recruiterMailOptions.html = emailHTML;
																			smtpTransport.sendMail(recruiterMailOptions, function(err, info) {
																				if(err) {
																					callback(err, false);
																				} else {
																					recruiterEmail.save(function(err) {
																						if(err) {
																							callback(err, false);
																						} else {
																							callback(false, info.response);
																						}
																					});
																				}
																			});
																		});
																	});
																});
															}
														);
													}
												});
											} else {
												updateEventLists(newAttendee._id, evnt._id, function(err) {
													if(err) {
														//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
														console.log(err);
													}

													callback(false, true);
												});
											}
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
									var attendeeEmail = new Email({
										to: 		req.body.invitee_email,
										from: 		'frank@jou.ufl.edu',
										sender: 	'frank@jou.ufl.edu',
										replyTo: 	'frank@jou.ufl.edu',
										subject: 	'New frank Account for ' + req.body.event_name,
										event_id: 	evnt._id
									});

									var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
									var attendeeMailOptions = {
										to: 		attendeeEmail.to,
										from: 		attendeeEmail.from,
										sender: 	attendeeEmail.from,
										replyTo: 	attendeeEmail.from,
										subject: 	attendeeEmail.subject
									};

									if(req.body.recruiter_email) {
										var recruiterEmail = new Email({
											to: 		req.body.recruiter_email,
											from: 		'frank@jou.ufl.edu',
											sender: 	'frank@jou.ufl.edu',
											replyTo: 	'frank@jou.ufl.edu',
											subject: 	'Yet Another Invitation Accepted',
											event_id: 	evnt._id
										});

										var recruiterMailOptions = {
											to: 		recruiterEmail.to,
											from: 		recruiterEmail.from,
											sender: 	recruiterEmail.from,
											replyTo: 	recruiterEmail.from,
											subject: 	recruiterEmail.subject
										};
									}
									
									async.parallel([
										//Send message to attendee.
										function(callback) {
											if(!new_accnt) {
												res.render('templates/invitation-accepted-user-email', {
													name: req.body.invitee_fName,
													event: req.body.event_name,
													address : 'http://frank.jou.ufl.edu/recruiters',
													email_id: attendeeEmail._id.toString()
												}, function(err, emailHTML) {
													attendeeEmail.message = attendeeMailOptions.html = emailHTML;
													smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
														if(err) {
															callback(err, false);
														} else {
															attendeeEmail.save(function(err) {
																if(err) {
																	callback(err, false);
																} else {
																	callback(false, info.response);
																}
															});
														}
													});
												});
											} else {
												res.render('templates/invitation-accepted-attendee-email', {
													name: req.body.invitee_fName,
													event: req.body.event_name,
													password : pass,
													address : 'http://frank.jou.ufl.edu/recruiters',
													email_id: attendeeEmail._id.toString()
												}, function(err, emailHTML) {
													attendeeEmail.message = attendeeMailOptions.html = emailHTML;
													smtpTransport.sendMail(attendeeMailOptions, function(err, info) {
														if(err) {
															callback(err, false);
														} else {
															attendeeEmail.save(function(err) {
																if(err) {
																	callback(err, false);
																} else {
																	callback(false, info.response);
																}
															});
														}
													});
												});
											}
										},
										//Get recruiter information and send notification.
										function(callback) {
											if(req.body.recruiter_email) {
												User.findOne({email : req.body.recruiter_email}, function(err, result) {
													if(err) {
														callback(err, false);
													} else if(!result) {
														callback(true, false);
													} else {
														User.update(
															{_id : result._id},
															{$pull : {inviteeList : {event_id : evnt._id, user_id : attendee._id}}, $push : {attendeeList : {event_id : evnt._id, user_id : attendee._id}}},
															function(err) {
																if(err) {
																	return callback(err, false);
																}

																updateEventLists(attendee._id, evnt._id, function(err) {
																	if(err) {
																		//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
																		console.log(err);
																	}
																	updateRanks(evnt._id, function(err) {
																		if(err) {
																			//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
																			console.log(err);
																		}
																		res.render('templates/invitation-accepted-recruiter-email', {
																			recruiter_name : result.fName,
																			event: req.body.event_name,
																			attendee_name: req.body.invitee_fName + " " + req.body.invitee_lName,
																			address : 'http://frank.jou.ufl.edu/recruiters/!#/leaderboard',
																			email_id: recruiterEmail._id.toString()
																		}, function(err, emailHTML) {
																			recruiterEmail.message = recruiterMailOptions.html = emailHTML;
																			smtpTransport.sendMail(recruiterMailOptions, function(err, info) {
																				if(err) {
																					callback(err, false);
																				} else {
																					recruiterEmail.save(function(err) {
																						if(err) {
																							callback(err, false);
																						} else {
																							callback(false, info.response);
																						}
																					});
																				}
																			});
																		});
																	});
																});
															}
														);
													}
												});
											} else {
												updateEventLists(attendee._id, evnt._id, function(err) {
													if(err) {
														//There's not much we can/should do at this point.  Returning an error would keep us from notifying the recruiter.  Resending this request from Zapier would cost extra mulah.  Since the error was logged already, we will ignore the error from here.
														console.log(err);
													}

													callback(false, true);
												});
											}
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
* @param event_id - the event the user was viewing when reporting the problem
*/
exports.emailProgrammer = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.body.subject) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.message) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.event_id) {
		return res.status(400).send({message : "Required field not specified."});
	} else {
		var programmerEmail = new Email({
			to: 		config.programmer.email,
			from: 		req.user.email,
			subject: 	req.body.subject,
			message: 	req.body.message,
			event_id: 	new mongoose.Types.ObjectId(req.body.event_id)
		});
		var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));
		smtpTransport.sendMail({
			to: 		programmerEmail.to,
			from: 		programmerEmail.from,
			sender: 	programmerEmail.from,
			replyTo: 	programmerEmail.from,
			subject: 	programmerEmail.subject,
			html: 		programmerEmail.message
		}, function(err, info) {
			if(err) {
				return res.status(400).send({message : "Message was not sent.", error : err, info : info});
			} else {
				programmerEmail.save(function(err) {
					//Since the message was sent and these messages do not need to be tracked, saving it the database is not important.
					return res.status(200).send({message : "Email(s) sent!", info : info});
				});
			}
		});
	}
};

/**
* This function sends an email that the admin creates to a set of candidates.  The set
* can have one or more candidates in it.  Since the set could be very large, nodemailer-smtp-pool
* will be used to pool the emails.  Even though an admin can only view applicants for only one
* event at a time, this function does not consider this, it will be the responsibility of the
* admin to mention which event the email is referencing, if necessary.
*
* @param candidate_ids - array of candidate IDs that will receive this email.
* @param subject - the subject of the email
* @param message - the message of the email
* @param event_id - Event id of the event being referenced
*/
exports.sendCandidateEmail = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	} else if(!req.body.candidate_ids || !req.body.candidate_ids.length) {
		return res.status(400).send({message : "At least one email is required."});
	} else if(!req.body.message) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.event_id) {
		return res.status(400).send({message : "Required field not specified."});
	} else {
		var candidateIds = [];
		for(var i=0; i<req.body.candidate_ids.length; i++) {
			candidateIds.push(mongoose.Types.ObjectId(req.body.candidate_ids[i]));
		}

		Candidate.aggregate([
			{$match : {_id : {$in : candidateIds}}},
			{$project : {'_id' : 0, 'email' : 1}}
		], function(err, result) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!result || !result.length) {
				return res.status(400).send({message : "No emails found."});
			} else {
				var emails = [];
				for(var i=0; i<result.length; i++) {
					emails.push(result[i].email);
				}

				var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

				var aqueue = async.queue(function(email, callback) {
					var tempmail = new Email({
						to: 		email,
						from: 		'frank@jou.ufl.edu',
						subject: 	req.body.subject,
						event_id: 	new mongoose.Types.ObjectId(req.body.event_id)
					});

					tempmail.message =	"<!DOCTYPE html><html><head><title>" + tempmail.subject + "</title><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body style='font-family: \"Helvetica\", sans-serif; width: 750px;'>" +
										"<img src='http://www.frank2016.net/image?eid=" + tempmail._id.toString() + "&amp;image=email_header.png' /><br /><div style='width: 600px; margin: auto;'><pre style=\"padding: 0; margin: 0; background-color: white; border: none; text-align: left; font-family: 'Helvetica', sans-serif; margin: 1px;\">" + req.body.message + "</pre></div></body></html>";
					
					smtpTransport.sendMail({
						to: 		tempmail.to,
						from: 		tempmail.from,
						sender: 	tempmail.from,
						replyTo: 	tempmail.from,
						subject: 	tempmail.subject,
						html: 		tempmail.message
					}, function(err, info) {
						if(err) {
							return callback({error : err, email : tempmail.to});
						} else {
							tempmail.save(function(err) {
								if(err) {
									return callback({error : err});
								}
								
								return callback({error : false});
							});
						}
					});
				}, 20);

				var errs = false;
				var failedEmails = [];
				var task_cb = function(errObj) {
					if(errObj.error) {
						console.error(errObj);

						errs = errObj.error;
						if(errObj.email) {
							failedEmails.push(errObj.email);
						}
					}
				};

				aqueue.pause();
				for(var i = 0; i < emails.length; i++) {
					aqueue.push(emails[i], task_cb);
				}
				aqueue.resume();

				aqueue.drain = function() {
					if(aqueue.length() === 0 && aqueue.running() === 0) {
						if(errs) {
							if(failedEmails.length) {
								return res.status(400).send({message : "Some emails were not sent.", emails : failedEmails});
							}

							return res.status(400).send({message : "Email(s) sent, but some cannot be tracked."});
						}

						return res.status(200).send({message : "Email(s) sent!"});
					}
				};
			}
		});
	}
};

/**
* This function sends an email that the admin creates to a single receiver.  The receiver does not have
* to have an account nor does the system check if the receiver is in the system.  Since a large number
* email addresses could be specified, the emails will be pooled.
*
* @param emails - an array of recipients
* @param subject - the subject of the email
* @param message - the message of the email
* @param event_id - event this message is referencing
*/
exports.sendNonuserEmail = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	} else if(!req.body.emails) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.message) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.subject) {
		return res.status(400).send({message : "Required field not specified."});
	} else if(!req.body.event_id) {
		return res.status(400).send({message : "Required field not specified."});
	} else {
		var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

		var aqueue = async.queue(function(email, callback) {
			var tempmail = new Email({
				to: 		email,
				from: 		'frank@jou.ufl.edu',
				subject: 	req.body.subject,
				event_id: 	new mongoose.Types.ObjectId(req.body.event_id)
			});

			tempmail.message = 	"<!DOCTYPE html><html><head><title>" + tempmail.subject + "</title><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body style='font-family: \"Helvetica\", sans-serif; width: 750px;'>" +
								"<img src='http://www.frank2016.net/image?eid=" + tempmail._id.toString() + "&amp;image=email_header.png' /><br /><div style='width: 600px; margin: auto;'><pre style=\"padding: 0; margin: 0; background-color: white; border: none; text-align: left; font-family: 'Helvetica', sans-serif; margin: 1px;\">" + req.body.message + "</pre></div></body></html>";
			
			smtpTransport.sendMail({
				to: 		tempmail.to,
				from: 		tempmail.from,
				sender: 	tempmail.from,
				replyTo: 	tempmail.from,
				subject: 	tempmail.subject,
				html: 		tempmail.message
			}, function(err) {
				if(err) {
					return callback({error : err, email : tempmail.to});
				} else {
					tempmail.save(function(err) {
						if(err) {
							return callback({error : err});
						}
						
						return callback({error : false});
					});
				}
			});
		}, 10000);

		var errs = false;
		var emails = [];
		var task_cb = function(errObj) {
			if(errObj.error) {
				errs = errObj.error;
				if(errObj.email) {
					emails.push(errObj.email);
				}
			}
		};

		aqueue.pause();
		for(var i = 0; i < req.body.emails.length; i++) {
			aqueue.push(req.body.emails[i], task_cb);
		}
		aqueue.resume();

		aqueue.drain = function() {
			if(errs) {
				if(emails.length) {
					return res.status(400).send({message : "Some emails were not sent.", emails : emails});
				}
				return res.status(400).send({message : "Email(s) sent, but some cannot be tracked."});
			}
			return res.status(200).send({message : "Email(s) sent!"});
		};
	}
};

/**
* Route that will render email messages in the browser so all information displayed in the email can be displayed in the browser.
*
* @param filename (string) - path to file from the templates folder
* @param [field] (string, optional) - any fields that should be rendered and the value of that field (e.g. displayName=Moore,Calvin)
*/
exports.renderEmailTemplate = function(req, res) {
	if(!req.query.filename) {
		return res.status(400).send({message : "No file specified."});
	}

	var filename = path.normalize(__dirname + "/../views/templates/" + req.query.filename);
	delete req.query.filename;

	//Since security is a concern and Object.keys() only returns enumerable fields (i.e. not functions), I will build an object to pass into res.render().
	var queryFields = Object.keys(req.query);
	var templateObj = {};
	for(var i = 0; i < queryFields.length; i++) {
		templateObj[queryFields[i]] = req.query[queryFields[i]];
	}

	return res.render(filename, templateObj, function(err, renderedTemplate) {
		if(err) {
			return res.status(400).send({message : "File not found."});
		}

		res.setHeader('Content-Type', 'text/html');
		return res.status(200).send(renderedTemplate);
	});
};
