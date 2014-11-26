'use strict';

//Yes, this should probably go in routes, but I'm lazy

/**
 * Module dependencies.
 */
 var errorHandler = require('./errors'),
 mongoose = require('mongoose'),
 User = mongoose.model('User'),
 Event = mongoose.model('Event'),
 Candidate = mongoose.model('Candidate');


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
}

 exports.getfName = function(req, res) {
 	var user = req.user;
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");
 };

 exports.getlName= function(req, res) {
 	var user = req.user;
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");
 };
 exports.getEmail= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");

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
 		return res.status(401).send("User not Authorized");
 };*/
 exports.getEvents= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");
 };

 exports.getNote= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");
 };

 exports.getUser_id= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

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
 		return res.status(401).send("User not Authorized");
 };

 
 exports.setfName = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
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
 		return res.status(401).send('User not Authorized');

 };
 exports.setlName = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
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
 		return res.status(401).send('User not Authorized');

 };
 exports.setEmail = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
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
 		return res.status(401).send('User not Authorized');

 };
 exports.setEventStatus = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);
 		var query = Candidate.findOne({'_id' : candidate_id });
 		query.exec(function(err,result){
 			if(err) {
 				return res.status(400).send(err);
 			} else if(!result) {
 				return res.status(400).json("No candidate found!");
 			} else {
 				for(var i=0; i<result.events.length; i++) {
 					if(result.events[i].event_id.toString() === req.body.event_id.toString() ){
 						result.events[i].status = req.body.status;
 						if (req.body.status ==='accepted'){
 							if(result.events[i].accepted ===true){	

 							if(result.user_id){
 								var user_id = result.user_id;
 								var query2 = User.findOne({'_id' : user_id});
 								query2.exec(function(err,result3){
 									if(err)
 										return res.status(400).send(err);
 									else if(!result)
 										return res.status(400).json("no user with candidate.user_id is found");
 									else{
 										for (var j = 0; j<result3.status.length;j++){
 											if (result3.status[j].event_id.toString() === req.body.event_id.toString()){
 												result3.status[j].recruiter = true;

 												break;
 											}
 										}
		 								result3.roles.push("recruiter");

 										result3.save(function(err,ress){
 											if (err)
 												res.status(400).send(err);
 										});
 									}


 								});

 							}
 							else{
 								var user = new User({
 									fName: result.fName,
 									lName: result.lName,
 									roles: ['recruiter'],
 									email: result.email,
 									status: [{event_id: result.events[i].event_id,attending: false,recruiter:true}],
 									password: result.fName + result.lName,
 									login_enabled: true
 								});


 								result.user_id=user._id;
 								result.save(function(err,resss){
 									if (err)
 										return res.status(400).send(err)
 								});

 								user.save(function(err,ress){
 									if (err)
 										return res.status(400).send(err)
 								});
 							}
 						}
 					}


 						break;
 					}
 				}

 				result.save(function(err, result2) {
 					if(err) {
 						return res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result2);
 					}
 				});
 			}
 		});
 	} else
 	return res.status(401).send('User not Authorized');
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
		return res.status(401).send({message : "User is not logged in"});
	} else if(req.body.candidate_id == undefined || req.body.event_id == undefined) {
		return res.status(400).send({message : "A required fieldis not specified.  Nice going."});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);

		var query = Candidate.findOne({_id:candidate_id });
		query.exec(function(err,result) {
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).json("No candidate found!");
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
		return res.status(401).send('User not Authorized');
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
// 		return res.status(401).send('User not Authorized');
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
	} else if(req.body.candidate_id == undefined || req.body.event_id == undefined || req.body.accepted == undefined) {
		return res.status(400).send({message : 'Required fields were not specified.  Nice going.'});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		var candidate_id = mongoose.Types.ObjectId(req.body.candidate_id);

		var query = Candidate.findOne({'_id' : candidate_id });
		query.exec(function(err,result) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!result) {
				return res.status(400).send({message : "No candidate found!"});
			} else {
				var i = 0;
				for(i; i<result.events.length; i++) {
					if(result.events[i].event_id.toString() === req.body.event_id.toString()) {
						result.events[i].accepted = req.body.accepted;
						
						/**
						* If the candidate has been accepted by the recruiter and they still want to be a recruiter, create recruiter account 
						* for them if they do not already have an account or simply add make it so they can recruit for this event.
						*/
						if(req.body.accepted && result.events[i].status === 'accepted') {
							if(result.user_id) {
								var user_id = result.user_id;
								
								var query2 = User.findOne({'_id' : user_id});
								query2.exec(function(err,result3){
									if(err) {
										return res.status(400).send({message : err});
									} else if(!result) {
										return res.status(400).send({message : "There was a error that needs to be handled better."});
									} else{
										var j;
										for (j=0; j<result3.status.length;j++){
											if (result3.status[j].event_id.toString() === req.body.event_id.toString()) {
												result3.status[j].recruiter = true;
												break;
											}
										}

										//User does not have this event in their status array.  Add it.
										if(j === result3.status.length) {
											result3.status.addToSet({event_id : new mongoose.Types.ObjectId(req.body.event_id), recruiter : true, attending : false});
										}

										//Add recruiter to their roles.
		 								result3.roles.addToSet("recruiter");

		 								result.save(function(err) {
		 									if(err) {
		 										return res.status(400).send({message : err});
		 									} else {
												result3.save(function(err) {
													if(err) {
														return res.status(400).send({message : err});
													} else {
														return res.status(200).send({message : "Recruiter added!"});
													}
												});
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
								var user = new User({
									fName: result.fName,
									lName: result.lName,
									roles: ['recruiter'],
									email: result.email,
									status: [{event_id: new mongoose.Types.ObjectId(req.body.event_id), attending: false, recruiter:true}],
									password: result.fName + result.lName,	//TODO Use the password function in the users.routes.server.controller.js.
									login_enabled: true
								});

								result.user_id = user._id;
								result.events.pull({event_id : new mongoose.Types.ObjectId(req.body.event_id)});
								
								result.save(function(err){
									if (err) {
										return res.status(400).send({message : err})
									} else {
										user.save(function(err){
											if (err) {
												return res.status(400).send({message : err})
											} else {
												return res.status(200).send({message : "New recruiter added and notification sent!"});
											}
										});
									}
								});
							}
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
		return res.status(401).send({message : 'User not authorized.'});
	}
};

exports.setNote = function(req,res){
	if(!req.isAuthenticated())
		return res.status(401).send("User is not logged in");
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
		return res.status(401).send('User not Authorized');

};

/**
* This function will either create a new candidate object if there is not currently one in the db for them or add a new event to the candidates events array.
* This function should only be used when a user is signing up to be a candidate or when an admin is creating a new candidate.  This method does check to see
* if the candidate already exists if an admin creates a new candidate; however, setEvent() should be used instead of this method.
*
* @param events - An array of event_ids, which will be added to the candidate's events array.
* 
* If an admin is adding the candidate, the following parameters should also be sent.
*
* @param fName - Candidate's first name
* @param lName - Candidate's last name
* @param email - Candidate's email address
*/
exports.setCandidate = function(req,res){
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	} else if(req.body.events == undefined || req.body.events.length === 0) {
		return res.status(400).send({message : 'A required field is not specified.  Nice going.'});
	} else if(req.hasAuthorization(req.user, ["admin"])) {
		if(req.body.fName == undefined || req.body.lName == undefined || req.body.email == undefined) {
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

				candidate.save(function(err) {
					if(err) {
						return res.status(400).send({message : err});
					} else {
						return res.status(200).send({message : req.body.fName + ' ' + req.body.lName + ' now has the honor of being a candidate for us.'})
					}
				})
			}
		});
	} else {
		/**
		* The user that is making this request is not an admin.  We need to determine if they are already a candidate or if we need to create a new candidate for
		* them.  Since attendees/recruiters can only make requests to be a candidate for themselves, we can use the req.user object for all the information.
		*/

		Candidate.findOne({_id : req.user._id}, function(err, candidate) {
			if(err) {
				return res.status(400).send({message : err});
			} else if(!candidate) {
				//The user was not previously a candidate, create a new candidate object for them for this event.
		 		var	newCandidate = new Candidate({
		 			fName: req.user.fName,
		 			lName: req.user.lName,
		 			email: req.user.email,
		 			user_id : req.user._id,
		 			events : [{event_id : req.body.event_id, accepted : false, status : 'volunteer'}]
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
		 		candidate.addToSet({event_id : req.body.events[0], accepted : false, status : 'volunteer'});

		 		candidate.save(function(err) {
		 			if(err) {
		 				return res.status(400).send({message : err});
		 			} else {
		 				return res.status(200).send({message : 'Congrats! You are now in the running to be a recruiter for {{eventSelector.selectedEvent}}.'});
		 			}
		 		})
		 	}
	 	})
 	}
};

 	exports.deleteCandidate = function(req,res){
 		if(!req.isAuthenticated())
 			return res.status(401).send("User is not logged in");
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
 				//result.note = req.body.note;

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
 			return res.status(401).send('User not Authorized');

 	};