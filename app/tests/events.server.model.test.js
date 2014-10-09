'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	assert = require('assert'),
	events = mongoose.model('Event');

/**
* Global Variabls used for testing
*/
var event1, event2, event3;

/**
*  Test functionality of Events
*/

describe('Event Model Unit Tests',function() {

	describe('Method Save',function(){
		beforeEach(function(done){
			event1 = new events({
			contents: {
					name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0),  //month is zero based.  11 = dec
					location: 'UF'
				},
			schedule: 'www.google.com'
			});
			event2 = new events({
				contents: {
					name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0),  //month is zero based.  11 = dec
					location: 'UF'
				},
			schedule: 'www.google.com'
			});
			done();
		});

		it('should be able to save with out problems',function(done){
			event1.save(done);
		});

		it('should fail to save an existing event again',function(done){
			event1.save(function(err1,obj,num){
				return event2.save(function(err){
					should.exist(err);
					done();
				});
			});
			
		});

		it('should allow an event to share everything but the name',function(done){
			event1.save(function(err1,obj,num){
				event2.contents.name = 'Off campus';
				event2.save(done);
			});
		});

		it('should allow getting the event name',function(done){
			event1.save(function() {
				var query = events.findOne({'contents.name': event1.contents.name});
				query.exec(function (err, result) {
					(result.contents.name === undefined).should.be.false;
					(result.contents.name).should.be.equal(event1.contents.name);
					done();
				});
			});
		});

		it('should allow getting the event start date',function(done){
			event1.save(function() {
				var query = events.findOne({'contents.start_date': event1.contents.start_date});
				query.exec(function (err, result) {
					(result.contents.start_date === undefined).should.be.false;
					(result.contents.start_date).should.be.equal(event1.contents.start_date);
					done();
				});
			});
		});

		it('should allow getting the event end date',function(done){
			event1.save(function() {
				var query = events.findOne({'contents.end_date': event1.contents.end_date});
				query.exec(function (err, result) {
					(result.contents.end_date === undefined).should.be.false;
					(result.contents.end_date).should.be.equal(event1.contents.end_date);
					done();
				});
			});
		});

		it('should allow getting the event location',function(done){
			event1.save(function() {
				var query = events.findOne({'contents.location': event1.contents.location});
				query.exec(function (err, result) {
					(result.contents.location === undefined).should.be.false;
					(result.contents.location).should.be.equal(event1.contents.location);
					done();
				});
			});
		});

		it('should allow getting the event schedule',function(done){
			event1.save(function() {
				var query = events.findOne({'schedule': event1.schedule});
				query.exec(function (err, result) {
					(result.schedule === undefined).should.be.false;
					(result.schedule).should.be.equal(event1.schedule);
					done();
				});
			});
		});


		it('should be able to show an error when trying to save without a name', function(done) {
			event1.contents.name = '';
			return event1.save(function(err, obj, num) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a start date', function(done) {
			event1.contents.start_date= '';
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a end date', function(done) {
			event1.contents.end_date= '';
			return event1.save(function(err, obj) {
			//	console.log(obj);
			//	console.log(obj.contents.end_date == true);
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a location', function(done) {
			event1.contents.location= '';
			return event1.save(function(err, obj) {
			//	console.log(obj);
			//	console.log(obj.contents.location==true);
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with a past start date', function(done) {
			event1.contents.start_date= new Date(2013,10,20,10,0,0);
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with a past end date', function(done) {
			event1.contents.end_date= new Date(2013,10,20,10,0,0);
				console.log(Date.parse(event1.contents.end_date)>=new Date().getTime());
				console.log(Date.parse(event1.contents.end_date));
				console.log(Date.getTime());
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a valid end date', function(done) {
			event1.contents.end_date= 'this is not a date';
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with an end date before the start date', function(done) {
			event1.contents.end_date=  new Date(2014,11,20,10,0,0);
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});
	
		afterEach(function(done){
			event1.remove();
			event2.remove();
			done();
		});
	});
});
