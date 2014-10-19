'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

exports.getMyEvents = function(req, res) {
	var id = req.body.session.id;
	var query = User.findOne({_id: id});
	var user;
	query.exec(function(err,result) {
		user = result;
		if (err) res.status(400).send(err);
		else if (!user) res.status(400).json({events: ["No user found!"]});
		var myEvents = [];
		var statusArray = user.status;
		for (var i = 0; i<statusArray.length;i++)
			myEvents.push(statusArray[i].event_id);
		res.status(200).json({events: myEvents});
	});
};
		

exports.getStartDate = function(req, res) {
	var eventName = req.body.name;
	var query = Event.findOne({name: eventName});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({start_date: "No start date!"});
		else res.status(200).json({start_date: theResult.start_date});
	});
};

exports.getEndDate = function(req, res) {
	var eventName = req.body.name;
	var query = Event.findOne({name: eventName});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({end_date: "No end date!"});
		else res.status(200).json({end_date: theResult.end_date});
	});
};

exports.getLocation = function(req, res) {
	var eventName = req.body.name;
	var query = Event.findOne({name: eventName});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({location: "No location!"});
		else res.status(200).json({location: theResult.location});
	});
};

exports.getEventObj = function(req, res) {
	var eventName = req.body.name;
	var query = Event.findOne({name: eventName});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({message: "No such object!"});
		else res.status(200).json(theResult);
	});
};

exports.getSchedule = function(req, res) {
	var eventName = req.body.name;
	var query = Event.findOne({name: eventName});
	var theResult;
	query.exec(function(err,result) {
		theResult = result;
		if (err) res.status(400).send(err);
		else if (!theResult) res.status(400).json({schedule: "No schedule!"});
		else res.status(200).json({schedule: theResult.schedule});
	});
};
