'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	assert = require('assert'),
	User = mongoose.model('User');

/**
 * Globals
 */
var user, user2;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {

	describe('Method Save', function() {
		beforeEach(function(done) {
			user = new User({
				fName: 'Full',
				lName: 'Name',
				displayName: 'Full Name',
				email: 'test@test.com',
				username: 'username',
				password: 'password',
				provider: 'local'
			});
			user2 = new User({
				fName: 'Full',
				lName: 'Name',
				displayName: 'Full Name',
				email: 'test@test.com',
				username: 'username',
				password: 'password',
				provider: 'local'
			});

			done();
		});

		it('should be able to save without problems', function(done) {
			user.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should allow getting the first name', function(done) {
			var fname = user.get('fName');
			assert.equal(fname,user.fName);
			assert.notEqual(fname,undefined);
			done();
			return;
		});

		it('should allow getting the last name', function(done) {
			var lname = user.get('lName');
			assert.equal(lname,user.lName);
			assert.notEqual(lname,undefined);
			done();
			return;
		});

		it('should allow getting the email', function(done) {
			var email = user.get('email');
			assert.equal(email,user.email);
			assert.notEqual(email,undefined);
			done();
			return;
		});

		it('should allow getting the password', function(done) {
			var password = user.get('password');
			assert.equal(password,user.password);
			assert.notEqual(password,undefined);
			done();
			return;
		});

		it('should allow getting the role', function(done) {
			var role = user.get('role');
			assert.equal(role,user.role);
			assert.notEqual(role,undefined);
			done();
			return;
		});

		it('should allow getting the status', function(done) {
			var status = user.get('status');
			assert.equal(status,user.status);
			assert.notEqual(status,undefined);
			done();
			return;
		});

		it('should allow getting the rank', function(done) {
			var rank = user.get('rank');
			assert.equal(rank,user.rank);
			assert.notEqual(rank,undefined);
			done();
			return;
		});
		
		it('should allow getting the login_enable', function(done) {
			var login_enable = user.get('login_enable');
			assert.equal(login_enable,user.login_enable);
			assert.notEqual(login_enable,undefined);
			done();
			return;
		});

		it('should allow getting the templates', function(done) {
			var templates = user.get('templates');
			assert.equal(templates,user.templates);
			assert.notEqual(templates,undefined);
			done();
			return;
		});

		it('should allow getting the attendee list', function(done) {
			var attendees = user.get('attendees');
			assert.equal(attendees,user.attendees);
			assert.notEqual(attendees,undefined);
			done();
			return;
		});

		it('should allow getting the invitees list', function(done) {
			var invitees = user.get('invitees');
			assert.equal(invitees,user.invitees);
			assert.notEqual(invitees,undefined);
			done();
			return;
		});

		it('should allow getting the almosts list', function(done) {
			var almosts = user.get('almosts');
			assert.equal(almosts,user.almosts);
			assert.notEqual(almosts,undefined);
			done();
			return;
		});

		it('should be able to show an error when try to save without first name', function(done) {
			user.fName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without last name', function(done) {
			user.lName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an email address', function(done) {
			user.email = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a password set', function(done) {
			user.password = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a role', function(done) {
			user.role = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a status associative array', function(done) {
			user.status = undefined;
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an invite_count', function(done) {
			user.invite_count = undefined;
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an attendee_count', function(done) {
			user.attendee_count = undefined;
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a login_enable', function(done) {
			user.login_enable = undefined;
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});


	});

	afterEach(function(done) {
		User.remove().exec();
		done();
	});
});
