'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Event = mongoose.model('Event'),
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
				rank: 1,
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
				rank: 2,
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
					(arraysEqual(result.roles,user.roles)).should.be.equal(true);
					done();
				});
			});
		});

		it('should allow getting the status', function(done) {
			user.save(function(err) {
				var query = User.findOne({'status':user.status});
				query.exec(function(err,result) {
					(result.status===undefined).should.be.false;
					(arraysEqual(result.status,user.status)).should.be.equal(true);
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

		it('should be able to show an error when try to save without any roles', function(done) {
			user.roles = [];
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

		it('should be able to show an error when try to save with invalid roles', function(done) {
			user.roles = ['giant sabertooth tiger','attendee'];
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should show an error when trying to save to one of the lists without a proper user id.', function(done) {
			var event1 = new Event({
				name:  'attendeeteste2',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			user.attendeeList = [{user_id : user2._id, event_id : event1._id}];
			user.save(function(err) {
				should.exist(err);
				event1.remove(function() {
					done();
				});
			});
		});

		it('should show an error when trying to save to one of the lists without a proper event id.', function(done) {
			user.attendeeList = [{user_id : user._id, event_id : mongoose.Types.ObjectId()}];
			user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to save properly when a proper user and event id are given to one of the lists', function(done) {
			var event1 = new Event({
				name:  'attendeeteste2',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			user2.email = 'user2@email.com';

			event1.save(function() {
				user2.save(function() {
					user.attendeeList = [{user_id : user2._id, event_id : event1._id}];
					user.save(function(err, result) {
						should.exist(result);
						event1.remove(function() {
							done();
						});
					});
				});
			});
		});

		it('should be able to save properly when a proper event id is passed to the status array', function(done) {
			var event1 = new Event({
				name:  'attendeeteste2',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event1.save(function() {
				user.attendeeList = [{event_id : event1._id, status : true, recruiter : false}];
				user.save(function(err, result) {
					should.exist(result);
					event1.remove(function() {
						done();
					});
				});
			});
		});

		it('should fail to save when all fields of the status array are not defined.', function(done) {
			var event1 = new Event({
				name:  'attendeeteste2',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event1.save(function() {
				user.attendeeList = [{event_id : event1._id, status : true}];
				user.save(function(err, result) {
					should.exist(result);
					event1.remove(function() {
						done();
					});
				});
			});
		});

		it('should fail to save properly when an invalid event id is passed to the status array', function(done) {
			user.status = [{event_id : mongoose.Types.ObjectId(), status : true, recruiter: false}];
			user.save(function(err) {
				should.exist(err);
				done();
			});
		});

		afterEach(function(done) {
			user.remove();
			user2.remove();
			done();
		});
	});
});
