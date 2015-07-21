'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Evnt = mongoose.model('Event'),
	Email = mongoose.model('Email'),
	http = require('http'),
	request = require('supertest'),
	agent = require('superagent');

/**
 * Globals
 */
var user, user2, event1, event2, email,
	anonymAgent = agent.agent();

/**
 * Unit tests
 */
describe('Images Functional Tests:', function() {

	before(function(done) {
		Email.remove(function(err) {
			if(err) {
				return done(err);
			}

			User.remove(function(err) {
				if(err) {
					return done(err);
				}

				Evnt.remove(function(err) {
					if(err) {
						return done(err);
					}

			  		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
					var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
					var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

					event1 = new Evnt({
						name: 			'Testing',
						start_date: 	startDate,
						end_date: 		endDate,
						location: 		'Work',
						capacity: 		200
					});

					event1.save(done);
				});
			});	
		});
	});

	describe('Method', function() {
		beforeEach(function(done) {
			user2 = new User({
				fName: 			'Full',
				lName: 			'Name',
				roles: 			['attendee'],
				email: 			'invitee_cen3031.0.boom0625@spamgourmet.com',
				password: 		'password',
				login_enabled: 	false
			});

			user = new User({
				fName: 			'Full',
				lName: 			'Name',
				roles: 			['recruiter'],
				email: 			'recruiter_cen3031.0.boom0625@spamgourmet.com',
				password: 		'password',
				rank: 			[{'event_id': event1._id, 'place': 1}],
				login_enabled: 	true
			});

			email = new Email({
				to: 		'invitee_cen3031.0.boom0625@spamgourmet.com',
				from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
				subject: 	'Test Email, Not Sent',
				message: 	'This message will not be sent, it is only for testing purposes.',
				read: 		false,
				event_id: 	event1._id
			});

			user2.save(function(err) {
				if(err) {
					return done(err);
				}

				user.save(function(err) {
					if(err) {
						return done(err);
					}

					email.save(done);
				});
			});
		});

		it('should update an email record when all data is given', function(done) {
			this.timeout(4000);
			anonymAgent
				.get("http://localhost:3001/image")
				.query({eid : email._id.toString(), image : 'logo.png'})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);
					parseInt(res.headers['content-length'], 10).should.be.greaterThan(1000);
					res.headers['content-type'].should.equal('image/gif');

					//Since we return the image immediately before updating the db, we should wait a few seconds to give the db time to update.
					setTimeout(function() {
						Email.findOne({_id : email._id}, function(err, result) {
							should.not.exist(err);
							should.exist(result);

							result.read.should.be.true;

							done();
						});
					}, 2000);
				});
		});

		it('should update the email record and return the logo when the image is not specified.', function(done) {
			this.timeout(4000);
			anonymAgent
				.get("http://localhost:3001/image")
				.query({eid : email._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);
					parseInt(res.headers['content-length'], 10).should.be.greaterThan(1000);
					res.headers['content-type'].should.equal('image/gif');

					//Since we return the image immediately before updating the db, we should wait a few seconds to give the db time to update.
					setTimeout(function() {
						Email.findOne({_id : email._id}, function(err, result) {
							should.not.exist(err);
							should.exist(result);

							result.read.should.be.true;

							done();
						});
					}, 2000);
				});
		});

		it('should only return the image when the email is not found.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image")
				.query({eid : (new mongoose.Types.ObjectId()).toString(), image : 'logo.png'})
				.end(function(err, res) {
					should.not.exist(err);
					
					res.status.should.equal(200);
					parseInt(res.headers['content-length'], 10).should.be.greaterThan(1000);
					res.headers['content-type'].should.equal('image/gif');

					done();
				});
		});

		it('should return the image when the email id is not specified.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image")
				.query({image : 'logo.png'})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);
					parseInt(res.headers['content-length'], 10).should.be.greaterThan(1000);
					res.headers['content-type'].should.equal('image/gif');

					done();
				});
		});

		it('should return an image when nothing is specified.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image")
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);
					parseInt(res.headers['content-length'], 10).should.be.greaterThan(1000);
					res.headers['content-type'].should.equal('image/gif');

					done();
				});
		});

		afterEach(function(done) {
			User.remove(function(err) {
				if(err) {
					return done(err);
				}

				Email.remove(done);
			});
		});
	});

	after(function(done) {
		Evnt.remove(done);
	});
});