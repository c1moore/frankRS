'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */

var should = require('should'),
	mongoose = require('mongoose'),
 	http = require('http'),
 	superagent = require('superagent'),
 	Comment = mongoose.model('Comment'),
	Event = mongoose.model('Event'),
 	User = mongoose.model('User'),
 	config = require('../../config/config'),
 	request = require('supertest');

/**
 * Globals
 */
var comment1, event1, event2, user, userAdmin;
var agent = superagent.agent();
var agentAdmin = superagent.agent();

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
describe('Express.js Comment Route Integration Tests:', function() {
	before(function(done) {
		User.remove().exec(); //Prevent earlier failed tests from poisoning us
		Event.remove().exec();
		Comment.remove().exec();
		event1 = new Event({
			name:  'testing123',
 			start_date: new Date(2140,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
 			end_date:  new Date(2150,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
 			location: 'UF',
 			schedule: 'www.google.com'
 		});

 		event2 = new Event({
 			name:  'testing123',
 			start_date: new Date(2140,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
 			end_date:  new Date(2150,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
 			location: 'UF2',
 			schedule: 'www.google.com'
 		});

		recruiter = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee','recruiter'],
 			displayName: 'Full Name',
 			email: 'recruiter@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		user = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee','recruiter'],
 			displayName: 'Full Name',
 			email: 'test@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		userAdmin = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['admin'],
 			displayName: 'Full Name',
 			email: 'admin@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

 		event1.save(function(err){
			if(err) throw err;
			event2.save(function(err){
				if(err) throw err;
				user.save(function(err){
					if(err) throw err;
					userAdmin.save(function(err){
						if(err) throw err;
						comment1 = new Comment({
							user_id: recruiter._id,
							event_id: event1._id,
							comment: "A comment",
							stream: 'recruiter'
						});
						comment1.save(function(err){
							if(err) throw err;
							done();
						});
					});
				});
			});
		});
	});

 	it("should be able to access the main page from the testing mechanism", function(done) {
 		request('http://localhost:3001')
 			.get('/')
 			.expect(200,done);
 	});

 	//it("should not be able to enumerate events when not signed in",function(done)

	after(function(done) {
		event1.remove();
		event2.remove();
		comment1.remove();
		user.remove();
		userAdmin.remove();
 		done();
	});
});
