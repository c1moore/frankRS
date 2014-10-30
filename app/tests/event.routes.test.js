'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
//TODO add POST setters
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
var event1, event2, user, userAdmin;
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
describe('Express.js Event Route Integration Tests:', function() {
	before(function(done) {
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
 			location: 'UF2',
 			schedule: 'www.google.com'
 		});

		user = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee'],
 			displayName: 'Full Name',
 			email: 'test@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: false
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
 			login_enabled: false
 		});

 		event1.save(function(err){
			if(err) throw err;
			event2.save(function(err){
				if(err) throw err;
				user.save(function(err){
					if(err) throw err;
					userAdmin.save(function(err){
						if(err) throw err;
						done();
					});
				});
			});
		});
	});

 	it("should be able to access the main page from the event route testing mechanism", function(done) {
 		request('http://localhost:3001')
 			.get('/')
 			.expect(200,done);
 	});

 	it("should not be able to enumerate events when not signed in",function(done) {
 		request('http://localhost:3001')
			.get('/events/enumerate')
 			.expect(401,done);
 	});

 	it("should not be able to get the event start date when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getStartDate')
 			.send({eventID: event1._id})
 			.expect(401,done);

 	});

 	it("should not be able to get the event name when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getName')
 			.send({eventID: event1._id})
 			.expect(401,done);

 	});

 	it("should not be able to get the event end date when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getEndDate')
 			.send({eventID: event1._id})
 			.expect(401,done);
 	});

	it("should not be able to get the event location when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getLocation')
 			.send({eventID: event1._id})
 			.expect(401)
 			.end(function(err,res) {
 				if (err) throw err;
				res.body.should.have.property('message');
 				done();
 			});

 	});

 	it("should not be able to get the event schedule when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getSchedule')
 			.send({eventID: event1._id})
 			.expect(401,done);
 	});

 	it("should not be able to get the event object when not signed in", function(done) {
 		request('http://localhost:3001')
 			.get('/events/getEventObj')
 			.send({eventID: event1._id})
 			.expect(401)
 			.end(function(err,res) {
 				if (err) throw err;
 				res.body.should.have.property('message');
 				done();
 			});

 	});

 	it("should be able to sign in correctly", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
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
 		agent //IMPORTANT: Agent does not support expect, use should
			.get('http://localhost:3001/events/enumerate')
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
 				res.body.should.have.property('events');
 				done();
 			});
 	});

 	it("should now be able to get the event name when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getName')
 			.send({eventID: event1._id})
 			.end(function(err,res) {
				if (err) throw erro;
				res.status.should.be.equal(200);
				res.body.should.have.property('name');
				done();
			});

 	});

	 it("should now be able to get the event start date when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getStartDate')
 			.send({eventID: event1._id})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('start_date');
				done();
			});
 	});

	 it("should now be able to get the event end date when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEndDate')
 			.send({eventID: event1._id})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('end_date');
				done();
			});

 	});

	it("should now be able to get the event location when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getLocation')
 			.send({eventID: event1._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('location');
 				done();
 			});
 	});

	it("should now be able to get the event schedule when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getSchedule')
 			.send({eventID: event1._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('schedule');
 				done();
 			});
 	});

	it("should now be able to get the event object when signed in", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEventObj')
 			.send({eventID: event1._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('start_date');
				res.body.should.have.property('end_date');
				res.body.should.have.property('schedule');
				res.body.should.have.property('location');
				res.body.should.have.property('name');
 				done();
 			});
 	});

	it("should not be able to enumerate all events when not an admin", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/enumerateAll')
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal('Access Denied. This incident will be reported.');
 				done();
 			});
 	});

	it("should not be able to access an eventObj by ID if the user shouldn't know about it", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEventObj')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should not be able to access start_date if the user shouldn't know about that event", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getStartDate')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should not be able to access end_date if the user shouldn't know about that event", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEndDate')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should not be able to access location if the user shouldn't know about that event", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getLocation')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should not be able to access schedule if the user shouldn't know about that event", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getSchedule')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should not be able to access event name if the user shouldn't know about that event", function(done) {
 		agent //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getName')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
 				done();
 			});
 	});

	it("should be able to login as admin",function(done) {
		agentAdmin
			.post('http://localhost:3001/auth/signin')
			.send({email: userAdmin.email, password: 'password'})
 			.end(function (err, res) {
				res.status.should.be.equal(200);
				should.not.exist(err);
       				if (err) {
         				throw err;
       				}
       				done();
 			});
     	});

	it("should be able to enumerate all events when admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/enumerateAll')
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
 				done();
 			});
 	});

	it("should be able to access any event by ID if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEventObj')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
 				done();
 			});
 	});

	it("should be able to access start_date of any event if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getStartDate')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('start_date');
 				done();
 			});
 	});

	it("should be able to access any end_date if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getEndDate')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('end_date');
 				done();
 			});
 	});

	it("should be able to access any location if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getLocation')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('location');
 				done();
 			});
 	});

	it("should be able to access any schedule if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getSchedule')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('schedule');
 				done();
 			});
 	});

	it("should be able to access any event name if admin", function(done) {
 		agentAdmin //IMPORTANT: Agent does not support expect, use should
 			.get('http://localhost:3001/events/getName')
			.send({eventID: event2._id})
 			.end(function(err,res) {
 				if (err) throw err;
				res.status.should.be.equal(200);
				res.body.should.have.property('name');
 				done();
 			});
 	});
	

	after(function(done) {
		event1.remove();
		event2.remove();
		user.remove();
		userAdmin.remove();
 		done();
	});
});
