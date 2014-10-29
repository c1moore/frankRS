'use strict';

/**
 * Module dependencies.
 */

//TODO req.hasAuthorization(req.user,String[]) implement role verification

var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

var canViewEvent = function(user,eventID) {
	var statusArray = user.status;
	for (var i = 0; i<statusArray.length;i++) {
		if(statusArray[i].event_id==eventID) {
			return true;
		}
	}
	return false;
}

exports.getMyEvents = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	}
	var id = req.user._id;
	var query = User.findOne({_id: id});
	var user;
	query.exec(function(err,result) {
		user = result;
		if (err) {res.status(400).send(err);return;}
		else if (!user) {res.status(400).json({message: "No user found!"});return;}
		var myEvents = [];
		var statusArray = user.status;
		for (var i = 0; i<statusArray.length;i++)
			myEvents.push(statusArray[i].event_id);
		res.status(200).json({events: myEvents});
	});
};

exports.getAllEvents = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!req.hasAuthorization(req.user,["admin"])) {
		res.status(401).json({message: "Access Denied. This incident will be reported."});
		return;
	}
	var query = Event.find({});
	query.exec(function(err,result) {
		if (err) {res.status(400).send(Err);return;}
		else if (!result) {res.status(400).json({message: "No events found?!"});return;}
		res.status(200).json(result);
	});
};

exports.getStartDate = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.session.id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No event with that id!"});
		else res.status(200).json({start_date: theResult.start_date});
	});
};

exports.getEndDate = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.session.id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No end date!"});
		else res.status(200).json({end_date: theResult.end_date});
	});
};

exports.getLocation = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.user._id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No location!"});
		else res.status(200).json({location: theResult.location});
	});
};

exports.getEventObj = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.session.id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No such object!"});
		else res.status(200).json(theResult);
	});
};

exports.getSchedule = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.session.id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No schedule!"});
		else res.status(200).json({schedule: theResult.schedule});
	});
};

exports.getName = function(req, res) {
	if (!req.isAuthenticated()) {
		res.status(400).json({message: "You are not logged in"});
		return;
	} else if (!canViewEvent(req.user,req.body.eventID)) {
		res.status(401).json({message: "Access denied"});
		return;
	}
	var id = req.session.id;
	var eventID = req.body.eventID;
	var query = Event.findOne({_id: eventID});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No name!"});
		else res.status(200).json({name: theResult.name});
	});
};
