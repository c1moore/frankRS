'use strict';

//Yes, this should probably go in routes, but I'm lazy

/**
 * Module dependencies.
 */
var errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	Candidate = mongoose.model('Candidate');



exports.getfName= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({fName: "No first name found!"});
		} else {
			res.status(200).json({fName : result.fName});
		}
	});
};

exports.getlName= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({lName: "No last name found!"});
		} else {
			res.status(200).json({lName : result.lName});
		}
	});
};
exports.getEmail= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({email: "No email found!"});
		} else {
			res.status(200).json({email : result.email});
		}
	});
};
exports.getStatus= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({status: "No status found!"});
		} else {
			res.status(200).json({status : result.status});
		}
	});
};
exports.getEvents= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({events: "No events found!"});
		} else {
			res.status(200).json({events : result.events});
		}
	});
};

exports.getAccept_Key= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({accept_key: "No accept_key found!"});
		} else {
			res.status(200).json({accept_key : result.accept_key});
		}
	});
};
exports.getNote= function(req, res) {
	var id = req.session.id;
	var query = Candidate.findOne({_id:id });
	query.exec(function(err,result) {
		if(err) {
			res.status(400).send(err);
		} else if(!result) {
			res.status(400).json({note: "No note found!"});
		} else {
			res.status(200).json({note : result.note});
		}
	});
};