'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	http = require('http'),
	request = require('supertest'),
	agent = require('superagent'),
	User = mongoose.model('User'),
	Evnt = mongoose.model('Event');

/**
* Globals
*/

var user, user2, event1,
	useragent = agent.agent(),
	useragent2 = agent.agent();

describe('Functional tests for preview controllers/routes:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove().exec();
		Evnt.remove().exec();

		done();
	});

	beforeEach(function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name : 'Test Event',
			location : 'UF',
			start_date : startDate,
			end_date : endDate
		});

		user = new User({
			email : 'testuser@email.com',
			roles : ['recruiter'],
			password : 'password',
			login_enabled : true,
			status : [{event_id : event1._id, attending : true, recruiter : true}]
		});

		user2 = new User({
			email : 'testuser2@email.com',
			roles : ['attendee'],
			password : 'password',
			login_enabled : true
		});

		event1.save(function(err) {
			if(err)
				return done(err);

			user.save(function(err) {
				if(err)
					return done(err);

				user2.save(function(err) {
					if(err)
						return done(err);

					useragent
						.post('http://localhost:3001/auth/signin')
						.send({email : user.email, password : 'password'})
						.end(function(err, res) {
							if(err)
								return done(err);

							if(res.status !== 200)
								return done("useragent could not log in.");

							useragent2
								.post('http://localhost:3001/auth/signin')
								.send({email : user2.email, password : 'password'})
								.end(function(err, res) {
									if(err)
										return done(err);
									if(res.status !== 200)
										return done("useragent could not log in.");

									done();
								});
						});
				});
			});
		});
	});

	it('should return the contents of template invitation when user has proper permissions.', function(done) {
		useragent
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : event1.name, event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.preview.should.equal("This is a test to {{determine}} whether <or not> this method can truly return everything \"I expect \" it to 'contain.'  I hope it does; however, I have been wrong before.");
				done();
			});
	});

	it('should be able to find and return the proper file despite extra punctuation.', function(done) {
		event1.name = "'Test ! Event !@#$%^&*() _2";
		event1.save(function() {
			useragent
				.get('http://localhost:3001/preview/invitation')
				.query({event_name : event1.name, event_id : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.preview.replace(/(\r\n|\n|\r)/gm,"").replace(/\t/g, "").should.equal('<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head></head><body><p>Hello {{name}},</p><br /><p>You have been invited to attend {{event}}.  This is only a template since frank creates new invitations every year, but this gives anybody viewing this demo an example of what will happen.  Oh, by the way, here is the personal message we entered earlier:</p><p>{{message}}</p><br /><br /><p> -frank</p></body></html>');
					done();
				});
		});
	});

	it('should return an error message when the event_id and event_name does not match.', function(done) {
		useragent
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : "Test Event 2", event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('You do not have permission to view this template.');
				done();
			});
	});

	it('should return an error message when the user does not have the proper permissions.', function(done) {
		useragent2
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : event1.name, event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('User does not have permission.');
				done();
			});
	});

	it('should return an error message when the user is a recruiter but does not have permission to view this template.', function(done) {
		useragent
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : event1.name, event_id : mongoose.Types.ObjectId()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('You do not have permission to view this template.');
				done();
			});
	});

	it('should return an error message when the user is not logged in.', function(done) {
		var useragent3 = agent.agent();
		useragent3
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : event1.name, event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal('User is not logged in.');
				done();
			});
	});

	it('should return an error message when an event_name is not specified.', function(done) {
		useragent
			.get('http://localhost:3001/preview/invitation')
			.query({event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal('Event name or id not specified.');
				done();
			});
	});

	it('should return an error message when an event_id is not specified.', function(done) {
		useragent
			.get('http://localhost:3001/preview/invitation')
			.query({event_name : event1.name})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal('Event name or id not specified.');
				done();
			});
	});

	afterEach(function(done) {
		Evnt.remove(function(err) {
			if(err)
				return done(err);
		});

		User.remove(function(err) {
			if(err)
				return done(err);
		});

		done();
	});
});