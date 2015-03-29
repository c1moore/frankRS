'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	candidate = mongoose.model('Candidate'),
	Evnt = mongoose.model('Event');

/**
 * Globals
 */
var candidate1, duplicate;

/**
 * Unit tests
 */
describe('Candidate Model Unit Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		candidate.remove(function() {
			Evnt.remove(function() {
				done();
			});
		});
	});

	describe('Method Save', function() {
		beforeEach(function(done) {
			candidate1 = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer',
				capacity: 50
			});
			duplicate = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer',
				capacity: 50
			});

			done();
		});

		it('should be able to save without problems', function(done) {
			candidate1.save(done);
		});

		it('should fail to save an existing candidate again', function(done) {
			candidate1.save(function(err1) {
				if(err1)
					return done(err1);

				return duplicate.save(function(err) {
					should.exist(err);
					done();
				});
			});
		});

		it('should show an error when trying to save without first name', function(done) {
			candidate1.fName = '';
			return candidate1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save without last name', function(done) {
			candidate1.lName = '';
			return candidate1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save without email', function(done) {
			candidate1.email = '';
			return candidate1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should allow getting the first name', function(done) {
			candidate1.save(function(err) {
				if(err)
					return done(err);

				var query = candidate.findOne({'fName' : candidate1.fName});
				query.exec(function(err, result) {
					if(err)
						return done(err);

					(result.fName === undefined).should.be.false;
					result.fName.should.equal(candidate1.fName);
					done();
				});
			});
		});

		it('should all getting last name', function(done) {
			candidate1.save(function(err) {
				if(err)
					return done(err);

				var query = candidate.findOne({'lName' : candidate1.lName});
				query.exec(function (err, result) {
					if(err)
						return done(err);

					(result.lName === undefined).should.be.false;
					result.lName.should.equal(candidate1.lName);
					done();
				});
			});
		});

		it('should fail to save when an objectid in the event array does not reference an event.', function(done) {
			candidate1.events = [{event_id: mongoose.Types.ObjectId(), accepted: false}];
			candidate1.save(function(err, result) {
				should.exist(err);
				done();
			});
		});

		it('should save when an objectid in the events array does reference an Event.', function(done) {
			var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
			var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
			var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.
			
			var event1 = new Evnt({
				name:  'attendeeteste2',
				start_date: startDate,
				end_date:  endDate,
				location: 'UF',
				schedule: 'www.google.com',
				capacity: 50
			});

			event1.save(function(err) {
				if(err)
					return done(err);

				candidate1.events = [{event_id: event1._id, accepted: false}];
				candidate1.save(function(c_err, result) {
					if(c_err) {
						event1.remove(function(e_err) {
							if(e_err) {
								return done(e_err);
							} else {
								return done(c_err);
							}
						});
					}

					should.exist(result);
					event1.remove(function(err) {
						done(err);
					});
				});
			});
		});

		afterEach(function(done) {
			candidate1.remove(function(err) {
				if(err)
					return done(err);
				
				duplicate.remove(function(err) {
					if(err)
						return done(err);

					done();
				});
			});
		});
	});
});
