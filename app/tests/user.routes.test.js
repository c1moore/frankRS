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
var user, useragent;

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

		user.save(function(err) {
			/*useragent = agent.agent();
			useragent
				.post('http://localhost:3000/auth/signin')
				.send({'email' : 'test@example.com', 'password' : 'password'})
				.end(function(err, res) {
          			console.log(err);
          			console.log(res);
          			done();
				});*/
			done();
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
		request('http://localhost:3001/')
			.post('auth/signin')
			.send({'email' : 'test@example.com', 'password' : 'password'})
			.expect(200)
			.end(function(err, res) {
				done(err);
			});
	});

	after(function(done) {
		user.remove();
		done();
	});

});