'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest'),
	agent = require('superagent'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

/**
 * Globals
 */
var user, user2, user3, user4, user5, event1, event2, event3, event4,
	useragent = agent.agent(), useragent2 = agent.agent();

/*
* Helper function to check if the events returned by getRecruiterEvents in the users.routes.server.controller.js file
* only returns the events for which the user is recruiting by comparing the ObjectIDs of the results to the actual
* ObjectIDs that should be returned.
*/
var checkRecruiterEvents = function(events) {
	var recruiterEvents = [event1._id.toString(), event2._id.toString(), event3._id.toString()];

	if(events.length !== recruiterEvents.length)
		return false;

	for(var i=0; i<events.length; i++) {
		if(!(_.intersection([events[i].event_id._id.toString()], recruiterEvents).length))
			return false;
	}

	return true;
};

/**
 * Unit tests
 */
describe('Express.js User Route Unit Tests:', function() {
	before(function(done) {
  		event1 = new Event({
			name:  'Event1',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'UF',
			schedule: 'www.google.com'
		});

		event2 = new Event({
			name:  'Event2',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'SFCC',
			schedule: 'www.google.com'
		});

		event3 = new Event({
			name:  'Event3',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'SFCC',
			schedule: 'www.google.com'
		});

		event4 = new Event({
			name:  'Event4',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'SFCC',
			schedule: 'www.google.com'
		});

		event1.save(function() {
			event2.save(function() {
				event3.save(function() {
					event4.save(function() {
						user2 = new User({
							fName : 'Calvin',
							lName : 'Moore',
							displayName : 'Moore, Calvin',
							email : 'calvin@example.com',
							roles : ['attendee'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							password : 'password',
							login_enabled : true
						});

						user3 = new User({
							fName : 'Nother',
							lName : 'Name',
							displayName : 'Name, Nother',
							email : 'nother.name@example.com',
							roles : ['attendee'],
							status : [],
							password : 'password',
							login_enabled : true
						});

						user4 = new User({
							fName : 'Example',
							lName : 'Name',
							displayName : 'Name, Example',
							email : 'example.name@example.com',
							roles : ['attendee', 'recruiter'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}],
							attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}],
							inviteeList : [{'user_id' : user3._id, 'event_id' : event1._id}, {'user_id' : user2._id, 'event_id' : event1._id}],
							password : 'password',
							login_enabled : true
						});

						user5 = new User({
							fName : 'My',
							lName : 'Name',
							displayName : 'Name, My',
							email : 'myname@email.com',
							roles : ['admin'],
							password : 'password',
							login_enabled : true
						});

						user = new User({
							fName : 'Calvin',
							lName : 'Moore',
							displayName : 'Moore, Calvin',
							email : 'test@example.com',
							roles : ['recruiter'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							rank : [{'event_id':event1._id, 'place':1}, {'event_id':event2._id, 'place':2}, {'event_id':event3._id, 'place':3}],
							password : 'password',
							attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}, {'user_id' : user3._id, 'event_id' : event2._id}, {'user_id' : user4._id, 'event_id' : event1._id}],
							inviteeList : [{'user_id' : user3._id, 'event_id' : event1._id}],
							almostList : [{'user_id' : user4._id, 'event_id' : event2._id}, {'user_id' : user2._id, 'event_id' : event2._id}],
							login_enabled : true
						});

						user2.save(function(err) {
							user3.save(function(err) {
								user4.save(function(err) {
									user5.save(function(err) {
										user.save(function(err) {
											useragent2
												.post('http://localhost:3001/auth/signin')
												.send({'email' : user2.email, 'password' : 'password'})
												.end(function(err, res) {
													done(err);
												});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it("should be able to access the main page from the user route testing mechanism", function(done) {
		request('http://localhost:3001/')
			.get('')
			.expect(200)
			.end(function(err, res) {
				done(err);
			});
	});

	it('should be able to log in.', function(done) {
		useragent
			.post('http://localhost:3001/auth/signin')
			.send({'email' : user.email, 'password' : 'password'})
			.end(function(err, res) {
         		should.not.exist(err);
          		res.status.should.equal(200);
				done();
			});
	});

	it('should not be able to log in if login_enabled is false.', function(done) {
		var useragent3 = agent.agent();
		var tempUser = new User({
			fName : 'Temp',
			lName : 'User',
			email : 'tempuser123@gmail.com',
			password : '123password',
			login_enabled : false,
			roles : ['attendee']
		});

		tempUser.save(function() {
			useragent3
				.post('http://localhost:3001/auth/signin')
				.send({'email' : tempUser.email, 'password' : '123password'})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("User cannot log into account yet.  You must sign up to attend the event to which you were invited.");
					done();
				});
		});
	});

	describe('Leaderboard routes:', function() {
		it('should be able to get leaderboard when they have the proper roles.', function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(200);
	          		res.body.length.should.equal(2);

	          		var i;
	          		for(i=0; i<res.body.length; i++) {
	          			if(res.body[i]._id.toString() === user._id.toString())
	          				break;
	          		}

	          		res.body[i].attending.should.equal(2);
	          		res.body[i].invited.should.equal(1);
	          		res.body[i].place.should.equal(1);
					done();
				});
		});

		it('should return an error when no event_id is specified.', function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/maintable')
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(400);
	          		res.body.message.should.equal('Event not specified.');
					done();
				});
		});

		it('should fail to get leaderboard when the user does not have proper roles.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(401);
	          		res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should fail to get leaderboard when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('Recruiter events routes:', function() {
		it('should return an array of events for which the user is recruiting', function(done) {
			useragent
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					checkRecruiterEvents(res.body).should.be.true;
					done();
				});
		});

		it('should return an error when the user is not a recruiter', function(done) {
			useragent2
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('User events routes:', function() {
		it('should return an array of events for which the user is associated', function(done) {
			useragent
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					console.log(res.body);
					res.body.status.length.should.equal(4);
					done();
				});
		});

		it('should return an array of events for the user even if they are not a recruiter', function(done) {
			useragent2
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.status.length.should.equal(4);
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's leaderboard status information:", function() {
		it("should return a recruiter's information.", function(done) {
			useragent
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					console.log(res.body);
					res.status.should.equal(200);
					res.body.attending.should.equal(2);
					res.body.invited.should.equal(1);
					res.body.place.should.equal(1);
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's attendeeList routes:", function() {
		it("should return a recruiter's attendeeList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(2);
					for(var i=0; i<res.body.length; i++) {
						res.body[i].event_id.toString().should.equal(event1._id.toString());
					}
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/attendees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's inviteeList routes:", function() {
		it("should return a recruiter's inviteeList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(1);
					res.body[0].event_id.toString().should.equal(event1._id.toString());
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/invitees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's almostList routes:", function() {
		it("should return a recruiter's almostList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(2);
					for(var i=0; i<res.body.length; i++) {
						res.body[i].event_id.toString().should.equal(event2._id.toString());
					}
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/almosts')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Leaderboard attendeeList controllers:", function() {
		it("should return the attendeeList for a specific event (for all recruiters).", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					var recruiter1=0, recruiter2=0;
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].recruiterName === "Moore, Calvin")
							recruiter1++;
						else if(res.body[i].recruiterName === "Name, Example")
							recruiter2++;
					}

					recruiter1.should.equal(2);
					recruiter2.should.equal(1);
					
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/attendees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Leaderboard inviteeList controllers:", function() {
		it("should return the inviteeList for a specific event (for all recruiters).", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id}).end(function(err, res) {
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					var recruiter1=0, recruiter2=0;
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].recruiterName === "Moore, Calvin")
							recruiter1++;
						else if(res.body[i].recruiterName === "Name, Example")
							recruiter2++;
					}

					recruiter1.should.equal(1);
					recruiter2.should.equal(2s);
					
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/invitees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('Sending an invitation', function() {
		it('should send an invitation and update the recruiter\'s rank and inviteeList accordingly when an invitee is already in the database and has been invited, but not attending the event, without adding a new user.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'fName' : user5.fName, 'lName' : user5.lName, 'email' : user5.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					console.log(res.body);
					res.status.should.equal(200);
					done();
				});
		});

		it('should send an invitation and update the recruiter\'s rank and inviteeList accordingly when an invitee is already in the database, but not not even invited the event, without adding a new user.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'fName' : user3.fName, 'lName' : user3.lName, 'email' : user3.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					done();
				});
		});

		it('should send an invitation, create a new user, and update the recruiter\'s rank and inviteeList accordingly when an invitee is not in the db yet.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : 'Moore', 'fName' : 'Calvin', 'email' : 'h.m.murdock95@gmail.com', 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					done();
				});
		});

		it('should not send an invitation, but update the recruiter\'s almostList when that user is attending.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					done();
				});
		});

		it('should not send an invitation when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");
					done();
				});
		});

		it('should not send an invitation when the user is not signed in to their account.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");
					done();
				});
		});

		it('should return an error when invitee first name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when invitee last name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when invitee email is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when the event ID is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when the event name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});
	});

	describe('Obtain specific user information:', function() {
		it('should return the user displayname, which should be in the format "Last, First"', function(done) {
			useragent
				.get('http://localhost:3001/users/displayName')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.displayName.should.equal(user.displayName);
					done();
				});
		});

		it('should return an error when requesting the displayname if the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/displayName')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");
					done();
				});
		});

		it('should return the user email address', function(done) {
			useragent
				.get('http://localhost:3001/users/email')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.email.should.equal(user.email);
					done();
				});
		});

		it('should return an error when requesting user email address if the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/email')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	after(function(done) {
		User.remove().exec();
		Event.remove().exec();
		//event1.remove();
		//event2.remove();
		//event3.remove();
		//event4.remove();
		//user.remove();
		//user2.remove();
		//user3.remove();
		//user4.remove();
		done();
	});

});
