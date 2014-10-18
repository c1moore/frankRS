'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('Event');

exports.getStartDate = function(req, res) {
	var id = req.body.session.id;
	var eventName = req.body.eventName;
	var query = Event.findOne({name: eventName});
	var theResult;
	var err;
	query.exec(function(err,result) {
		theResult = result;
		err = err;
		if (err) res.status(400).send(theError);
		else if (!theResult) res.status(400).json({start_date: "No start date!"});
		else res.status(200).json({start_date: theResult.start_date});
	});
};

exports.getEndDate = function(req, res) {
	var id = req.body.session.id;
	var eventName = req.body.eventName;
	var query = Event.findOne({name: eventName});
	var theResult;
	var err;
	query.exec(function(err,result) {
		theResult = result;
		err = err;
		if (err) res.status(400).send(theError);
		else if (!theResult) res.status(400).json({end_date: "No end date!"});
		else res.status(200).json({end_date: theResult.end_date});
	});
};

exports.getLocation = function(req, res) {
	var id = req.body.session.id;
	var eventName = req.body.eventName;
	var query = Event.findOne({name: eventName});
	var theResult;
	var err;
	query.exec(function(err,result) {
		theResult = result;
		err = err;
		if (err) res.status(400).send(theError);
		else if (!theResult) res.status(400).json({location: "No location!"});
		else res.status(200).json({location: theResult.location});
	});
};

exports.getEventObj = function(req, res) {
	var id = req.body.session.id;
	var eventName = req.body.eventName;
	var query = Event.findOne({name: eventName});
	var theResult;
	var err;
	query.exec(function(err,result) {
		theResult = result;
		err = err;
		if (err) res.status(400).send(theError);
		else if (!theResult) res.status(400).json({message: "No such object!"});
		else res.status(200).json(theResult);
	});
};

exports.getSchedule = function(req, res) {
	var id = req.body.session.id;
	var eventName = req.body.eventName;
	var query = Event.findOne({name: eventName});
	var theResult;
	var err;
	query.exec(function(err,result) {
		theResult = result;
		err = err;
		if (err) res.status(400).send(theError);
		else if (!theResult) res.status(400).json({schedule: "No schedule!"});
		else res.status(200).json({schedule: theResult.schedule});
	});
};
