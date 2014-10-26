'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest'),
	agent = require('superagent'),
	User = mongoose.model('User');

/**
 * Globals
 */
var user, user2, useragent, useragent2;

/**
 * Unit tests
 */
describe('Express.js User Route Unit Tests:', function() {
	before(function(done) {
		user = new User({
			fName : 'Calvin',
			lName : 'Moore',
			email : 'test@example.com',
			roles : ['recruiter'],
			password : 'password',
			login_enable : true
		});

		user2 = new User({
			fName : 'Calvin',
			lName : 'Moore',
			email : 'calvin@example.com',
			roles : ['attendee'],
			password : 'password',
			login_enable : true
		});

		user.save(function(err) {
			useragent = agent.agent();
			user2.save(function(err) {
				useragent2 = agent.agent();
				useragent2
					.post('http://localhost:3001/auth/sigin')
					.send({'email' : user2.email, 'password' : user2.password})
					.end(function(err, res) {
						done(err);
					});
			});
			/*useragent
				.post('http://localhost:3000/auth/signin')
				.send({'email' : 'test@example.com', 'password' : 'password'})
				.end(function(err, res) {
          			console.log(err);
          			console.log(res);
          			done();
				});*/
		});
	});

	it("should be able to access the main page from the user route testing mechanism", function(done) {
		request('http://localhost:3001/')
			.get('')
			.expect(200)
			.end(function(err, res) {
				done(err);
			});
	});

	/*it("should be able to access the main page from the user route testing mechanism", function(done) {
		request('http://localhost:3001/')
			.post('leaderboard/maintable')
			.expect(200)
			.end(function(err, res) {
				console.log(res);
				done(err);
			});
	});*/

	it('should be able to log in.', function(done) {
		useragent
			.post('http://localhost:3001/auth/signin')
			.send({'email' : 'test@example.com', 'password' : 'password'})
			.end(function(err, res) {
         		should.not.exist(err);
          		res.status.should.equal(200);
				done();
			});
	});

	it('should be able to get leaderboard when they have the proper roles.', function(done) {
		useragent
			.post('http://localhost:3001/leaderboard/maintable')
			.end(function(err, res) {
         		should.not.exist(err);
          		res.status.should.equal(200);
				done();
			});
	});

	it('should fail to get leaderboard when the user does not have proper roles.', function(done) {
		useragent2
			.post('http://localhost:3001/leaderboard/maintable')
			.end(function(err, res) {
         		should.not.exist(err);
          		res.status.should.equal(401);
				done();
			});
	});

	after(function(done) {
		user.remove();
		user2.remove();
		done();
	});

});