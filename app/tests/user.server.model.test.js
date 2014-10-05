'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
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
				roles: ["Attendee"],
				displayName: 'Full Name',
				email: 'test@test.com',
				username: 'username',
				password: 'password',
				salt: 'abc123',
				provider: 'local',
				login_enabled: false
			});
			user2 = new User({
				fName: 'Full',
				lName: 'Name',
				roles: ["Attendee"],
				displayName: 'Full Name',
				email: 'test@test.com',
				username: 'username',
				password: 'password',
				salt: 'abc123',
				provider: 'local',
				login_enabled: false
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
			var fname = user.fName;
			(fname).should.be.equal(user.fName);
			(fname).should.not.be(undefined);
			done();
		});

		it('should allow getting the last name', function(done) {
			var lname = user.lName;
			(lname).should.be.equal(user.lName);
			(lname).should.be.equal(undefined);
			done();
		});

		it('should allow getting the email', function(done) {
			var email = user.email;
			(email).should.be.equal(user.email);
			(email).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the password', function(done) {
			var password = user.password;
			(password).should.be.equal(user.password);
			(password).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the password salt', function(done) {
			var salt = user.salt;
			(salt).should.be.equal(user.salt);
			(salt).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the roles', function(done) {
			var roles = user.roles;
			(roles).should.be.equal(user.roles);
			(roles).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the status', function(done) {
			var status = user.status;
			(status).should.be.equal(user.status);
			(status).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the rank', function(done) {
			var rank = user.rank;
			(rank).should.be.equal(user.rank);
			(rank).should.not.be.equal(undefined);
			done();
		});
		
		it('should allow getting the login_enabled', function(done) {
			var login_enabled = user.login_enabled;
			(login_enabled).should.be.equal(user.login_enabled);
			(login_enabled).should.not.be.equal(undefined);
			done();
		});

		it('should allow getting the templates', function(done) {
			var templates = user.templates;
			(templates).should.be.equal(user.templates);
			(templates).should.not.be.equal(undefined);
			done();
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
			user.role = {};
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

		it('should be able to show an error when try to save without a login_enabled', function(done) {
			user.login_enabled = undefined;
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a clearly invalid email', function(done) {
			user.email = "This is clearly not an email address";
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a not-so-clearly invalid email', function(done) {
			user.email = "invalid@";
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with an invalid role', function(done) {
			user.role = ["Giant sabertooth tiger","Attendee"];
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a non-boolean login_enabled', function(done) {
			user.login_enabled = "true";
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
