'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	assert = require('assert'),
	Evnt = mongoose.model('Event');

/**
* Global Variabls used for testing
*/
var event1, event2, event1d,
	startDate;

/**
*  Test functionality of Events
*/

describe('Event Model Unit Tests',function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		Evnt.remove(function() {
			done();
		});
	});

	describe('Method Save',function(){
		beforeEach(function(done){
			var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
			startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
			var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

			event1 = new Evnt({
				name:  'testing1231',
				start_date: startDate,
				end_date:  endDate,
				location: 'UF',
				schedule: 'www.google.com',
				capacity: 50
			});

			event1d = new Evnt({
				name:  'testing1231',
				start_date: startDate,
				end_date:  endDate,
				location: 'UF',
				schedule: 'www.google.com',
				capacity: 50
			});

			event2 = new Evnt({
				name:  'testing1232',
				start_date: startDate,
				end_date:  endDate,
				location: 'UF',
				schedule: 'www.google.com',
				capacity: 50
			});
			
			done();
		});

		it('should be able to save with out problems',function(done){
			event1.save(done);
		});

		it('should fail to save an existing event again',function(done){
			event1.save(function(err){
				should.not.exist(err);
				event1d.save(function(err){
					should.exist(err);
					err.code.should.equal(11000);
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
				var query = Evnt.findOne({'name': event1.name}, function (err, result) {
					(result.name === undefined).should.be.false;
					(result.name).should.be.equal(event1.name);
					done();
				});
			});
		});

		it('should allow getting the event start date',function(done){
			event1.save(function() {
				var query = Evnt.findOne({'start_date': event1.start_date});
				query.exec(function (err, result) {
					(result.start_date === undefined).should.be.false;
					(result.start_date).should.be.equal(event1.start_date);
					done();
				});
			});
		});

		it('should allow getting the event end date',function(done){
			event1.save(function() {
				var query = Evnt.findOne({'end_date': event1.end_date});
				query.exec(function (err, result) {
					(result.end_date === undefined).should.be.false;
					(result.end_date).should.be.equal(event1.end_date);
					done();
				});
			});
		});

		it('should allow getting the event location',function(done){
			event1.save(function() {
				var query = Evnt.findOne({'location': event1.location});
				query.exec(function (err, result) {
					(result.location === undefined).should.be.false;
					(result.location).should.be.equal(event1.location);
					done();
				});
			});
		});

		it('should allow getting the event schedule',function(done){
			event1.save(function() {
				var query = Evnt.findOne({'schedule': event1.schedule});
				query.exec(function (err, result) {
					(result.schedule === undefined).should.be.false;
					(result.schedule).should.be.equal(event1.schedule);
					done();
				});
			});
		});


		it('should be able to show an error when trying to save without a name', function(done) {
			event1.name = '';
			event1.save(function(err, obj, num) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save without a start date', function(done) {
			event1.start_date= '';
			return event1.save(function(err) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save without a end date', function(done) {
			event1.end_date= '';
			return event1.save(function(err, obj) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save without a location', function(done) {
			event1.location= '';
			return event1.save(function(err, obj) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save with a past start date', function(done) {
			event1.start_date= new Date(2013,10,20,10,0,0).getTime();
			return event1.save(function(err) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save with a past end date', function(done) {
			event1.end_date= new Date(2013,10,20,10,0,0).getTime();
			return event1.save(function(err) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});

		it('should be able to show an error when trying to save without a valid end date', function(done) {
			event1.end_date= 'this is not a date';
			return event1.save(function(err) {
				should.exist(err);
				err.name.should.equal("CastError");
				done();
			});
		});

		it('should be able to show an error when trying to save with an end date before the start date', function(done) {
			event1.end_date=  new Date(startDate - 50000).getTime();
			return event1.save(function(err) {
				should.exist(err);
				err.message.should.equal("Validation failed");
				done();
			});
		});
	
		afterEach(function(done){
			event1.remove(function(err) {
				if(err)
					return done(err);

				event2.remove(function(err) {
					if(err)
						return done(err);

					event1d.remove(function(err) {
						if(err)
							return done(err);

						done();
					})
				})
			});
		});
	});
});
