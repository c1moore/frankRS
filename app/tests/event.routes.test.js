'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */

var should = require('should'),
	mongoose = require('mongoose'),
 	http = require('http'),
 	superagent = require('superagent'),
 	Evnt = mongoose.model('Event'),
 	User = mongoose.model('User'),
 	config = require('../../config/config'),
 	request = require('supertest');

/**
 * Globals
 */
var event1, event2, numEvents = 2, user, userAdmin;
var agent = superagent.agent();
var agentAdmin = superagent.agent();

function arraysEqual(array0,array1) {
    if (array0.length !== array1.length) return false;
    for (var i = 0; i<array0.length; i++) {
        if (array0[i] !== array1[i]) return false;
    }
    return true;
}

/**
 * Unit tests
 */
describe('Event Route Integration Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove(function() {
			Evnt.remove(function() {
				done();			
			});
		});
	});

	beforeEach(function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name: 'testing1231',
 			start_date: startDate,
 			end_date: endDate,
 			location: 'UF',
 			schedule: 'www.google.com',
			capacity: 50,
			attending: 5,
			invited: 55
 		});

 		event2 = new Evnt({
 			name: 'testing1232',
 			start_date: startDate,
 			end_date: endDate,
 			location: 'UF2',
 			schedule: 'www.google.com',
			capacity: 50,
			attending: 5,
			invited: 25
 		});

 		event1.save(function(err){
			if(err) throw err;
			event2.save(function(err){
				if(err) throw err;

				user = new User({
		 			fName: 'Full',
		 			lName: 'Name',
		 			roles: ['attendee'],
		 			displayName: 'Full Name',
		 			email: 'test@test.com',
		 			password: 'password',
		 			status: [{event_id: event1._id, attending:false, recruiter:false}],
		 			salt: 'abc123',
		 			rank: [],
		 			provider: 'local',
		 			login_enabled: true
		 		});

				userAdmin = new User({
		 			fName: 'Full',
		 			lName: 'Name',
		 			roles: ['admin'],
		 			displayName: 'Full Name',
		 			email: 'admin@test.com',
		 			password: 'password',
		 			status: [{event_id: event1._id, attending:false, recruiter:false}],
		 			salt: 'abc123',
		 			rank: [],
		 			provider: 'local',
		 			login_enabled: true
		 		});

				user.save(function(err){
					if(err) throw err;
					userAdmin.save(function(err){
						if(err) throw err;
						done();
					});
				});
			});
		});
	});

 	it("should be able to access the main page from the event route testing mechanism", function(done) {
 		request('http://localhost:3001')
 			.get('/')
 			.expect(200,done);
 	});

 	it("should not be able to enumerate events when not signed in",function(done) {
 		request('http://localhost:3001')
			.get('/events/enumerate')
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event start date when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getStartDate')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event name when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getName')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event end date when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getEndDate')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

	it("should not be able to get the event location when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getLocation')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event schedule when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getSchedule')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event object when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getEventObj')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the event capacity when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/capacity')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the number of people attending the event when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/attending')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

 	it("should not be able to get the number of people invited to the event when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/invited')
 			.query({event_id: event1._id.toString()})
 			.expect(401)
 			.end(function(err, res) {
 				should.not.exist(err);
 				res.body.message.should.equal("User is not logged in.");
 				done();
 			});
 	});

	it("should not be able to sign in without a password", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: ''})
 			.end(function (err, res) {
				should.not.exist(err);
				res.status.should.be.equal(400);
       			done();
 			});
    });

 	it("should be able to sign in correctly", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       			done();
 			});
    });

 	it('should now be able to enumerate events when signed in', function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
					.get('http://localhost:3001/events/enumerate')
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
		 				res.body.should.have.property('events');
		 				res.body.events[0].toString().should.equal(event1._id.toString());
		 				done();
		 			});
		 	});
 	});

 	it("should now be able to get the event name when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getName')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.equal(event1.name);
						done();
					});
			});
 	});

	it("should now be able to get the event start date when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getStartDate')
		 			.query({event_id: event1._id.toString()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.equal(event1.start_date);
						done();
					});
			});
 	});

	 it("should now be able to get the event end date when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEndDate')
		 			.query({event_id: event1._id.toString()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('end_date');
						res.body.end_date.should.equal(event1.end_date);
						done();
					});
			});
 	});

	it("should now be able to get the event location when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getLocation')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('location');
						res.body.location.should.equal(event1.location);
		 				done();
		 			});
		 	});
 	});

	it("should now be able to get the event schedule when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getSchedule')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.equal(event1.schedule);
		 				done();
		 			});
		 	});
 	});

	it("should now be able to get the event capacity when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/capacity')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('capacity');
						res.body.capacity.should.equal(event1.capacity);
		 				done();
		 			});
		 	});
 	});

	it("should now be able to get the number of people attending the event when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/attending')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('attending');
						res.body.attending.should.equal(event1.attending);
		 				done();
		 			});
		 	});
 	});

	it("should now be able to get the number of people invited to the event when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/invited')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('invited');
						res.body.invited.should.equal(event1.invited);
		 				done();
		 			});
		 	});
 	});

	it("should now be able to get the event object when signed in", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEventObj')
		 			.query({event_id: event1._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.equal(event1.start_date);
						res.body.should.have.property('end_date');
						res.body.end_date.should.equal(event1.end_date);
						res.body.should.have.property('schedule');
						res.body.schedule.should.equal(event1.schedule);
						res.body.should.have.property('location');
						res.body.location.should.equal(event1.location);
						res.body.should.have.property('name');
						res.body.name.should.equal(event1.name);
		 				done();
		 			});
		 	});
 	});

	it("should not be able to enumerate all events when not an admin", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/enumerateAll')
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.be.equal('User does not have permission.');
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access an eventObj by ID if the user shouldn't know about it", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEventObj')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access start_date if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getStartDate')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access end_date if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEndDate')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access location if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getLocation')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access schedule if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getSchedule')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access event name if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getName')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access event capacity if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/capacity')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access the number attending the event if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/attending')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should not be able to access the number invited to the event if the user shouldn't know about that event", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/invited')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("You do not have permission to request this ID");
		 				done();
		 			});
		 	});
 	});

	it("should be able to login as admin",function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       				done();
 			});
    });

	it("should be able to enumerate all events when admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/enumerateAll')
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);

						if(res.body.length !== numEvents) {
							return done(new Error("Too few/many events returned."));
						}

						for(var i=0; i < res.body.length; i++) {
							if(res.body[i]._id.toString() !== event1._id.toString() && res.body[i]._id.toString() !== event2._id.toString()) {
								return done(new Error("Returned IDs are incorrect."));
							}
						}

		 				done();
		 			});
		 	});
 	});

	it("should be able to access any event by ID if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEventObj')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body._id.toString().should.equal(event2._id.toString());
		 				done();
		 			});
		 	});
 	});

	it("should be able to access start_date of any event if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getStartDate')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.equal(event2.start_date);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access any end_date if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getEndDate')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('end_date');
						res.body.end_date.should.equal(event2.end_date);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access any location if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getLocation')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('location');
						res.body.location.should.equal(event2.location);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access any schedule if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getSchedule')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.equal(event2.schedule);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access any event name if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/getName')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.equal(event2.name);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access any event capacity if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/capacity')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('capacity');
						res.body.capacity.should.equal(event2.capacity);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access the number attending for any event if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/attending')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('attending');
						res.body.attending.should.equal(event2.attending);
		 				done();
		 			});
		 	});
 	});

	it("should be able to access the number invited to any event if admin", function(done) {
 		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin //IMPORTANT: Agent does not support expect, use should
		 			.get('http://localhost:3001/events/invited')
					.query({event_id: event2._id.toString()})
		 			.end(function(err,res) {
		 				should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('invited');
						res.body.invited.should.equal(event2.invited);
		 				done();
		 			});
		 	});
 	});

	//Post tests
	/* Note: At this time, there will be no methods provided to set the number attending/invited generally.  These numbers can only be modified through invitations/acceptances. */
	
	it("should be able to set the name if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setName')
					.send({event_id: event2._id.toString(), name:"ItsANewNameDog"})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getName')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('name');
								res.body.name.should.be.equal("ItsANewNameDog");
								done();
							});
					});
			});
	});

	it("should not be able to set invalid name if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setName')
					.send({event_id: event2._id.toString(), name:""})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Validation failed");
						agentAdmin
							.get('http://localhost:3001/events/getName')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('name');
								res.body.name.should.be.equal("testing1232");
								done();
							});
					});
			});
	});

	it("should not be able to set name if user", function(done) {
		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/auth/signin')
					.send({email: userAdmin.email, password: 'password'})
		 			.end(function (err, res) {
		 				if(err)
		 					return done(err);

				 		agent
							.post('http://localhost:3001/events/setName')
							.send({event_id: event1._id.toString(), name:"UserName"})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(401);
								res.body.message.should.equal("User does not have permission.");
								agentAdmin
									.get('http://localhost:3001/events/getName')
									.query({event_id: event1._id.toString()})
									.end(function(err,res) {
										should.not.exist(err);
										res.status.should.be.equal(200);
										res.body.should.have.property('name');
										res.body.name.should.be.equal("testing1231");
										done();
									});
							});
					});
			});
	});

	it("should be able to set the capacity if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/capacity')
					.send({event_id: event2._id.toString(), capacity:0})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/capacity')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('capacity');
								res.body.capacity.should.be.equal(0);
								done();
							});
					});
			});
	});

	it("should not be able to set invalid capacity (null) if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/capacity')
					.send({event_id: event2._id.toString(), capacity: null})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Required fields not specified.");
						agentAdmin
							.get('http://localhost:3001/events/capacity')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('capacity');
								res.body.capacity.should.be.equal(event2.capacity);
								done();
							});
					});
			});
	});

	it("should not be able to set invalid capacity (-1) if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/capacity')
					.send({event_id: event2._id.toString(), capacity: -1})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Validation failed");
						agentAdmin
							.get('http://localhost:3001/events/capacity')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('capacity');
								res.body.capacity.should.be.equal(event2.capacity);
								done();
							});
					});
			});
	});

	it("should not be able to set capacity if user", function(done) {
		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/auth/signin')
					.send({email: userAdmin.email, password: 'password'})
		 			.end(function (err, res) {
		 				if(err)
		 					return done(err);

				 		agent
							.post('http://localhost:3001/events/capacity')
							.send({event_id: event1._id.toString(), capacity: 111})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(401);
								res.body.message.should.equal("User does not have permission.");
								agentAdmin
									.get('http://localhost:3001/events/capacity')
									.query({event_id: event1._id.toString()})
									.end(function(err,res) {
										should.not.exist(err);
										res.status.should.be.equal(200);
										res.body.should.have.property('capacity');
										res.body.capacity.should.be.equal(event1.capacity);
										done();
									});
							});
					});
			});
	});

	it("should not be able to set invalid start_date if admin", function(done) {
		var initStartDate = event2.start_date;

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setStartDate')
					.send({event_id: event2._id.toString(), start_date : new Date(2004,11,30,10,0,0).getTime()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Validation failed");

						agentAdmin
							.get('http://localhost:3001/events/getStartDate')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('start_date');
								res.body.start_date.should.be.equal(initStartDate);
								done();
							});
					});
			});
	});

	it("should be able to set start_date if admin", function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth + 43200000).getTime();				//Start date for 1 month from now.

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setStartDate')
					.send({event_id: event2._id.toString(), start_date : startDate})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getStartDate')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('start_date');
								res.body.start_date.should.be.equal(startDate);
								done();
							});
					});
			});
	});

	it("should not be able to set start_date if user", function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth + 43200000).getTime();				//Start date for 1 month from now.
		var initStartDate = event1.start_date;

		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/auth/signin')
					.send({email: userAdmin.email, password: 'password'})
		 			.end(function (err, res) {
		 				if(err)
		 					return done(err);

				 		agent
							.post('http://localhost:3001/events/setStartDate')
							.send({event_id: event1._id.toString(), start_date : new Date(startDate).getTime()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(401);
								agentAdmin
									.get('http://localhost:3001/events/getStartDate')
									.query({event_id: event1._id.toString()})
									.end(function(err,res) {
										should.not.exist(err);
										res.status.should.be.equal(200);
										res.body.should.have.property('start_date');
										res.body.start_date.should.be.equal(initStartDate);
										done();
									});
							});
					});
			});
	});

	it("should be able to set end_date if admin", function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var endDate = new Date(Date.now() + millisInMonth + 86450000).getTime();	//Event lasts a little over 1 day.

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setEndDate')
					.send({event_id: event2._id.toString(), end_date:new Date(endDate).getTime()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getEndDate')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('end_date');
								res.body.end_date.should.be.equal(endDate);
								done();
							});
					});
			});
	});

	it("should not be able to set invalid end_date if admin", function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var endDate = new Date(Date.now() + millisInMonth - 86400000).getTime();	//Event ends 1 day before the event starts.
		var initEndDate = event2.end_date;

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setEndDate')
					.send({event_id: event2._id.toString(), end_date : endDate})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Validation failed");
						agentAdmin
							.get('http://localhost:3001/events/getEndDate')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('end_date');
								res.body.end_date.should.be.equal(initEndDate);
								done();
							});
					});
			});
	});

	it("should not be able to set end_date if user", function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var endDate = new Date(Date.now() + millisInMonth + 86450000).getTime();	//Event lasts a little over 1 day.
		var initEndDate = event1.end_date;

		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/setEndDate')
					.send({event_id: event1._id.toString(), end_date : endDate})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.message.should.equal("User does not have permission.");
						agent
							.get('http://localhost:3001/events/getEndDate')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('end_date');
								res.body.end_date.should.be.equal(initEndDate);
								done();
							});
					});
			});
	});


	it("should be able to set location if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setLocation')
					.send({event_id: event2._id.toString(), location:"Rainbow2"})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getLocation')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('location');
								res.body.location.should.be.equal("Rainbow2");
								done();
							});
					});
			});
	});

	it("should not be able to set invalid location if admin", function(done) {
		var initLocation = event2.location;

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setLocation')
					.send({event_id: event2._id.toString(), location:""})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(400);
						res.body.message.should.equal("Validation failed");
						agentAdmin
							.get('http://localhost:3001/events/getLocation')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('location');
								res.body.location.should.be.equal(initLocation);
								done();
							});
					});
			});
	});

	it("should not be able to set location if user", function(done) {
		var initLocation = event1.location;

		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/setLocation')
					.send({event_id: event1._id.toString(), location:"UserLocation"})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.message.should.equal("User does not have permission.");
						agent
							.get('http://localhost:3001/events/getLocation')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('location');
								res.body.location.should.be.equal(initLocation);
								done();
							});
					});
			});
	});

	it("should be able to set schedule if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setSchedule')
					.send({event_id: event2._id.toString(), schedule:"BoBoBo"})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getSchedule')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('schedule');
								res.body.schedule.should.be.equal("BoBoBo");
								done();
							});
					});
			});
	});

	it("should be able to set schedule to empty string if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setSchedule')
					.send({event_id: event2._id.toString(), schedule:""})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						agentAdmin
							.get('http://localhost:3001/events/getSchedule')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('schedule');
								res.body.schedule.should.be.equal("");
								done();
							});
					});
			});
	});

	it("should not be able to set schedule if user for event I don't know about", function(done) {
		var initSched = event2.schedule;

		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/auth/signin')
					.send({email: userAdmin.email, password: 'password'})
		 			.end(function (err, res) {
		 				if(err)
		 					return done(err);

				 		agent
							.post('http://localhost:3001/events/setSchedule')
							.send({event_id: event2._id.toString(), schedule:"UserSchedule"})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(401);
								res.body.message.should.equal("User does not have permission.");

								agentAdmin
									.get('http://localhost:3001/events/getSchedule')
									.query({event_id: event2._id.toString()})
									.end(function(err,res) {
										should.not.exist(err);
										res.status.should.be.equal(200);
										res.body.should.have.property('schedule');
										res.body.schedule.should.be.equal(initSched);
										done();
									});
							});
					});
			});
	});

	it("should not be able to set schedule if user in general", function(done) {
		var initSched = event1.schedule;

		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/setSchedule')
					.send({event_id: event1._id.toString(), schedule:"UserSchedule"})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.message.should.equal("User does not have permission.");

						agent
							.get('http://localhost:3001/events/getSchedule')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('schedule');
								res.body.schedule.should.be.equal(initSched);
								done();
							});
					});
			});
	});

	it("should be able to update the event object if admin", function(done) {
		event2.name = "ReallyNewName";

		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/setEventObj')
					.send({event_id: event2._id.toString(), event:event2})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);

						agentAdmin
							.get('http://localhost:3001/events/getName')
							.query({event_id: event2._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('name');
								res.body.name.should.be.equal("ReallyNewName");
								Evnt.findOne({'_id' : event2._id}, function(err, result) {
									if(err)
										return done(err);

									res.body.name.should.be.equal(result.name);
									done();	
								});
							});
					});
			});
	});

	it("should not be able to update the event object if user", function(done) {
		var initName = event1.name;
		event1.name = "ReallyNewName2";
		
		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/setEventObj')
					.send({event_id: event1._id.toString(), event:event1})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.message.should.equal("User does not have permission.");

						agent
							.get('http://localhost:3001/events/getName')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.be.equal(200);
								res.body.should.have.property('name');
								res.body.name.should.be.equal(initName);
								done();
							});
					});
			});
	});

	it("should not be able to delete an event as a normal user", function(done) {
		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/delete')
					.send({event_id: event1._id.toString()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.message.should.equal("User does not have permission.");

						agent
							.get('http://localhost:3001/events/getName')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.equal(200);
								res.body.name.should.equal(event1.name);
								done();
							});
					});
			});
	});

	it("should be able to delete an event as an admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/delete')
					.send({event_id: event1._id.toString()})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);

						agentAdmin
							.get('http://localhost:3001/events/getName')
							.query({event_id: event1._id.toString()})
							.end(function(err,res) {
								should.not.exist(err);
								res.status.should.equal(400);
								res.body.message.should.equal("No name!");
								done();
							});
					});
			});
	});

	it("should be able to create an event using the event creation route as admin",function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agentAdmin
					.post('http://localhost:3001/events/create')
					.send({
						name: 		"NewName",
						start_date:	new Date().getTime()+100000,
						end_date: 	new Date().getTime()+1000000,
						location: 	"asdf",
						schedule: 	"asdf",
						capacity: 	50
					})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(200);
						res.body.should.have.property('event_id');

						Evnt.findOne({_id : mongoose.Types.ObjectId(res.body.event_id)}, function(err, result) {
							if(err)
								return done(err);

							if(result)
								return done();

							return done(new Error("New event not actually created."));
						});
					});
			});
	});

	it("should not be able to create an event using the event creation route as a user",function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function (err, res) {
 				if(err)
 					return done(err);

		 		agent
					.post('http://localhost:3001/events/create')
					.send({
						name:		"NewName",
						start_date:	new Date().getTime()+100000,
						end_date:	new Date().getTime()+1000000,
						location:	"asdf",
						schedule:	"asdf"
					})
					.end(function(err,res) {
						should.not.exist(err);
						res.status.should.be.equal(401);
						res.body.should.have.property('message');
						res.body.message.should.equal("User does not have permission.");

						Evnt.find({}, function(err, result) {
							if(err)
								return done(err);

							if(result.length === 2)
								return done();

							return done(new Error("Event was created."));
						});
					});
			});
	});

	afterEach(function(done) {
		Evnt.remove(function(err) {
			if(err)
				return done(err);

			User.remove(function(err) {
				if(err)
					return done(err);

				done();
			});
		});
	});
});
