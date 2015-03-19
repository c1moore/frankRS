'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Evnt = mongoose.model('Event'),
	User = mongoose.model('User'),
	Attendees = mongoose.model('Attendees');

/**
 * Globals
 */
var attendee1, attendee2u, attendee3e,
	duplicate,
	user,  user2,
	event1, event2;

console.log("Test");

/**
 * Unit tests
 */
describe('Attendees Model Unit Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove().exec();
		Evnt.remove().exec();
		Attendees.remove().exec();

		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name:  'attendeetest',
			start_date: startDate,
			end_date:  endDate,
			location: 'UF',
			schedule: 'www.google.com'
		});
		event2 = new Evnt({
			name:  'attendeeteste2',
			start_date: startDate,
			end_date:  endDate,
			location: 'UF',
			schedule: 'www.google.com'
		});

		event1.save(function(err) {
			if(err)
				return done(err);

			user = new User({
				fName: 'Full',
				lName: 'Name',
				roles: ['attendee'],
				displayName: 'Full Name',
				email: 'test@test.com',
				password: 'password',
				salt: 'abc123',
				rank: [{'event_id': event1._id, 'place': 1}],
				provider: 'local',
				login_enabled: false
			});
			user2 = new User({
				fName: 'Full',
				lName: 'Name',
				roles: ['attendee'],
				displayName: 'Full Name',
				email: 'test2@test.com',
				password: 'password',
				salt: 'abc123',
				rank: [{'event_id': event1._id, 'place': 1}],
				provider: 'local',
				login_enabled: false
			});

			user.save(function(err) {
				if(err)
					return done(err);

				user2.save(function(err) {
					if(err)
						return done(err);

					event2.save(function(err) {
						done(err);
					});
				});
			});
		});
	});

	describe('Method Save', function() {
		beforeEach(function(done) {
			var ctime = new Date().getTime();
			
			attendee1 = new Attendees ({
				attendee : user._id,
				event_id : event1._id,
				time : ctime
			});
			attendee2u = new Attendees ({
				attendee : user2._id,
				event_id : event1._id,
				time : ctime
			});
			attendee3e = new Attendees ({
				attendee : user._id,
				event_id : event2._id,
				time : ctime
			});

			duplicate = new Attendees ({
				attendee : user._id,
				event_id : event1._id,
				time : ctime
			});

			done();
		});

		it('should save without problems', function(done) {
			attendee1.save(done);
		});

		it('should save when everything is the same except user id', function(done) {
			attendee1.save(function() {
				attendee2u.save(done);
			});
		});

		it('should save when everything is the same except event id', function(done) {
			attendee1.save(function() {
				attendee3e.save(done);
			});
		});

		it('should fail to save the same attendee twice', function(done) {
			attendee1.save(function() {
				return duplicate.save(function(err) {
					should.exist(err);
					done();
				});
			});
		});

		it('should fail to save when user id is not valid', function(done) {
			attendee1.attendee = mongoose.Types.ObjectId();
			attendee1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail to save when event id is not valid', function(done) {
			attendee1.event_id = mongoose.Types.ObjectId();
			attendee1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail to save without a user id', function(done) {
			attendee1.attendee = null;
			attendee1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail to save without a time', function(done) {
			attendee1.time = null;
			attendee1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail to save without an event id', function(done) {
			attendee1.event_id = null;
			attendee1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should allow getting the user id', function(done) {
			attendee1.save(function() {
				var query = Attendees.findOne({'attendee' : attendee1.attendee});
				query.exec(function(err, result) {
					(result.attendee === undefined).should.be.false;
					(result.attendee.toString()).should.equal(attendee1.attendee.toString());
					done();
				});
			});
		});

		it('should allow getting the event id', function(done) {
			attendee1.save(function() {
				var query = Attendees.findOne({'event_id' : attendee1.event_id});
				query.exec(function(err, result) {
					(result.event_id === undefined).should.be.false;
					(result.event_id.toString()).should.equal(attendee1.event_id.toString());
					done();
				});
			});
		});

		it('should allow getting the time', function(done) {
			attendee1.save(function() {
				var query = Attendees.findOne({'time' : attendee1.time});
				query.exec(function(err, result) {
					(result.time === undefined).should.be.false;
					result.time.should.equal(attendee1.time);
					done();
				});
			});
		});

		afterEach(function(done) {
			Attendees.remove(done);
		});
	});

	after(function(done) {
		user.remove(function(err) {
			if(err)
				return done(err);
		});
		event1.remove(function(err) {
			if(err)
				return done(err);
		});
		user2.remove(function(err) {
			if(err)
				return done(err);
		});
		event2.remove(function(err) {
			if(err)
				return done(err);
		});
		
		done();
	});
});
