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

		afterEach(function(done) {
			candidate1.remove();
			duplicate.remove();
			done();
		});
	});
});