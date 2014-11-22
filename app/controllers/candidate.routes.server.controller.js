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
 exports.setEvent = function(req,res){
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

 exports.setEventAccepted = function(req,res){
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
 				var i =0;
 				for(i; i<result.events.length; i++) {
 					if(result.events[i].event_id.toString() === req.body.event_id.toString() ){
 						result.events[i].accepted = req.body.accepted;
 						if(req.body.accepted === true){
 						if(result.events[i].status==='accepted'){
 							

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
exports.setCandidate = function(req,res){
	if(!req.isAuthenticated())
		return res.status(401).send("User is not logged in");
	if (req.hasAuthorization(req.user, ["admin"])){
		var	newCandidate = new Candidate({
			fName: req.body.fName,
			lName: req.body.lName,
			email: req.body.email,
			status: req.body.status,
			events: [{event_id: req.body.event_id._id,accepted: req.body.accept_Key}],
			note: req.body.note,
			user_id: req.body.user_id
		});

		newCandidate.save(function(err){
			if(err)
				return res.status(400).send({'message': errorHandler.getErrorMessage(err)});
			else
				return res.status(200).send(newCandidate);

		});
	}
	

 	else{// if (req.hasAuthorization(req.user)){
 		var	newCandidate = new Candidate({
 			fName: req.body.fName,
 			lName: req.body.lName,
 			email: req.body.email,
 			status: "volunteer",
 			events: [{event_id: req.body.newEvent._id,accepted: false}],
 			//note: req.body.note
 		});

 		newCandidate.save(function(err){
 			if(err)
 				return res.status(400).send({'message': errorHandler.getErrorMessage(err)});
 			else
 				return res.status(200).send(newCandidate);

 		});
 	}
 	


 	/*else
 		return res.status(401).send('User not Authorized');
 		*/
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