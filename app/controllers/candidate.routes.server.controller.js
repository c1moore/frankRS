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



 exports.getfName = function(req, res) {
 	var user = req.user;
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID = req.body.candidateID;
 		var query = Candidate.findOne({_id: candidateID});
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
 		var candidateID = req.body.candidateID;
 		var query = Candidate.findOne({_id: candidateID});
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
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
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
 exports.getStatus= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
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
 };
 exports.getEvents= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({events: "No events found!"});
 			} else {
 				res.status(200).json({events : result.events});
 			}
 		});
 	}
 	else
 		return res.status(401).send("User not Authorized");
 };

 exports.getAccept_Key= function(req, res) {
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");

 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result) {
 			if(err) {
 				res.status(400).send(err);
 			} else if(!result) {
 				res.status(400).json({accept_key: "No accept_key found!"});
 			} else {
 				res.status(200).json({accept_key : result.accept_key});
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
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
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


 
 exports.setfName = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.fName = req.body.newfName;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidateID, { $set: { fName: req.body.newfName }}, function (err, cand) {
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
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.lName = req.body.newlName;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidateID, { $set: { lName: req.body.newlName }}, function (err, cand) {
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
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.email = req.body.newEmail;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidateID, { $set: { email: req.body.newEmail }}, function (err, cand) {
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
 exports.setStatus = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.status = req.body.newStatus;
 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 				/*Candidate.findByIdAndUpdate(candidateID, { $set: { status: req.body.newStatus }}, function (err, cand) {
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
 exports.setEvent = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.events.push(req.body.newEvent);

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

exports.setEventStatus = function(req,res){
	if(!req.isAuthenticated())
		return res.status(401).send("User is not logged in");
	if (req.hasAuthorization(req.user, ["admin"])){
		var candidateID = req.body.candidateID;
		var query = Candidate.findOne({'_id' : candidateID });
		query.exec(function(err,result){
			if(err) {
				res.status(400).send(err);
			} else if(!result) {
				res.status(400).json("No candidate found!");
			} else {
				for(var i=0; i<result.events.length; i++) {
					if(result.events[i].eventsID.toString() === req.body.eventsID.toString() ){
						result.events[i].accepted = req.body.accepted;
						break;
					}
				}

				result.save(function(err, result2) {
					if(err) {
		 				res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
					} else {
		 				return res.status(200).send(result2);
					}
				});
			}
		});
	} else
		return res.status(401).send('User not Authorized');
};
exports.setNote = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 		var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.note = req.body.newNote;

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
 exports.setCandidate = function(req,res){
 	if(!req.isAuthenticated())
 		return res.status(401).send("User is not logged in");
 	if (req.hasAuthorization(req.user, ["admin"])){
 	var	newCandidate = new Candidate({
 			fName: req.body.newfName,
 			lName: req.body.newlName,
 			email: req.body.newEmail,
 			status: req.body.newStatus,
 			events: [{eventsID: req.body.newEvent._id,accepted: req.body.newAccept_Key}],
 			note: req.body.newNote
 		});

 		newCandidate.save(function(err){
 			if(err)
 				return res.status(400).send({'message': errorHandler.getErrorMessage(err)});
 			else
 				return res.status(200).send('A new candidate has been made');

 		});


 	/*	var candidateID=req.body.candidateID;
 		var query = Candidate.findOne({_id:candidateID });
 		query.exec(function(err,result){
 			if(err){
 				res.status(400).send(err);
 			}
 			else if(!result){
 				res.status(400).json("No candidate found!");
 			}
 			else{
 				result.note = req.body.newNote;

 				result.save(function(err, result) {
 					if(err) {
 						res.status(400).send({'message' : errorHandler.getErrorMessage(err)});
 					} else {
 						return res.status(200).send(result);
 					}

 				});
 			}
 		});*/
 	}
 	else
 		return res.status(401).send('User not Authorized');

 };