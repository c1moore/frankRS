'use strict';

//Yes, this should probably go in routes, but I'm lazy

/**
 * Module dependencies.
 */
 var errorHandler = require('./errors'),
 mongoose = require('mongoose'),
 User = mongoose.model('User'),
 Event = mongoose.model('Event'),
 Candidate = mongoose.model('Candidate'),
 nodemailer = require("nodemailer"),
 smtpPool = require('nodemailer-smtp-pool'),
 config = require('../../config/config'),
 http = require('http'),
 querystring = require('querystring');

/**
* When a candidate without admin permissions submits a note, it must contain the following format:
*
* 			PLEASE DO NOT DELETE OR EDIT THIS SECTION:
* 			**********
*			***Field1:
*			Field1 data...
*			***Field2:
*			Field2 data...
*			***************
*
* This function determines whether if the string it is passed follows the above format.  If it does not
* follow this format, an empty string is returned.  If the string does follow this format and replace
* is not specified, the string is returned.  If replace is specified and true, original will be searched
* using regexes 
*/
var checkUserNote = function(note, replace, original) {
	if(!replace || typeof replace !== 'boolean') {
		replace = false;
	}

	if(!original || typeof original !== 'string') {
		replace = false;
		original = "";
	}

	var firstline = /^PLEASE DO NOT DELETE OR EDIT THIS SECTION:/;		//Length including \n: 43
	var dbFirstline = /PLEASE DO NOT DELETE OR EDIT THIS SECTION:/;		//This line may not always be first in docs stored in the db.  Should only be used when checking docs from the db.
	var firstlineLength = 43;
	var startRegex = /\*\*\*\*\*\*\*\*\*\*/;							//Length including \n: 11
	var startLength = 11;
	var endRegex = /\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*$/;					//Length including \n: 16
	var dbEndRegex = /\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/;					//This line may not always be first in docs stored in the db.  Should only be used when checking docs from the db.
	var endLength = 16;
	var fieldRegex = /\*\*\*.*:\n/;
	var userSection = /PLEASE DO NOT DELETE OR EDIT THIS SECTION:\n*\*\*\*\*\*\*\*\*\*\*\n*(?:.*\n)*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/;

	if(note) {
		if(note.search(firstline) === -1) {
			return "";
		} else if(note.search(startRegex) !== firstlineLength) {
			return "";
		} else if(!(note.search(endRegex) > (firstlineLength + startLength))) {
			return "";
		}

		if(replace) {
			return note + "\n\n" + original.replace(userSection, '');
		}
	}

	return note;
};

exports.getCandidates = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	} else {
		Candidate.find({}, function(err, results) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!results.length) {
				return res.status(400).send({message : "No candidates found."});
			} else {
				return res.status(200).send(results);
			}
		});
	}
};

exports.getCandidatesByEvent = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	} else if(!req.body.event_id) {
		return res.status(400).send({message : "All required fields not specified."});
	} else {
		Candidate.aggregate([//{"events.event_id" : mongoose.Types.ObjectId(req.body.event_id)}, function(err, results) {
			{$match : {'events.event_id' : new mongoose.Types.ObjectId(req.body.event_id)}},
			{$unwind : '$events'},
			{$match : {"events.event_id" : new mongoose.Types.ObjectId(req.body.event_id)}}
		], function(err, results) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!results.length) {
				return res.status(400).send({message : "No candidates found."});
			} else {
				return res.status(200).send(results);
			}
		});
	}
};

 exports.getfName = function(req, res) {
 	var user = req.user;
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
 	}
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id: candidate_id});
 		var theResult;
 		query.exec(function(err,result) {
 			theResult = result;
 			if (err) res.status(400).send(err);
 			else if (!theResult) res.status(400).json({fName: "No first name found!"});
 			else res.status(200).json({fName: theResult.fName});
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});
 };

 exports.getlName= function(req, res) {
 	var user = req.user;
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
 	}
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id: candidate_id});
 		var theResult;
 		query.exec(function(err,result) {
 			theResult = result;
 			if (err) res.status(400).send(err);
 			else if (!theResult) res.status(400).json({lName: "No last name found!"});
 			else res.status(200).json({lName: theResult.lName});
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});
 };
 exports.getEmail= function(req, res) {
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
	}
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({email: "No email found!"});
 			} else {
 				res.status(200).json({email : result.email});
 			}
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});

 };
/* exports.getStatus= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({status: "No status found!"});
 			} else {
 				res.status(200).json({status : result.status});
 			}
 		});
 	}
 	else
 		return res.status(401).send("User does not have permission.");
 };*/
 exports.getEvents= function(req, res) {
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
 	}

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.populate('events.event_id', 'name start_date');
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({events: "No events found!"});
 			} else {
 				var eventlist = [],j=0;

 				res.status(200).json({events : result.events});
 			}
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});
 };

 exports.getNote= function(req, res) {
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
	}

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({note: "No note found!"});
 			} else {
 				res.status(200).json({note : result.note});
 			}
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});
 };

 exports.getUser_id= function(req, res) {
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
 	}

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({user_id: "No user_id found!"});
 			} else {
 				res.status(200).json({user_id : result.user_id});
 			}
 		});
 	}
 	else
 		return res.status(401).send({message : "User does not have permission."});
 };

 
 exports.setfName = function(req,res){
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id || !req.body.fName) {
		return res.status(400).send({message : "All required fields not specified."});
	}
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.fName = req.body.fName;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidate_id, { $set: { fName: req.body.fName }}, function (err, cand) {
  					if (err) {
  						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
  					} else {
  						return res.status(200).send(cand);
  					}
  				});*/
 	}

 });
 	}
 	else
 		return res.status(401).send({message : 'User does not have permission.'});

 };
 exports.setlName = function(req,res){
 	if(!req.isAuthenticated()) {
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	}
 	if(!req.body.candidate_id || !req.body.lName) {
		return res.status(400).send({message : "All required fields not specified."});
	}

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.lName = req.body.lName;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidate_id, { $set: { lName: req.body.lName }}, function (err, cand) {
  					if (err) {
  						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
  					} else {
  						return res.status(200).send(cand);
  					}
  				});*/
 	}

 });
 	}
 	else
 		return res.status(401).send({message : 'User does not have permission.'});

 };
 exports.setEmail = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send({'message' : 'User is not logged in.'});
 	if(!req.body.candidate_id || !req.body.email) {
 		return res.status(401).send({message : "Required field not set."});
 	}
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({_id:candidate_id });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.email = req.body.email;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidate_id, { $set: { email: req.body.email }}, function (err, cand) {
  					if (err) {
  						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
  					} else {
  						return res.status(200).send(cand);
  					}
  				});*/
 	}

 });
 	}
 	else
 		return res.status(401).send({message : 'User does not have permission.'});

 };

/**
* This function updates a candidate's status.  This will be updated after the candidate receives an email asking them to be a recruiter and they use a special
* link to become a recruiter.  Similar to updating the 'accepted' field, while updating the candidate's status we need to check to see if the 'accepted' field
* is set to true.  If this is the case, we can either add this event to the user's 'status' array as an event for which they are recruiting or create a new
* user account that will allow this candidate to recruit for this event.  In either case, an email should be sent to the recruiter to inform them of the change.
*
* @param candidate_id - The id of the candidate the should be updated.
* @param event_id - The id of the event of which we need to update the status
* @param status - The new status to set for the given candidate and event
*/
exports.setEventStatus = function(req,res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else if(!req.body.candidate_id || !req.body.event_id || !req.body.status) {
		return res.status(400).send({message : 'A required field is not specified.  Nice going.'});
	} else if(req.hasAuthorization(req.user, ["admin"])) {

		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);
		var event_id = mongoose.Types.ObjectId(req.body.event_id);

		var query = Candidate.findOne({'_id' : candidate_id });
		query.exec(function(err,result) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!result) {
				return res.status(400).send({message : "This candidate could not be found in our records."});
			} else {
				var i;
				for(i=0; i<result.events.length; i++) {
					if(result.events[i].event_id.toString() === req.body.event_id.toString() ){
						result.events[i].status = req.body.status;

						//If we updated the status to be 'accepted' and an admin has accepted their request, make them a recruiter.
						if (req.body.status ==='accepted' && result.events[i].accepted) {
							//User is no longer a candidate for this event, now they are a recruiter.
							result.events.pull({event_id : event_id});

							//Check if this candidate is already a user, but the user_id field was not filled out (possible if they were invited after being a candidate, for example).
							User.findOne({email : result.email}, function(err, user) {
								if(err) {
									return res.status(400).send({message : err});
								} else if(user) {
									//If the user already has an account, simply add necessary information.

									var j;
									//Search for this event in status array and make changes to recruiter field if event is in there.
									for (j = 0; j<user.status.length;j++){
										if (user.status[j].event_id.toString() === req.body.event_id.toString()){
											user.status[j].recruiter = true;
											break;
										}
									}

									//User does not have this event in their status array, add it.
									if(j===user.status.length) {
										user.status.addToSet({event_id : req.body.event_id, attending : false, recruiter : true});
									}
		 							
		 							user.roles.addToSet("recruiter");

		 							result.save(function(err) {
		 								if(err) {
		 									return res.status(400).send({message : err});
		 								} else {
											user.save(function(err,ress) {
												if(err) {
													return res.status(400).send({message : err});
												} else {
													return res.status(200).send({message : "New recruiter added and notification sent!"});
												}
											});
										}
									});
								} else {
									//There is not already a user for this candidate.  Create one and send notification.
									
									var newUser = new User({
										fName: result.fName,
										lName: result.lName,
										roles: ['recruiter'],
										email: result.email,
										status: [{event_id: event_id, attending: false, recruiter:true}],
										password: result.fName + result.lName,	//TODO Use the password creation method used in User routes controller.
										login_enabled: true
									});

									result.user_id = newUser._id;

									result.save(function(err) {
										if(err) {
											return res.status(400).send({message : err});
										} else {
											newUser.save(function(err) {
												if (err) {
													return res.status(400).send({message : err});
												} else {
													return res.status(200).send({message : "New recruiter added and notification sent!"});
												}
											});
										}
									});
								}
							});
						} else {
							result.save(function(err) {
								if(err) {
									return res.status(400).send({message : err});
								} else {
									return res.status(200).send({message : "Candidate information updated."});
								}
							});
						}
						
						break;
					}
				}

				//The event was not found.  Send an error message informing them and suggesting to add the event to their events array.
				if(i === result.events.length) {
					return res.status(400).send({message : 'User is not a candidate for this event.  If you want to make them a candidate, add them to this event.'});
				}
			}
		});
	} else {
		return res.status(401).send({message : 'User does not have permission.'});
	}
};

/**
* This methods adds a new event to a pre-existing candidate's events array.  If the user is not already a candidate or if the user is not an admin
* the setCandidate() method should be used instead of this one.
*
* @param candidate_id - The _id field of the candidate object to update.
* @param event_id - The _id field of the event to add to this candidate's events array.
*/
exports.addEvent = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else if(!req.body.candidate_id || !req.body.event_id) {
		return res.status(400).send({message : "A required field is not specified.  Nice going."});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);

		var query = Candidate.findOne({_id:candidate_id });
		query.exec(function(err,result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).send({message : "No candidate found!"});
			} else {
				result.events.addToSet({event_id : req.body.event_id});

				result.save(function(err, result) {
					if(err) {
						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
					} else {
						return res.status(200).send(result);
					}

				});
			}
		});
	}
	else {
		return res.status(401).send({message : 'User does not have permission.'});
	}
};

// /**
// * This methods sets whether or not an admin has accepted this candidate to recruiter for this event.  If the user is not already a candidate an error will be
// * thrown.
// *
// * @param candidate_id - The _id field of the candidate object to update.
// * @param event_id - The _id field of the event to add to this candidate's events array.
// * @param event_accepted - The boolean value to set the accepted field to for this event.
// */
// exports.addEvent = function(req,res){
// 	if(!req.isAuthenticated()) {
// 		return res.status(401).send({message : "User is not logged in"});
// 	} else if(req.body.candidate_id == undefined || req.body.event_id == undefined || req.body.event_accepted == undefined) {
// 		return res.status(400).send({message : "A required field is not specified.  Nice going."});
// 	} else if(req.hasAuthorization(req.user, ["admin"])) {
// 		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);

// 		var query = Candidate.findOne({_id:candidate_id });
// 		query.exec(function(err,result) {
// 			if(err) {
// 				res.status(400).send(err);
// 			} else if(!result) {
// 				res.status(400).json("No candidate found!");
// 			} else {
// 				var i;
// 				for(i=0; i<result.events.length; i++) {
// 					if(result.events[i].event_id.toString() === req.body.event_id.toString()) {
// 						result.events[i].accepted = req.body.event_accepted;
// 						break;
// 					}
// 				}

// 				if(i === result.events.length) {
// 					return res.status(400).send({message : 'Candidate\'s event not found.  Please try again.'});
// 				} else {
// 					result.save(function(err, result) {
// 						if(err) {
// 							res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
// 						} else {
// 							return res.status(200).send(result);
// 						}
// 					});
// 				}
// 			}
// 		});
// 	}
// 	else {
// 		return res.status(401).send('User does not have permission.');
// 	}
// };

/**
* This function updates the 'accepted' field of the specified candidate.  If this candidate has been accepted and their status is 'accepted' we can make them
* a recruiter, in which case we need to determine if the candidate is already a user or needs an account created.  In either case, an email should be sent to
* the recruiter informing them of their status update.  If the user is not a candidate for this event, we inform the admin that they need to add this event
* to the candidate's events array first.
*
* @param candidate_id - The id of the candidate we will update
* @param event_id - The id of the event for which we need to update the accepted field
* @param accepted - The boolean value to set the accepted field to
*/
exports.setEventAccepted = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.body.candidate_id || !req.body.event_id || req.body.accepted == undefined) {
		return res.status(400).send({message : 'Required fields were not specified.  Nice going.'});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);
		var event_id = mongoose.Types.ObjectId(req.body.event_id);

		var query = Candidate.findOne({'_id' : candidate_id });
		query.exec(function(err,result) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!result) {
				return res.status(400).send({message : "This candidate could not be found in our records."});
			} else {
				var i;
				for(i=0; i<result.events.length; i++) {
					if(result.events[i].event_id.toString() === req.body.event_id.toString() ){
						result.events[i].accepted = req.body.accepted;

						//If we updated the accepted field to be true and their status is 'accepted', make them a recruiter.
						if (req.body.accepted && result.events[i].status  ==='accepted') {
							//User is no longer a candidate for this event, now they are a recruiter.
							result.events.pull({event_id : event_id});

							//Check if this candidate is already a user, but the user_id field was not filled out (possible if they were invited after being a candidate, for example).
							User.findOne({email : result.email}, function(err, user) {
								if(err) {
									return res.status(400).send({message : err});
								} else if(user) {
									//If the user already has an account, simply add necessary information.

									var j;
									//Search for this event in status array and make changes to recruiter field if event is in there.
									for (j = 0; j<user.status.length;j++){
										if (user.status[j].event_id.toString() === req.body.event_id.toString()){
											user.status[j].recruiter = true;
											break;
										}
									}

									//User does not have this event in their status array, add it.
									if(j===user.status.length) {
										user.status.addToSet({event_id : req.body.event_id, attending : false, recruiter : true});
									}
		 							
		 							user.roles.addToSet("recruiter");

		 							result.save(function(err) {
		 								if(err) {
		 									return res.status(400).send({message : err});
		 								} else {
											user.save(function(err,ress) {
												if(err) {
													return res.status(400).send({message : err});
												} else {
													return res.status(200).send({message : "New recruiter added and notification sent!"});
												}
											});
										}
									});
								/**
								* The candidate is not already a user.  We need to create an account for them.
								*
								* TODO Use a better password generation function and send an email to the recruiter informing them of their new account.
								*/
								} else {
									var newUser = new User({
										fName: result.fName,
										lName: result.lName,
										roles: ['recruiter'],
										email: result.email,
										status: [{event_id: new mongoose.Types.ObjectId(req.body.event_id), attending: false, recruiter:true}],
										password: result.fName + result.lName,	//TODO Use the password function in the users.routes.server.controller.js.
										login_enabled: true
									});

									result.user_id = newUser._id;
									result.events.pull({event_id : event_id});
									
									result.save(function(err){
										if (err) {
											return res.status(400).send({message : err});
										} else {
											newUser.save(function(err){
												if (err) {
													return res.status(400).send({message : err});
												} else {
													return res.status(200).send({message : "New recruiter added and notification sent!"});
												}
											});
										}
									});
								}
							});
						} else {
							result.save(function(err) {
								if(err) {
									return res.status(400).send({message : err});
								} else {
									return res.status(200).send({message : "Candidate information updated."});
								}
							});
						}
						break;
					}
				}

				//The event was not found.  Send an error message informing them and suggesting to add the event to their events array.
				if(i === result.events.length) {
					return res.status(400).send({message : 'User is not a candidate for this event.  If you want to make them a candidate, add them to this event.'});
				}
			}
		});
	} else {
		return res.status(401).send({message : 'User does not have permission.'});
	}
};

exports.setNote = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	}
	if(!req.body.candidate_id || !req.body.note) {
		return res.status(400).send({message : "All required fields not specified."});
	}

	if (req.hasAuthorization(req.user, ["admin"])){
		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
		var query = Candidate.findOne({_id:candidate_id });
		query.exec(function(err,result){
			if(err){
				res.status(400).send(err);
			}
			else if(!result){
				res.status(400).json("No candidate found!");
			}
			else{
				result.note = req.body.note;

				result.save(function(err, result) {
					if(err) {
						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
					} else {
						return res.status(200).send(result);
					}

				});
			}
		});
	}
	else
		return res.status(401).send({message : 'User does not have permission.'});

};

/**
* This function takes a Candidate object and updates the record as determined by the _id field.  If one or more fields of the object do not exist, but are
* defined in the database record, these fields will remain unchanged.  user_id will not be updated even if specified.
*
* @param candidate - a Candiate object with the _id field defined and all fields that should be updated specified.
* @return candidate
*/
exports.updateCandidate = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	}

	if(!req.body.candidate || !req.body.candidate._id) {
		return res.status(400).send({message : "A required field is not specified."});
	}

	var candidate = req.body.candidate;
	var c_id = new mongoose.Types.ObjectId(req.body.candidate._id);
	Candidate.findOne({_id : c_id}, function(err, old_cand) {
		if(err)
			return res.status(400).send(err);
		if(!old_cand)
			return res.status(400).send({message : "Candidate not found."});

		if(candidate.fName) {
			old_cand.fName = candidate.fName;
		}
		if(candidate.lName) {
			old_cand.lName = candidate.lName;
		}
		if(candidate.email) {
			old_cand.email = candidate.email;
		}
		if(candidate.events) {
			old_cand.events = candidate.events;
		}
		if(candidate.note) {
			old_cand.note = candidate.note;
		}

		old_cand.save(function(err, new_cand) {
			if(err)
				return res.status(400).send(err);

			return res.status(200).send(new_cand);
		});
	});
};

/**
* This function will either create a new candidate object if there is not currently one in the db for them or add a new event to the candidates events array.
* This function should only be used when a user is signing up to be a candidate or when an admin is creating a new candidate.  This method does check to see
* if the candidate already exists if an admin creates a new candidate; however, setEvent() should be used instead of this method.
*
* IMPORTANT: If a candidate is sending a note, it should have the following format:
* 		PLEASE DO NOT DELETE OR EDIT THIS SECTION:
* 		**********
*		***Field1:
*		Field1 data...
*		***Field2:
*		Field2 data...
*		***************
* The first line contains the message "PLEASE DO NOT DELETE OR EDIT THIS SECTION:".  The second line contains ten (10) astericks.  The last line contains
* fifteen (15) astericks.  Any information the user is sending should go between the two lines of astericks.  This information must begin with three (3)
* astericks followed by a field name.  Any information related to this field should go on the next line.  Fields are identified by the three astericks
* before the field name, so any legal characters can follow.  If this format is followed, the note field will be discarded.
*
* ***When a user sends a note, it will overwrite any notes that are stored that were previously sent from the user.***
*
* If a user is requesting to become a recruiter, the following paramers should be sent
*
* @param event_id - Event the user is requesting to for which to user wants to become a recruiter
* @param note - (optional) Any notes that should be included
* 
* If an admin is adding the candidate, the following parameters should be sent.
*
* @param fName - Candidate's first name
* @param lName - Candidate's last name
* @param email - Candidate's email address
* @param events - An array of event_ids, which will be added to the candidate's events array.
* @param note - (optional) Any notes that should be included
*/
exports.setCandidate = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		if(!req.body.fName || !req.body.lName || !req.body.email || !req.body.events || req.body.events.length === 0) {
			return res.status(400).send({message : 'A required field is not specified.  Nice going.'});
		}

		Candidate.findOne({email : req.body.email}, function(err, candidate) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!candidate) {
				var	newCandidate = new Candidate({
					fName: req.body.fName,
					lName: req.body.lName,
					email: req.body.email,
					note: req.body.note
				});

				for(var i=0; i<req.body.events.length; i++) {
					newCandidate.events.addToSet({event_id : new mongoose.Types.ObjectId(req.body.events[i]), accepted : false, status : 'volunteer'});
				}

				User.findOne({email : req.body.email}, function(err, result) {
					if(err) {
						return res.status(400).send({message : err});
					} else if(result) {
						newCandidate.user_id = result._id;
					}

					newCandidate.save(function(err) {
						if(err) {
							return res.status(400).send({message: errorHandler.getErrorMessage(err)});
						} else {
							return res.status(200).send({message : req.body.fName + ' ' + req.body.lName + ' now has the honor of being a candidate for us.'});
						}
					});
				});
			} else {
				for(var i=0; i<req.body.events.length; i++) {
					candidate.events.addToSet({event_id : new mongoose.Types.ObjectId(req.body.events[i]), accepted : false, status : 'volunteer'});
				}

				if(req.body.note) {
					candidate.note = req.body.note + "\n\n" + candidate.note;
				}

				candidate.save(function(err) {
					if(err) {
						return res.status(400).send({message : err});
					} else {
						return res.status(200).send({message : req.body.fName + ' ' + req.body.lName + ' now has the honor of being a candidate for us.'});
					}
				});
			}
		});
	} else {
		/**
		* The user that is making this request is not an admin.  We need to determine if they are already a candidate or if we need to create a new candidate for
		* them.  Since attendees/recruiters can only make requests to be a candidate for themselves, we can use the req.user object for all the information.
		*/

		if(!req.body.event_id) {
			return res.status(400).send({message : "All required fields not specified."});
		}

		Candidate.findOne({user_id : req.user._id}, function(err, candidate) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!candidate) {
				//The user was not previously a candidate, create a new candidate object for them for this event.

				/**
				* Check the note field.  If it is present, make sure it has the proper format.  Otherwise discard it.
				*/
				req.body.note = checkUserNote(req.body.note, false);

		 		var	newCandidate = new Candidate({
		 			fName: req.user.fName,
		 			lName: req.user.lName,
		 			email: req.user.email,
		 			user_id : new mongoose.Types.ObjectId(req.user._id),
		 			events : [{event_id : new mongoose.Types.ObjectId(req.body.event_id), accepted : false, status : 'volunteer'}],
		 			note : req.body.note
		 		});

		 		newCandidate.save(function(err){
		 			if(err) {
		 				return res.status(400).send({message: errorHandler.getErrorMessage(err)});
		 			} else {
		 				return res.status(200).send(newCandidate);
		 			}
		 		});
		 	} else {
		 		//The user was already a candidate, add this event to their list.
		 		candidate.events.addToSet({event_id : new mongoose.Types.ObjectId(req.body.event_id), accepted : false, status : 'volunteer'});

				/**
				* Check the note field.  If it is present, make sure it has the proper format.  Otherwise discard it.
				*/
				candidate.note = checkUserNote(req.body.note, true, candidate.note);

		 		candidate.save(function(err) {
		 			if(err) {
		 				return res.status(400).send({message : err});
		 			} else {
		 				return res.status(200).send({message : 'Congrats! You are now in the running to be a recruiter for {{eventSelector.selectedEvent}}.'});
		 			}
		 		});
		 	}
	 	});
 	}
};

/**
* Creates a new candidate that is not tied to an existing user account and is not created by an admin.
*
* @param fName - Candidate's first name
* @param lName - Candidate's last name
* @param email - Candidate's email address
* @param organization - The organization for which the candidate works
* @param note - Any notes submitted by the candidate.  This field MUST have the specified format for all
* 		candidate submitted notes specified above.
* @param g-recaptcha-response - reCAPTCHA response
*/
exports.createNonuserCandidate = function(req, res) {
	if(!req.body.fName || !req.body.lName || !req.body.email || !req.body.note || !req.body['g-recaptcha-response']) {
		return res.status(400).send({message : "A required field is not specified."});
	}

	var post_data = querystring.stringify({
		secret: 	config.recaptcha.private_key,
		response: 	req.body['g-recaptcha-response'],
		remoteip: 	req.headers['x-forwarded-for']
	});

	var post_options = {
		hostname: 	'www.google.com',
		path: 		'/recaptcha/api/siteverify',
		method: 	'POST'
	};

	var out_req = http.request(post_options, function(out_res) {
		//Only add candidate if the request was successful or if the private key is Google's fake private key.
		if(out_res.success || config.recaptcha.private_key === "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe") {
			if(!req.body.note || checkUserNote(req.body.note) === "") {
				return res.status(400).send({message : "Note does not have proper format or not sent."});
			}

			var candidate = new Candidate({
				fName: 			req.body.fName,
				lName: 			req.body.lName,
				email: 			req.body.email,
				organization: 	req.body.organization,
				note: 			req.body.note
			});

			candidate.save(function(err) {
				if(err) {
					return res.status(400).send({message : err});
				} else {
					return res.status(200).send({message : "Form submitted."});
				}
			});
		} else {
			return res.status(400).send({message : false, 'g-errors' : out_res['error-codes']});
		}
	});

	out_req.on('error', function(err) {
		res.status(400).send({message : err});
	});

	out_req.write(post_data);
	out_req.end();
};

exports.deleteCandidate = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}
	if(!req.body.candidate_id) {
		return res.status(400).send({message : "All required fields not specified."});
	}
	if (req.hasAuthorization(req.user, ["admin"])){
		var candidate_id=mongoose.Types.ObjectId(req.body.candidate_id);
		var query = Candidate.findOne({_id:candidate_id });
		query.exec(function(err,result){
			if(err){
				res.status(400).send({message : err});
			} else if(!result) {
				res.status(400).send({message : "No candidate found!"});
			} else {
				result.remove(function(err, result) {
					if(err) {
						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
					} else {
						return res.status(200).send(result);
					}

				});
			}
		});
	}
	else
		return res.status(401).send({message : 'User does not have permission.'});
};

exports.deleteCandidateByEvent = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(!req.hasAuthorization(req.user, ["admin"])) {
		return res.status(401).send({message : "User does not have permission."});
	} else if(!req.body.candidate_id || !req.body.event_id) {
		return res.status(400).send({message : "All required fields not specified."});
	} else {
		var candidate_id = new mongoose.Types.ObjectId(req.body.candidate_id);
		var event_id = new mongoose.Types.ObjectId(req.body.event_id);

		var query = Candidate.findOne({_id : candidate_id});
		query.exec(function(err, result) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!result) {
				return res.status(400).send({message : "No candidate found!"});
			} else {
				result.events.pull({event_id : event_id});
				if(!result.events.length) {
					result.remove(function(err, result) {
						if(err) {
							return res.status(400).send({message : err});
						} else {
							return res.status(200).send(result);
						}
					});
				} else {
					result.save(function(err) {
						if(err) {
							return res.status(400).send({message : err});
						} else {
							return res.status(200).send(result);
						}
					});
				}
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
* @param candidates - array of candidate IDs that will receive this email.
* @param subject - the subject of the email
* @param message - the message of the email
*/
exports.sendCandidateEmail = function(req, res) {
	try {
		if(!req.isAuthenticated()) {
			return res.status(401).send({message : "User is not logged in."});
		} else if(!req.hasAuthorization(req.user, ["admin"])) {
			return res.status(401).send({message : "User does not have permission."});
		} else if(!req.body.candidate_ids || !req.body.candidate_ids.length) {
			return res.status(400).send({message : "At least one email is required."});
		} else if(!req.body.message) {
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
				} else if(!result.length) {
					return res.status(400).send({message : "No emails found."});
				} else {
					var emails = [];
					for(var i=0; i<result.length; i++) {
						emails.push(result[i].email);
					}

					var smtpTransport = nodemailer.createTransport(smtpPool(config.mailer.options));
					smtpTransport.sendMail({
						to : emails,
						from : "frank@jou.ufl.edu",
						sender : "frank@jou.ufl.edu",
						replyTo : "frank@jou.ufl.edu",
						subject : req.body.subject,
						html : req.body.message
					}, function(err) {
						if(err) {
							return res.status(400).send({message : err});
						} else {
							return res.status(200).send({message : "Email(s) sent!"});
						}
					});
				}
			});
		}
	} catch(err) {
		console.log(err);
		return res.status(500).send();
	}
};

/**
* This function sends an email that the admin creates to a single receiver.  The receiver does not have
* to have an account nor does the system check if the receiver is in the system.  Since a large number
* email addresses could be specified, the emails will be pooled.
*
* @param emails - an array of email addresses to send email
* @param subject - the subject of the email
* @param message - the message of the email
*/
exports.sendNewCandidateEmail = function(req, res) {
	try {
		if(!req.isAuthenticated()) {
			return res.status(401).send({message : "User is not logged in."});
		} else if(!req.hasAuthorization(req.user, ["admin"])) {
			return res.status(401).send({message : "User does not have permission."});
		} else if(!req.body.emails) {
			return res.status(400).send({message : "Required field not specified."});
		} else if(!req.body.message) {
			return res.status(400).send({message : "Required field not specified."});
		} else if(!req.body.subject) {
			return res.status(400).send({message : "Required field not specified."})
		} else {
			var smtpTransport = nodemailer.createTransport(smtpPool(config.mailer.options));
			smtpTransport.sendMail({
				to : req.body.emails,
				from : "frank@jou.ufl.edu",
				sender : "frank@jou.ufl.edu",
				replyTo : "frank@jou.ufl.edu",
				subject : req.body.subject,
				html : req.body.message
			}, function(err) {
				if(err) {
					return res.status(400).send({message : "Message was not sent.", error : err});
				} else {
					return res.status(200).send({message : "Email(s) sent!"});
				}
			});
		}
	} catch(err) {
		console.log(err);
		return res.status(500).send();
	}
};

/**
* Return the candidate object stored in the db for a user IFF the current candidate is the same user requesting
* the data.  The user_id field of the candidate and the _id field from the request is used to search for the
* candidate.  Of course, this requires a user to be logged in.
*/
exports.userCandidate = function(req, res) {
	try {
		if(!req.isAuthenticated()) {
			return res.status(401).send({message : "User is not logged in."});
		} else {
			var user_id = new mongoose.Types.ObjectId(req.user._id);
			Candidate.findOne({user_id : user_id}, function(err, candidate) {
				if(err) {
					return res.status(400).send(err);
				} else if(!candidate) {
					return res.status(204).send({message : "User not found."});
				} else {
					return res.status(200).send(candidate);
				}
			});
		}
	} catch(err) {
		console.log(err);
		return res.status(500).send();
	}
};