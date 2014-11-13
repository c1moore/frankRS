'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	candidate = mongoose.model('Candidate'),
	Event = mongoose.model('Event');

/**
 * Globals
 */
var candidate1, duplicate;

/**
 * Unit tests
 */
describe('Candidate Model Unit Tests:', function() {

	describe('Method Save', function() {
		beforeEach(function(done) {
			candidate1 = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer'
			});
			duplicate = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer'
			});

			done();
		});

		it('should be able to save without problems', function(done) {
			candidate1.save(done);
		});

		it('should fail to save an existing candidate again', function(done) {
			candidate1.save(function(err1) {
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
				var query = candidate.findOne({'fName' : candidate1.fName});
				query.exec(function(err, result) {
					(result.fName === undefined).should.be.false;
					result.fName.should.equal(candidate1.fName);
					done();
				});
			});
		});

		it('should all getting last name', function(done) {
			candidate1.save(function(err) {
				var query = candidate.findOne({'lName' : candidate1.lName});
				query.exec(function (err, result) {
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
			var event1 = new Event({
				name:  'attendeeteste2',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event1.save(function(err) {
				candidate1.events = [{event_id: event1._id, accepted: false}];
				candidate1.save(function(err, result) {
					should.exist(result);
					event1.remove(function() {
						done();
					});
				});
			});
		});

		afterEach(function(done) {
			candidate1.remove();
			duplicate.remove();
			done();
		});
	});
});
