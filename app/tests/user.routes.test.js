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
var user, user2, event1, event2, event3, event4,
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
						user = new User({
							fName : 'Calvin',
							lName : 'Moore',
							displayName : 'Moore, Calvin',
							email : 'test@example.com',
							roles : ['recruiter'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							password : 'password',
							login_enable : true
						});

						user2 = new User({
							fName : 'Calvin',
							lName : 'Moore',
							email : 'calvin@example.com',
							roles : ['attendee'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							password : 'password',
							login_enable : true
						});

						user.save(function(err) {
							user2.save(function(err) {
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

	it('should be able to get leaderboard when they have the proper roles.', function(done) {
		useragent
			.post('http://localhost:3001/leaderboard/maintable')
			.end(function(err, res) {
         		should.not.exist(err);
          		res.status.should.equal(200);
				done();
			});
	});

	it('should fail to get leaderboard when the user does not have proper roles.', function(done) {
		useragent2
			.post('http://localhost:3001/leaderboard/maintable')
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
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('User is not logged in.');
				done();
			});
	});

	it('should return an array of events for which the user is recruiting', function(done) {
		useragent
			.post('http://localhost:3001/recruiter/events')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				checkRecruiterEvents(res.body).should.be.true;
				done();
			});
	});

	it('should return an error when the user is not a recruiter', function(done) {
		useragent2
			.post('http://localhost:3001/recruiter/events')
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
			.post('http://localhost:3001/recruiter/events')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('User is not logged in.');
				done();
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
		event1.remove();
		event2.remove();
		event3.remove();
		event4.remove();
		user.remove();
		user2.remove();
		done();
	});

});
