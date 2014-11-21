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
	Event = mongoose.model('Event'),
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
	beforeEach(function(done) {
		User.remove().exec(); //Prevent earlier failed tests from poisoning us
		Event.remove().exec();
		Comment.remove().exec();
		event1 = new Event({
			name:  'testing123',
 			start_date: new Date(2140,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
 			end_date:  new Date(2150,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
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

	afterEach(function(done) {
		event1.remove();
		recruiter.remove();
		comment1.remove();
 		done();
	});
});
