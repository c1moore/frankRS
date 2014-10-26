'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
 	http = require('http'),
 	superagent = require('superagent'),
 	Event = mongoose.model('Event'),
 	User = mongoose.model('User'),
 	config = require('../../config/config'),
 	request = require('supertest');

/**
 * Globals
 */
var event1, event2, user;
var agent = superagent.agent();

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
describe('Express.js Event Route Unit Tests:', function() {
	beforeEach(function(done){
		event1 = new Event({
			name:  'testing123',
 			start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
 			end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
 			location: 'UF',
 			schedule: 'www.google.com'
 		});

 		event2 = new Event({
 				name:  'testing123',
 				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
 				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
 				location: 'UF',
 			schedule: 'www.google.com'
 		});
		
 		user = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee'],
 			displayName: 'Full Name',
 			email: 'test@test.com',
 			password: 'password',
 			status: [{eventID: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: false
 		});
 		user.save(function(err){if(err)throw err;});
			
 		done();
 	});

 	it("should be able to access the main page from the event route testing mechanism", function(done) {
 		request('http://localhost:3001')
 			.get('/')
 			.expect(200);
 		done();
 	});

 	it("should not be able to enumerate events when not signed in",function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
				.get('/events/enumerate')
 				.expect(400);
 			done();
 		});
 	});

 	it("should not be able to get the event start date when not signed in", function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
 				.get('/events/getStartDate')
 				.send({eventID: event1._id})
 				.expect(400);
 			done();
 		});
 	});

 	it("should not be able to get the event end date when not signed in", function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
 				.get('/events/getEndDate')
 				.send({eventID: event1._id})
 				.expect(400);
 			done();
 		});
 	});

	it("should not be able to get the event location when not signed in", function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
 				.get('/events/getLocation')
 				.send({eventID: event1._id})
 				.expect(400)
 				.end(function(err,res) {
 					if (err) throw err;
 					res.body.should.have.property('location');
 					res.body.location.should.be.equal('UF');
 					done();
 				});
 		});
 	});

 	it("should not be able to get the event schedule when not signed in", function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
 				.get('/events/getSchedule')
 				.send({eventID: event1._id})
 				.expect(400);
 			done();
 		});
 	});

 	it("should not be able to get the event object when not signed in", function(done) {
 		event1.save(function(err) {
 			request('http://localhost:3001')
 				.get('/events/getEventObj')
 				.send({eventID: event1._id})
 				.expect(400)
 				.end(function(err,res) {
 					if (err) throw err;
 					res.body.should.have.property('schedule');
 					res.body.should.have.property('location');
 					res.body.should.have.property('start_date');
 					res.body.should.have.property('end_date');
 					res.body.schedule.should.be.equal('www.google.com');
 					res.body.location.should.be.equal('UF');
 					done();
 				});
 		});
 	});

 	it("should be able to sign in correctly", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: user.password})
 			.end(function (err, res) {
				res.status.should.be.equal(200);
				should.not.exist(err);
       				if (err) {
         				throw err;
       				}
       				done();
 			});
     	});

 	it('should now be able to enumerate events when signed in', function(done) {
 		event1.save(function(err) {
 			agent
				.get('http://localhost:3001/events/enumerate')
 				.end(function(err,res) {
 					if (err) throw err;
					console.log(res.body); //You are not signed in
					res.status.should.be.equal(200);
 					res.body.should.have.property('events');
 					done();
 				});
 		});
 	});

 	afterEach(function(done){
 		event1.remove();
 		event2.remove();
 		user.remove();
 		done();
 	});
});
