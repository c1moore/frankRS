'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	Event = mongoose.model('Event'),
	User = mongoose.model('User'),
	config = require('../../config/config'),
	request = require('supertest');

/**
 * Globals
 */
var event1, event2, user;

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
	before(function(done) {
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
		done();
	});

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
		
			
		done();
	});

	it("should be able to access the main page from the event route testing mechanism", function(done) {
		request('http://localhost:3001')
			.get('/')
			.expect(200);
		done();
	});

	it("should be able to get the event start date", function(done) {
		event1.save(function(err) {
			request('http://localhost:3001')
				.get('/events/getStartDate')
				.send({eventID: event1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('start_date');
					done();
				});
		});
	});

	it("should be able to get the event end date", function(done) {
		event1.save(function(err) {
			request('http://localhost:3001')
				.get('/events/getEndDate')
				.send({eventID: event1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('end_date');
					done();
				});
		});
	});

	it("should be able to get the event location", function(done) {
		event1.save(function(err) {
			request('http://localhost:3001')
				.get('/events/getLocation')
				.send({eventID: event1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('location');
					res.body.location.should.be.equal('UF');
					done();
				});
		});
	});

	it("should be able to get the event schedule", function(done) {
		event1.save(function(err) {
			request('http://localhost:3001')
				.get('/events/getSchedule')
				.send({eventID: event1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('schedule');
					res.body.schedule.should.be.equal('www.google.com');
					done();
				});
		});
	});

	it("should be able to get the event object in its entirety", function(done) {
		event1.save(function(err) {
			request('http://localhost:3001')
				.get('/events/getEventObj')
				.send({eventID: event1._id})
				.expect(200)
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

	afterEach(function(done){
		event1.remove();
		event2.remove();
		user.remove();
		done();
	});
});
