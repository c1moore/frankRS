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

function arraysEqual(array0,array1) {
    if (array0.length !== array1.length) return false;
    for (var i = 0; i<array0.length; i++) {
        if (array0[i] !== array1[i]) return false;
    }
    return true;
}

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {

	describe('Method', function() {
		beforeEach(function(done) {
			user = new User({
				fName: 'Full',
				lName: 'Name',
				roles: ['attendee'],
				displayName: 'Full Name',
				email: 'test@test.com',
				password: 'password',
				salt: 'abc123',
				provider: 'local',
				login_enabled: false
			});
			user2 = new User({
				fName: 'Full',
				lName: 'Name',
				roles: ['attendee'],
				displayName: 'Full Name',
				email: 'test@test.com',
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
			user.save(function(err1) {
				return user2.save(function(err2) {
					should.exist(err2);
					done();
				});	
			});
		});

		it('should allow getting the first name', function(done) {
			user.save(function(err) {
				var query = User.findOne({'fName' : user.fName});
				query.exec(function(err, result) {
					(result.fName === undefined).should.be.false;
					result.fName.should.equal(user.fName);
					done();
				});
			});
		});

		it('should allow getting the last name', function(done) {
			user.save(function(err) {
				var query = User.findOne({'lName' : user.lName});
				query.exec(function(err, result) {
					(result.lName === undefined).should.be.false;
					(result.lName).should.be.equal(user.lName);
					done();
				});
			});

		});

		it('should allow getting the email', function(done) {
			user.save(function(err) {
				var query = User.findOne({'email':user.email});
				query.exec(function(err,result) {
					(result.email === undefined).should.be.false;
					(result.email).should.be.equal(user.email);
					done();
				});
			});
		});

		it('should allow getting the password', function(done) {
			user.save(function(err) {
				var query = User.findOne({'password':user.password});
				query.exec(function(err,result) {
					(result.password === undefined).should.be.false;
					(result.password).should.be.equal(user.password);
					done();
				});
			});
		});

		it('should allow getting the password salt', function(done) {
			user.save(function(err) {
				var query = User.findOne({'salt':user.salt});
				query.exec(function(err,result) {
					(result.salt===undefined).should.be.false;
					(result.salt).should.be.equal(user.salt);
					done();
				});
			});
		});

		it('should allow getting the roles', function(done) {
			user.save(function(err) {
				var query = User.findOne({'roles':user.roles});
				query.exec(function(err,result) {
					(result.roles===undefined).should.be.false;
					(result.roles).should.be.equal(user.roles);
					done();
				});
			});
		});

		it('should allow getting the status', function(done) {
			user.save(function(err) {
				var query = User.findOne({'status':user.status});
				query.exec(function(err,result) {
					(result.status===undefined).should.be.false;
					(result.status).should.be.equal(user.status);
					done();
				});
			});
		});

		it('should allow getting the rank', function(done) {
			user.save(function(err) {
				var query = User.findOne({'rank':user.rank});
				query.exec(function(err,result) {
					(result.rank===undefined).should.be.false;
					(result.rank).should.be.equal(user.rank);
					done();
				});
			});
		});
		
		it('should allow getting the login_enabled', function(done) {
			user.save(function(err) {
				var query = User.findOne({'login_enabled':user.login_enabled});
				query.exec(function(err,result) {
					(result.login_enabled===undefined).should.be.false;
					(result.login_enabled).should.be.equal(user.login_enabled);
					done();
				});
			});
		});

		it('should allow getting the templates', function(done) {
			user.save(function(err) {
				var query = User.findOne({'templates':user.templates});
				query.exec(function(err,result) {
					(result.templates===undefined).should.be.false;
					(arraysEqual(result.templates,user.templates)).should.be.equal(true);
					done();
				});
			});
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
			user.email = 'This is clearly not an email address';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a not-so-clearly invalid email', function(done) {
			user.email = 'invalid@';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with an invalid role', function(done) {
			user.role = ['Giant sabertooth tiger','attendee'];
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a non-boolean login_enabled', function(done) {
			user.login_enabled = 'true';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});


	});

	afterEach(function(done) {
		user.remove();
		user2.remove();
		done();
	});
});
