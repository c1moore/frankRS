'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	candidate = mongoose.model('Candidate');

/**
 * Globals
 */
var candidate1, candidate2, candidate3;

/**
 * Unit tests
 */
describe('Candidate Model Unit Tests:', function() {
	before(function(done) {
		candidate1 = new candidate({
			fName : 'Full',
			lName : 'Name',
			email : 'test@test.com',
			status : 'volunteer',
			accept : 'false'
		});
		duplicate = new candidate({
			fName : 'Full',
			lName : 'Name',
			email : 'test@test.com',
			status : 'volunteer',
			accept : 'false'
		});

		done();
	});

	describe('Method Save', function() {
		//it('should begin with no users', function(done) {
		//	User.find({}, function(err, users) {
		//		users.should.have.length(0);
		//		done();
		//	});
		//});

		it('should be able to save without problems', function(done) {
			candidate1.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			candidate1.save();
			return duplicate.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save without first name', function(done) {
			candidate1.fName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save without last name', function(done) {
			candidate1.lName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save without email', function(done) {
			candidate1.email = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	after(function(done) {
		candidate1.remove().exec();
		candidate2.remove().exec();
		candidate3.remove().exec();
		done();
	});
});