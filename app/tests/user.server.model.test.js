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
	before(function(done) {
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

	describe('Method Save', function() {

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

		it('should allow getting the invite_count', function(done) {
			var invite_count = user.get('invite_count');
			assert.equal(invite_count,user.invite_count);
			assert.notEqual(invite_count,undefined);
			done();
			return;
		});

		it('should allow getting the attendee_count', function(done) {
			var attendee_count = user.get('attendee_count');
			assert.equal(attendee_count,user.attendee_count);
			assert.notEqual(attendee_count,undefined);
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

		it('should be able to show an error when try to save without first name', function(done) {
			var fName_old = user.fName;
			user.fName = '';
			return user.save(function(err) {
				user.fName = fName_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without last name', function(done) {
			var lName_old = user.lName;
			user.lName = '';
			return user.save(function(err) {
				user.lName = lName_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an email address', function(done) {
			var email_old = user.email;
			user.email = '';
			return user.save(function(err) {
				user.email = email_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a password set', function(done) {
			var password_old = user.password;
			user.password = '';
			return user.save(function(err) {
				user.password = password_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a role', function(done) {
			var role_old = user.role;
			user.role = '';
			return user.save(function(err) {
				user.role = role_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a status associative array', function(done) {
			var status_old = user.status;
			user.status = undefined;
			return user.save(function(err) {
				user.status = status_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an invite_count', function(done) {
			var invite_count_old = user.invite_count;
			user.invite_count = undefined;
			return user.save(function(err) {
				user.invite_count = invite_count_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without an attendee_count', function(done) {
			var attendee_count_old = user.attendee_count;
			user.attendee_count = undefined;
			return user.save(function(err) {
				user.attendee_count = attendee_count_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a login_enable', function(done) {
			var login_enable_old = user.login_enable;
			user.login_enable = undefined;
			return user.save(function(err) {
				user.login_enable = login_enable_old;
				should.exist(err);
				done();
			});
		});


	});

	after(function(done) {
		User.remove().exec();
		done();
	});
});
