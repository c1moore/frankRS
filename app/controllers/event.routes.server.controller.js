'use strict';

/**
 * Module dependencies.
 */

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Candidate = mongoose.model('Candidate');

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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		} else if (!req.hasAuthorization(req.user,["admin"])) { //Only admins can view all events
			res.status(401).json({message: "User does not have permission."});
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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
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
			res.status(401).json({message: "User is not logged in."});
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

exports.getCapacity = function(req, res) {
	try {
		if(req.query.event_id == undefined) {
			return res.status(400).send({message : 'Required field not specified.'});
		}
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}

		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});

		query.exec(function(err,result) {
			if (err) res.status(400).send(err);
			else if (!result) res.status(400).json({message: "Event not found."});
			else res.status(200).json({capacity: result.capacity});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getAttending = function(req, res) {
	try {
		if(req.query.event_id == undefined) {
			return res.status(400).send({message : 'Required field not specified.'});
		}
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).send({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}

		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});

		query.exec(function(err,result) {
			if (err) res.status(400).send(err);
			else if (!result) res.status(400).json({message: "Event not found."});
			else res.status(200).json({attending: result.attending});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getInvited = function(req, res) {
	try {
		if(req.query.event_id == undefined) {
			return res.status(400).send({message : 'Required field not specified.'});
		}
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}

		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});

		query.exec(function(err,result) {
			if (err) res.status(400).send(err);
			else if (!result) res.status(400).json({message: "Event not found."});
			else res.status(200).json({invited: result.invited});
		});
	} catch (err) {
		console.log(err);
		res.status(500);
	}
};

exports.getStats = function(req, res) {
	try {
		if(req.query.event_id == undefined) {
			return res.status(400).send({message : 'Required field not specified.'});
		}
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!canViewEvent(req.user,req.query.event_id,req.hasAuthorization)) {
			res.status(401).json({message: "You do not have permission to request this ID"});
			return;
		}

		var event_id = mongoose.Types.ObjectId(req.query.event_id);
		var query = Event.findOne({_id: event_id});

		query.exec(function(err,result) {
			if (err) res.status(400).send(err);
			else if (!result) res.status(400).json({message: "Event not found."});
			else res.status(200).send({capacity : result.capacity, attending : result.attending, invited: result.invited});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
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
			else if (!theResult) res.status(400).json({message: "Event not found."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
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
			else if (!theResult) res.status(400).json({message: "Event not found."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
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
			else if (!theResult) res.status(400).json({message: "Event not found."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
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
		var validKeys = ["name","schedule","location","start_date","end_date", "capacity"];
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
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
			else if (!theResult) res.status(400).json({message: "Event not found."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_name = req.body.name;
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "Event not found."});
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

exports.setCapacity = function(req, res) {
	try {
		//Since capacity can be 0 and capacity could be a string, convert it to a number and check if it is NaN.  Just checking isNaN may give unexpected results.
		if(!req.body.event_id || req.body.capacity == null || isNaN(new Number(req.body.capacity))) {
			res.status(400).send({message : 'Required fields not specified.'});
			return;
		}
		if (!req.isAuthenticated()) { //Must be logged in
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must have permission to make requests on this ID
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
			return;
		}

		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var new_capacity = req.body.capacity;
		var query = Event.findOne({_id: event_id});

		query.exec(function(err,result) {
			if (err) res.status(400).send(err);
			else if (!result) res.status(400).json({message: "Event not found."});
			else {
				result.capacity = new_capacity;
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must be an admin
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
			return;
		}
		var event_id = mongoose.Types.ObjectId(req.body.event_id);
		var query = Event.findOne({_id: event_id});
		var theResult;
		query.exec(function(err,result) {
			theResult = result;
			if (err) res.status(400).send(err);
			else if (!theResult) res.status(400).json({message: "Event not found."});
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
			res.status(401).json({message: "User is not logged in."});
			return;
		//Must be an admin
		} else if (!req.hasAuthorization(req.user,["admin"])) {
			res.status(401).json({message: "User does not have permission."});
			return;
		}
		var eventObj = {
			name: 		req.body.name,
			start_date: req.body.start_date,
			end_date: 	req.body.end_date,
			location: 	req.body.location,
			schedule: 	req.body.schedule,
			capacity: 	req.body.capacity
		};
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
			return res.status(401).json({message: "User is not logged in."});
		}

		//Find and return all events in the collection
		var query = Event.find({});
		query.exec(function(err,events) {
			if (err) {
				return res.status(400).send({message : err});
			} else if (!events.length) {
				return res.status(400).json({message: "No events found?!"});
			} else {
				var query = Candidate.findOne({email : req.user.email});
				query.exec(function(err, candidate) {
					if(err) {
						return res.status(400).send({message : err});
					} else if(!candidate) {
						var eventsResult = [];
						for(var i=0; i<events.length; i++) {

							eventsResult[i] = {};
							eventsResult[i] = events[i].toObject();
							eventsResult[i].applied = false;

							var j = 0;
							for(; j<req.user.status.length; j++) {
								if(events[i]._id.toString() === req.user.status[j].event_id.toString()) {
									eventsResult[i].recruiter = req.user.status[j].recruiter;
									break;
								}
							}

							if(j === req.user.status.length) {
								eventsResult[i].recruiter = false;
							}
						}

						res.status(200).send(eventsResult);
					} else {
						var eventsResult = [];
						for(var i=0; i<events.length; i++) {

							eventsResult[i] = {};
							eventsResult[i] = events[i].toObject();
							eventsResult[i].applied = false;

							var j = 0;
							for(; j<req.user.status.length; j++) {
								if(events[i]._id.toString() === req.user.status[j].event_id.toString()) {
									eventsResult[i].recruiter = req.user.status[j].recruiter;
									break;
								}
							}

							if(j === req.user.status.length) {
								eventsResult[i].recruiter = false;
							}

							for(j=0; j<candidate.events.length; j++) {
								if(candidate.events[j].event_id.toString() === events[i]._id.toString()) {
									eventsResult[i].applied = candidate.events[j].status;
									break;
								}
							}

							if(j === candidate.events.length) {
								eventsResult[i].applied = false;
							}
						}

						res.status(200).send(eventsResult);
					}
				});
			}
		});
	} catch(err) {
		console.log(err);
		res.status(500).send();
	}
};
