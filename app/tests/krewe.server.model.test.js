'use strict';

/* jshint expr: true */

/**
* Module dependencies.
*/
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Krewe = mongoose.model('Krewe'),
	Event = mongoose.model('Event');

/**
* Globals
*/
var kreweKaptain, kreweMember1, kreweMember2, evnt, krewe;

/**
* Krewe MongoDB integration tests
*/
describe("Krewe Schema MongoDB Integration Tests:", function() {
	before(function(done) {
		Krewe.remove(function() {
			User.remove(function() {
				Event.remove(function() {
					var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
					var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
					var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

					evnt = new Event({
						name: 		'Popular Krewe Test Event',
						start_date: startDate,
						end_date: 	endDate,
						location: 	'UF',
						schedule: 	'www.google.com',
						capacity: 	50
					});

					evnt.save(function(err) {
						if(err) {
							return done(err);
						}

						kreweKaptain = new User({
							fName: 'Krewe',
							lName: 'Kaptain',
							email: 'krewe_kaptain_cen3031.0.boom0625@spamgourmet.com',
							roles: ['attendee'],
							status: [
								{
									event_id: evnt._id,
									attending: true,
									recruiter: false
								}
							],
							password: 'password',
							login_enabled: true
						});

						kreweMember1 = new User({
							fName: 'First',
							lName: 'Member',
							email: 'first.member_cen3031.0.boom0625@spamgourmet.com',
							roles: ['attendee'],
							status: [
								{
									event_id: evnt._id,
									attending: true,
									recruiter: false
								}
							],
							password: 'password',
							login_enabled: true
						});

						kreweMember2 = new User({
							fName: 'Second',
							lName: 'Member',
							email: 'second.member_cen3031.0.boom0625@spamgourmet.com',
							roles: ['attendee'],
							status: [
								{
									event_id: evnt._id,
									attending: true,
									recruiter: false
								}
							],
							password: 'password',
							login_enabled: true
						});

						kreweKaptain.save(function(err) {
							if(err) {
								return done(err);
							}

							kreweMember1.save(function(err) {
								if(err) {
									return done(err);
								}

								kreweMember2.save(done);
							});
						});
					});
				});
			});
		});
	});

	beforeEach(function(done) {
		krewe = new Krewe({
			name: "Best Krewe Ever",
			event_id: evnt._id,
			kaptain: kreweKaptain._id,
			members: [
				{member_id: kreweMember1._id},
				{member_id: kreweMember2._id}
			]
		});

		done();
	});

	it('should save without problems.', function(done) {
		krewe.save(done);
	});

	it('should not save when the Krewe name is an empty string.', function(done) {
		krewe.name = "";

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when the Krewe name is not specified.', function(done) {
		krewe = new Krewe({
			event_id: evnt._id,
			kaptain: kreweKaptain._id,
			members: [
				{member_id: kreweMember1._id},
				{member_id: kreweMember2._id}
			]
		});

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when the event_id is blank.', function(done) {
		krewe.event_id = {};

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal('Cast to ObjectId failed for value "[object Object]" at path "event_id"');

			done();
		});
	});

	it('should not save when the event_id does not reference an existing event\'s _id.', function(done) {
		krewe.event_id = mongoose.Schema.Types.ObjectId();

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when event_id is not specified.', function(done) {
		krewe = new Krewe({
			name: "Best Krewe Ever",
			kaptain: kreweKaptain._id,
			members: [
				{member_id: kreweMember1._id},
				{member_id: kreweMember2._id}
			]
		});

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when the kaptain is blank.', function(done) {
		krewe.kaptain = {};

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal('Cast to ObjectId failed for value "[object Object]" at path "kaptain"');

			done();
		});
	});

	it('should not save when kaptain does not reference an existing user\'s _id.', function(done) {
		krewe.kaptain = mongoose.Schema.Types.ObjectId();

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when kaptain is not specified.', function(done) {
		krewe = new Krewe({
			name: "Best Krewe Ever",
			event_id: evnt._id,
			members: [
				{member_id: kreweMember1._id},
				{member_id: kreweMember2._id}
			]
		});

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when members is empty.', function(done) {
		krewe.members = [];

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when members contains and _id that does not reference an existing user\'s _id.', function(done) {
		krewe.members = [
			{member_id: mongoose.Schema.Types.ObjectId()}
		];

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	it('should not save when members is not specified.', function(done) {
		krewe = new Krewe({
			name: "Best Krewe Ever",
			event_id: evnt._id,
			kaptain: kreweKaptain._id
		});		

		krewe.save(function(err) {
			should.exist(err);
			err.message.should.equal("Validation failed");

			done();
		});
	});

	afterEach(function(done) {
		Krewe.remove(done);
	});

	after(function(done) {
		Krewe.remove(function(kreweErr) {
			Event.remove(function(eventErr) {
				User.remove(function(userErr) {
					if(kreweErr) {
						return done(kreweErr);
					} else if(eventErr) {
						return done(eventErr);
					} else if(userErr) {
						return done(userErr);
					}

					done();
				});
			});
		});
	});
});