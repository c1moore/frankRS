'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Evnt = mongoose.model('Event'),
	http = require('http'),
	request = require('supertest'),
	agent = require('superagent');

/**
 * Globals
 */
var user, user2, event1, event2,
	anonymAgent = agent.agent();

/**
 * Unit tests
 */
describe('Images Functional Tests:', function() {

	before(function(done) {
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
				event2 = new Evnt({
					name: 			'Testing2',
					start_date: 	startDate,
					end_date: 		endDate,
					location: 		'Work',
					capacity: 		200
				});

				event1.save(function(err) {
					if(err) {
						return done(err);
					}

					event2.save(done);
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
				inviteeList: 	[{user_id : user2._id, event_id : event2._id}, {user_id : user2._id, event_id : event1._id}],
				login_enabled: 	true
			});

			user2.save(function(err) {
				if(err) {
					return done(err);
				}

				user.save(function(err) {
					if(err) {
						return done(err);
					}

					done();
				});
			});
		});

		it('should update the inviteeList and return an image.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image/logo")
				.query({rid : user._id.toString(), uemail : user2.email, eid : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);

					User.findOne({_id : user._id}, function(err, user) {
						if(err) {
							return done(err);
						}

						user.inviteeList.length.should.equal(2);

						var i;
						for(i = 0; i < user.inviteeList.length; i++) {
							if(user.inviteeList[i].event_id.toString() === event1._id.toString()) {
								user.inviteeList[i].read.should.be.true;
								break;
							}
						}

						i.should.be.lessThan(user.inviteeList.length);

						done();
					});
				});
		});

		it('should update the attendeeList and return an image.', function(done) {
			user.attendeeList = user.inviteeList;
			user.inviteeList = [];

			user.save(function(err) {
				if(err) {
					return done(err);
				}

				anonymAgent
					.get("http://localhost:3001/image/logo")
					.query({rid : user._id.toString(), uemail : user2.email, eid : event1._id.toString()})
					.end(function(err, res) {
						should.not.exist(err);

						res.status.should.equal(200);

						User.findOne({_id : user._id}, function(err, user) {
							if(err) {
								return done(err);
							}

							user.attendeeList.length.should.equal(2);

							var i;
							for(i = 0; i < user.attendeeList.length; i++) {
								if(user.attendeeList[i].event_id.toString() === event1._id.toString()) {
									user.attendeeList[i].read.should.be.true;
									break;
								}
							}

							i.should.be.lessThan(user.attendeeList.length);

							done();
						});
					});
			});
		});

		it('should update the almostList and return an image.', function(done) {
			user.almostList = user.inviteeList;
			user.inviteeList = [];

			user.save(function(err) {
				if(err) {
					return done(err);
				}

				anonymAgent
					.get("http://localhost:3001/image/logo")
					.query({rid : user._id.toString(), uemail : user2.email, eid : event1._id.toString()})
					.end(function(err, res) {
						should.not.exist(err);

						res.status.should.equal(200);

						User.findOne({_id : user._id}, function(err, user) {
							if(err) {
								return done(err);
							}

							user.almostList.length.should.equal(2);

							var i;
							for(i = 0; i < user.almostList.length; i++) {
								if(user.almostList[i].event_id.toString() === event1._id.toString()) {
									user.almostList[i].read.should.be.true;
									break;
								}
							}

							i.should.be.lessThan(user.almostList.length);

							done();
						});
					});
			});
		});

		it('should return a 400 error when the invitee email is not found.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image/logo")
				.query({rid : user._id.toString(), eid : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(400);

					done();
				});
		});

		it('should return a 400 error when the recruiter id is not found.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image/logo")
				.query({uemail : user2.email, eid : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(400);

					done();
				});
		});

		it('should return a 400 error when the event id is not found.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image/logo")
				.query({rid : user._id.toString(), uemail : user2.email})
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(400);

					done();
				});
		});

		it('should return an image when no data is passed to it.', function(done) {
			anonymAgent
				.get("http://localhost:3001/image/logo")
				.end(function(err, res) {
					should.not.exist(err);

					res.status.should.equal(200);

					done();
				});
		});

		afterEach(function(done) {
			User.remove(done);
		});
	});

	after(function(done) {
		Evnt.remove(done);
	});
});