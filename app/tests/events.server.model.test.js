'use strict';

/*jshint expr:true */

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
				name:  'testing123',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event2 = new events({
					name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'UF',
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
				event2.name = 'Off campus';
				event2.save(done);
			});
		});

		it('should allow getting the event name',function(done){
			event1.save(function() {
				var query = events.findOne({'name': event1.name});
				query.exec(function (err, result) {
					(result.name === undefined).should.be.false;
					(result.name).should.be.equal(event1.name);
					done();
				});
			});
		});

		it('should allow getting the event start date',function(done){
			event1.save(function() {
				var query = events.findOne({'start_date': event1.start_date});
				query.exec(function (err, result) {
					(result.start_date === undefined).should.be.false;
					(result.start_date).should.be.equal(event1.start_date);
					done();
				});
			});
		});

		it('should allow getting the event end date',function(done){
			event1.save(function() {
				var query = events.findOne({'end_date': event1.end_date});
				query.exec(function (err, result) {
					(result.end_date === undefined).should.be.false;
					(result.end_date).should.be.equal(event1.end_date);
					done();
				});
			});
		});

		it('should allow getting the event location',function(done){
			event1.save(function() {
				var query = events.findOne({'location': event1.location});
				query.exec(function (err, result) {
					(result.location === undefined).should.be.false;
					(result.location).should.be.equal(event1.location);
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
			event1.name = '';
			return event1.save(function(err, obj, num) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a start date', function(done) {
			event1.start_date= '';
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a end date', function(done) {
			event1.end_date= '';
			return event1.save(function(err, obj) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a location', function(done) {
			event1.location= '';
			return event1.save(function(err, obj) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with a past start date', function(done) {
			event1.start_date= new Date(2013,10,20,10,0,0).getTime();
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with a past end date', function(done) {
			event1.end_date= new Date(2013,10,20,10,0,0).getTime();
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save without a valid end date', function(done) {
			event1.end_date= 'this is not a date';
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when trying to save with an end date before the start date', function(done) {
			event1.end_date=  new Date(2014,11,20,10,0,0).getTime();
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
