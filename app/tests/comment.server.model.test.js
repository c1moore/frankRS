'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */

var should = require('should'),
	mongoose = require('mongoose'),
 	http = require('http'),
 	superagent = require('superagent'),
 	Comment = mongoose.model('Comment'),
	Evnt = mongoose.model('Event'),
 	User = mongoose.model('User'),
 	config = require('../../config/config'),
 	request = require('supertest');

/**
 * Globals
 */
var comment1, event1, recruiter;

/**
 * Unit tests
 */
describe('Comment Model Unit Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		Comment.remove().exec();
		Evnt.remove().exec();
		User.remove().exec();

		done();
	});

	beforeEach(function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name:  'testing123',
 			start_date: startDate,
 			end_date:  endDate,
 			location: 'UF',
 			schedule: 'www.google.com'
 		});

		recruiter = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee','recruiter'],
 			displayName: 'Full Name',
 			email: 'recruiter@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		comment1 = new Comment({
			user_id: recruiter._id,
			event_id: event1._id,
			comment: "A comment",
			interests: ['big','green','eggs'],
			stream: 'recruiter'
		});

 		event1.save(function(err){
			if(err) throw err;
			recruiter.save(function(err){
				if(err) throw err;
				done();
			});
		});
	});

	it('should be able to save a comment',function(done) {
		comment1.save(function(err) {
			if (err) throw err;
 			done();
		});
	});

	it('should not be able to save a comment that is empty',function(done) {
		comment1.comment = '';
		comment1.save(function(err) {
 			should.exist(err);
			done();
		});
	});

	it('should not be able to save a comment without a valid stream',function(done) {
		comment1.stream = 'santa';
		comment1.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should still be able to save a valid comment despite earlier tests',function(done) {
		comment1.save(function(err) {
			if (err) throw err;
			done();
		});
	});

	it('should not be able to save a comment where the user id is the wrong type',function(done) {
		comment1.user_id = "Wrong type";
		comment1.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should not be able to save a comment where the user id is undefined',function(done) {
		comment1.user_id = undefined;
		comment1.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should not be able to save a comment where the event id is undefined',function(done) {
		comment1.event_id = undefined;
		comment1.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should be able to save to the social comment stream',function(done) {
		comment1.stream = 'social';
		comment1.save(function(err) {
			if (err) throw err;
			done();
		});
	});

	it('should be able to set an explicit creation date',function(done) {
		comment1.date = new Date().getTime();
		comment1.save(function(err) {
			if (err) throw err;
			done();
		});
	});

	it('should not be able to set something other than a date into the date field',function(done) {
		comment1.date = "Not a date";
		comment1.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should be able to set the interests',function(done) {
		comment1.interests = ['dogs','cats'];
		comment1.save(function(err) {
			if (err) throw err;
			done();
		});
	});

	afterEach(function(done) {
		event1.remove(function(err) {
			if(err)
				return done(err);
		});
		recruiter.remove(function(err) {
			if(err)
				return done(err);
		});
		comment1.remove(function(err) {
			if(err)
				return done(err);
		});
 		done();
	});
});
