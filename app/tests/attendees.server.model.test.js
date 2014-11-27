'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Attendees = mongoose.model('Attendees');

/**
 * Globals
 */
var attendee1, attendee2u, attendee3e,
	duplicate,
	user,  user2,
	event1, event2;

/**
 * Unit tests
 */
describe('Attendees Model Unit Tests:', function() {
	before(function(done) {

		event1 = new Event({
			name:  'attendeetest',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'UF',
			schedule: 'www.google.com'
		});
		event2 = new Event({
			name:  'attendeeteste2',
			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
			location: 'UF',
			schedule: 'www.google.com'
		});

		event1.save(function() {
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

			user.save(function() {
				user2.save(function(err) {
					event2.save(function(err) {
						done();
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
			Attendees.remove().exec();
			done();
		});
	});

	after(function(done) {
		user.remove();
		event1.remove();
		user2.remove();
		event2.remove();
		done();
	});
});
