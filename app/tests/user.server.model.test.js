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

	describe('Method', function() {
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
			(fname === undefined).should.be.false;
			(fname).should.be.equal(user.fName);
			done();
		});

		it('should allow getting the last name', function(done) {
			var lname = user.lName;
			(lname === undefined).should.be.false;
			(lname).should.be.equal(user.lName);
			done();
		});

		it('should allow getting the email', function(done) {
			var email = user.email;
			(email === undefined).should.be.false;
			(email).should.be.equal(user.email);
			done();
		});

		it('should allow getting the password', function(done) {
			var password = user.password;
			(password === undefined).should.be.false;
			(password).should.be.equal(user.password);
			done();
		});

		it('should allow getting the password salt', function(done) {
			var salt = user.salt;
			(salt === undefined).should.be.false;
			(salt).should.be.equal(user.salt);
			done();
		});

		it('should allow getting the roles', function(done) {
			var roles = user.roles;
			(roles === undefined).should.be.false;
			(roles).should.be.equal(user.roles);
			done();
		});

		it('should allow getting the status', function(done) {
			var status = user.status;
			(status === undefined).should.be.false;
			(status).should.be.equal(user.status);
			done();
		});

		it('should allow getting the rank', function(done) {
			var rank = user.rank;
			(rank === undefined).should.be.false;
			(rank).should.be.equal(user.rank);
			done();
		});
		
		it('should allow getting the login_enabled', function(done) {
			var login_enabled = user.login_enabled;
			(login_enabled === undefined).should.be.false;
			(login_enabled).should.be.equal(user.login_enabled);
			done();
		});

		it('should allow getting the templates', function(done) {
			var templates = user.templates;
			(templates === undefined).should.be.false;
			(templates).should.be.equal(user.templates);
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
