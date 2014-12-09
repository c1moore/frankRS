'use strict';

/**
 * Module dependencies.
 */

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

var canViewEvent = function(user,event_id,hasAuthorization) {
	try {
		var statusArray = user.status;
		for (var i = 0; i<statusArray.length;i++) {
			if(statusArray[i].event_id.toString()==event_id.toString()) {
				return true;
			}
		}
		if (hasAuthorization(user,['admin'])) return true;
		return false;
	} catch (err) {
		console.log(err);
	}
};

//NOTE: Leaderboard in User has more routes to get events just for recruiters, events being recruited for
//		etc. This event getter is just the tip of the iceberg
exports.getMyEvents = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Check if the user is authenticated
			res.status(401).json({message: "You are not logged in"});
			return;
		}
		var id = req.user._id;
		var query = User.findOne({_id: id});
		var user;
		//Retrieve user events on behalf of the authenticated user
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
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getAllEvents = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		} else if (!req.hasAuthorization(req.user,["admin"])) { //Only admins can view all events
			res.status(401).json({message: "Access Denied. This incident will be reported."});
			return;
		}
		//Find and return all events in the collection
		var query = Event.find({});
		query.exec(function(err,result) {
			if (err) {res.status(400).send(err);return;}
			else if (!result) {res.status(400).json({message: "No events found?!"});return;}
			res.status(200).json(result);
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getStartDate = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Check authorization
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		//Retrieve the requested field
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event with that id!"});
			else res.status(200).json({start_date: theResult.start_date});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getEndDate = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No end date!"});
			else res.status(200).json({end_date: theResult.end_date});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getLocation = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No location!"});
			else res.status(200).json({location: theResult.location});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getEventObj = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No such object!"});
			else res.status(200).json(theResult);
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getSchedule = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No schedule!"});
			else res.status(200).json({schedule: theResult.schedule});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getName = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No name!"});
			else res.status(200).json({name: theResult.name});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

//Setter routes

exports.setStartDate = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Check authorization
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		//Retrieve the requested field
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_start_date = req.body.start_date;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.start_date = new_start_date;
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.setEndDate = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var id = req.session.id;
		var event_id = req.body.event_id;
		var new_end_date = req.body.end_date;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.end_date = new_end_date;
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.setLocation = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var id = req.user._id;
		var event_id = req.body.event_id;
		var new_location = req.body.location;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.location = new_location;
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.setEventObj = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var id = req.session.id;
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_event = req.body.event;
		if (new_event==undefined) {
			res.status(400).json({message: "No event provided"});
			return;
		} else if (typeof(new_event)!="object") {
			res.status(400).json({message: "Unexpected type"});
			return;
		}
		var query = Event.findOne({_id: event_id});
		var theResult;
		var validKeys = ["name","schedule","location","start_date","end_date"];
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No such object!"});
			else {
				for (var i=0; i<validKeys.length; i++) {
					result[validKeys[i]]=new_event[validKeys[i]];
					//res.status(400).send(key);
				}
				/*for (var i = 0; i < 5; i++) {
				result.name = new_event.name;
				result.schedule = new_event.schedule;
				result.start_date = new_event.start_date;
				result.end_date = new_event.end_date;
				result.location = new_event.location;
				}*/
				//res.status(400).json(new_event[]);
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.setSchedule = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var id = req.session.id;
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_schedule = req.body.schedule;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.schedule = new_schedule;
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.setName = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_name = req.body.name;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.name = new_name;
				result.save(function(err) {
					if (err) {
						res.status(400).send(err);
						return;
					}
					res.status(200).send();
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.delete = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must be an admin
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "No event object with that ID"});
			else {
				result.remove();
				res.status(200).send();
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.create = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "You are not logged in"});
			return;
		//Must be an admin
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "Access denied"});
			return;
		}
		var eventObj = {name: req.body.name,start_date: req.body.start_date,end_date: req.body.end_date,
					location: req.body.location,schedule: req.body.schedule};
		var newEvent = new Event(eventObj);
		newEvent.save(function (err) {
			if (err) {
				res.status(400).json(err);
			} else {
				res.status(200).json({event_id: newEvent._id});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.recruiterStatus = function(req, res) {
	try {
		if (!req.isAuthenticated()) { //Must be logged in
			return res.status(401).json({message: "You are not logged in"});
		}

		//Find and return all events in the collection
		var query = Event.find({});
		query.exec(function(err,result) {
			if (err) {
				return res.status(400).send({message : err});
			} else if (!result.length) {
				return res.status(400).json({message: "No events found?!"});
			} else {
				var eventsResult = [];
				for(var i=0; i<result.length; i++) {

					eventsResult[i] = {};
					eventsResult[i] = result[i];

					var j = 0;
					for(; j<req.user.status.length; j++) {
						if(result[i]._id.toString() === req.user.status[j].event_id.toString()) {
							eventsResult[i].recruiter = req.user.status[j].recruiter;
							break;
						}
					}

					if(j === req.user.status.length) {
						eventsResult[i].recruiter = false;
					}
				}

				res.status(200).send(eventsResult);
			}
		});
	} catch(err) {
		console.log(err);
		res.status(500).send();
	}
};
