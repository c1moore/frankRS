'use strict';

//Yes, this should probably go in routes, but I'm lazy

/**
 * Module dependencies.
 */
 var errorHandler = require('../errors'),
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
