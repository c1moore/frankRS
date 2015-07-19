'use strict';

/* jshint expr:true */

/**
* Module dependencies.
*/

var should = require('should'),
	mongoose = require('mongoose'),
	Email = mongoose.model('Email'),
	Event = mongoose.model('Event');

/**
* Globals
*/
var event;

/**
* Email integration tests
*/
describe("Email Model Integration Tests:", function() {
	before(function(done) {
		Email.remove(function() {
			Event.remove(function() {
				var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
				var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
				var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

				event = new Event({
					name: 		'EmailTestEvent',
					start_date: startDate,
					end_date: 	endDate,
					location: 	'UF',
					schedule: 	'www.google.com',
					capacity: 	50
				});

				event.save(done);
			});
		});
	});

	it('should save without problems', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			read: 		true,
			event_id: 	event._id
		});

		email.save(function(err) {
			if(err) {
				return done(err);
			}

			Email.findOne({_id : email._id}, function(err, result) {
				if(err) {
					return done(err);
				}

				if(!result) {
					return done(new Error("Email not saved."));
				}

				done();
			});
		});
	});

	it('should set read to false if not specified.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			if(err) {
				return done(err);
			}

			Email.findOne({_id : email._id}, function(err, result) {
				if(err) {
					return done(err);
				}

				should.exist(result);
				result.should.have.property('read');
				result.read.should.be.false;

				done();
			});
		});
	});

	it('should fail to save without a "to" field.', function(done) {
		var email = new Email({
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should fail when the "to" field is clearly invalid.', function(done) {
		var email = new Email({
			to: 		'this is not an email @t all',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should fail to save without a "from" field.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should fail when the "from" field is clearly invalid.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'this is not an email @t all',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should save without a "subject" field.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			message: 	'Boring message.',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.not.exist(err);
			
			Email.findOne({_id : email._id}, function(err, result) {
				if(err) {
					return done(err);
				}

				result.should.have.property('subject');
				result.subject.should.equal("");

				done();
			});
		});
	});

	it('should fail to save without a "message" field.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			event_id: 	event._id
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should fail to save without a "event_id" field.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.'
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");
			done();
		});
	});

	it('should fail to save without a valid "event_id" field.', function(done) {
		var email = new Email({
			to: 		'emailer_cen3031.0.boom0625@spamgourmet.com',
			from: 		'recruiter_cen3031.0.boom0625@spamgourmet.com',
			subject: 	'Exciting Email Title',
			message: 	'Boring message.',
			event_id: 	'123notanobjectid'
		});

		email.save(function(err) {
			should.exist(err);
			err.message.should.equal('Cast to ObjectId failed for value "123notanobjectid" at path "event_id"');
			done();
		});
	});

	afterEach(function(done) {
		Email.remove(function(err1) {
			done(err1);
		});
	});

	after(function(done) {
		Event.remove(done);
	});
});