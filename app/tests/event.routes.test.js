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
		User.remove().exec(); //Prevent earlier failed tests from poisoning us
		Event.remove().exec();
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

	//Post tests
	
	it("should be able to set the name if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setName')
			.send({eventID: event2._id, name:"ItsANewNameDog"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getName')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.be.equal("ItsANewNameDog");
						done();
					});
			});
	});

	it("should not be able to set invalid name if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setName')
			.send({eventID: event2._id, name:""})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(400);
				agentAdmin
					.get('http://localhost:3001/events/getName')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.be.equal("ItsANewNameDog");
						done();
					});
			});
	});

	it("should not be able to set name if user", function(done) {
		agent
			.post('http://localhost:3001/events/setName')
			.send({eventID: event1._id, name:"UserName"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agentAdmin
					.get('http://localhost:3001/events/getName')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.be.equal("testing123");
						done();
					});
			});
	});

	it("should not be able to set invalid start_date if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setStartDate')
			.send({eventID: event2._id, start_date:new Date(2004,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(400);
				agentAdmin
					.get('http://localhost:3001/events/getStartDate')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.be.equal(
							new Date(2140,11,30,10,0,0).getTime());
						done();
					});
			});
	});

	it("should be able to set start_date if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setStartDate')
			.send({eventID: event2._id, start_date:new Date(2145,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getStartDate')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.be.equal(
							new Date(2145,11,30,10,0,0).getTime());
						done();
					});
			});
	});

	it("should not be able to set start_date if user", function(done) {
		agent
			.post('http://localhost:3001/events/setStartDate')
			.send({eventID: event1._id, start_date:new Date(2146,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agentAdmin
					.get('http://localhost:3001/events/getStartDate')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('start_date');
						res.body.start_date.should.be.equal(
							new Date(2140,11,30,10,0,0).getTime());
						done();
					});
			});
	});

	it("should be able to set end_date if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setEndDate')
			.send({eventID: event2._id, end_date:new Date(2155,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getEndDate')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('end_date');
						res.body.end_date.should.be.equal(
							new Date(2155,11,30,10,0,0).getTime());
						done();
					});
			});
	});

	it("should not be able to set invalid end_date if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setEndDate')
			.send({eventID: event2._id, end_date:new Date(2105,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(400);
				agentAdmin
					.get('http://localhost:3001/events/getEndDate')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('end_date');
						res.body.end_date.should.be.equal(
							new Date(2155,11,30,10,0,0).getTime());
						done();
					});
			});
	});

	it("should not be able to set end_date if user", function(done) {
		agent
			.post('http://localhost:3001/events/setEndDate')
			.send({eventID: event1._id, end_date:new Date(2146,11,30,10,0,0).getTime()})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agent
					.get('http://localhost:3001/events/getEndDate')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('end_date');
						res.body.end_date.should.be.equal(
							new Date(2150,11,30,10,0,0).getTime());
						done();
					});
			});
	});


	it("should be able to set location if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setLocation')
			.send({eventID: event2._id, location:"Rainbow2"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getLocation')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('location');
						res.body.location.should.be.equal(
							"Rainbow2");
						done();
					});
			});
	});

	it("should not be able to set invalid location if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setLocation')
			.send({eventID: event2._id, location:""})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(400);
				agentAdmin
					.get('http://localhost:3001/events/getLocation')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('location');
						res.body.location.should.be.equal(
							"Rainbow2");
						done();
					});
			});
	});

	it("should not be able to set location if user", function(done) {
		agent
			.post('http://localhost:3001/events/setLocation')
			.send({eventID: event1._id, location:"UserLocation"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agent
					.get('http://localhost:3001/events/getLocation')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('location');
						res.body.location.should.be.equal(
							"UF");
						done();
					});
			});
	});

	it("should be able to set schedule if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setSchedule')
			.send({eventID: event2._id, schedule:"BoBoBo"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getSchedule')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.be.equal(
							"BoBoBo");
						done();
					});
			});
	});

	it("should be able to set schedule to empty string if admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/setSchedule')
			.send({eventID: event2._id, schedule:""})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getSchedule')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.be.equal(
							"");
						done();
					});
			});
	});

	it("should not be able to set schedule if user for event I don't know about", function(done) {
		agent
			.post('http://localhost:3001/events/setSchedule')
			.send({eventID: event2._id, schedule:"UserSchedule"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agentAdmin
					.get('http://localhost:3001/events/getSchedule')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.be.equal(
							"");
						done();
					});
			});
	});

	it("should not be able to set schedule if user in general", function(done) {
		agent
			.post('http://localhost:3001/events/setSchedule')
			.send({eventID: event1._id, schedule:"UserSchedule"})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agent
					.get('http://localhost:3001/events/getSchedule')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('schedule');
						res.body.schedule.should.be.equal(
							"www.google.com");
						done();
					});
			});
	});

	it("should be able to update the event object if admin", function(done) {
		event2.name = "ReallyNewName";
		agentAdmin
			.post('http://localhost:3001/events/setEventObj')
			.send({eventID: event2._id, event:event2})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				agentAdmin
					.get('http://localhost:3001/events/getName')
					.send({eventID: event2._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.be.equal(
							"ReallyNewName");
						Event.findOne({'_id' : event2._id}, function(err, result) {
							res.body.name.should.be.equal(result.name);
							done();	
						})
					});
			});
	});

	it("should not be able to update the event object if user", function(done) {
		event1.name = "ReallyNewName2";
		agent
			.post('http://localhost:3001/events/setEventObj')
			.send({eventID: event1._id, event:event1})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				agent
					.get('http://localhost:3001/events/getName')
					.send({eventID: event1._id})
					.end(function(err,res) {
						if (err) throw err;
						res.status.should.be.equal(200);
						res.body.should.have.property('name');
						res.body.name.should.be.equal(
							"testing123");
						done();
					});
			});
	});

	it("should not be able to delete an event as a normal user", function(done) {
		agent
			.post('http://localhost:3001/events/delete')
			.send({eventID: event1._id})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(401);
				done();
			});
	});

	it("should be able to delete an event as an admin", function(done) {
		agentAdmin
			.post('http://localhost:3001/events/delete')
			.send({eventID: event1._id})
			.end(function(err,res) {
				if (err) throw err;
				res.status.should.be.equal(200);
				done();
			});
	});

	after(function(done) {
		//event1.remove() Deleted in a test
		event2.remove();
		user.remove();
		userAdmin.remove();
 		done();
	});
});
