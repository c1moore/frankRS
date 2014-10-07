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
					name:  "testing123",
					start_date: "10.30.2014",
					end_date: "10.31.2014",
					location: "UF"
				},
				schedule: "www.google.com"
			});
			event2 = new events({
				contents: {
					name:  "testing123",
					start_date: "10.30.2014",
					end_date: "10.31.2014",
					location: "UF"
				},
			schedule: "www.google.com"
			});
			done();
		});

		it('should be able to save with out problems',function(done){
			event1.save(done);
		});

		it('should fail to save an existing event again',function(done){
			event1.save();
			return event2.save(function(err){
				should.exist(err);
				done();
			});
		});

		it('should allow an event to share everything but the name',function(done){
			event2.contents.name = 'Off campus';
			event2.save();
			done();
		});

		it('should allow getting the event name',function(done){
			event1.save();	
			var ename = event1.contents.name;
			(ename === undefined).should.be.false;
			(ename).should.be.equal(event1.contents.name);
			done();
		});

		it('should allow getting the event start date',function(done){
			event1.save();	
			var esdate = event1.contents.start_date;
			(esdate === undefined).should.be.false;
			(esdate).should.be.equal(event1.contents.start_date);
			done();
		});

		it('should allow getting the event end date',function(done){
			event1.save();	
			var eedate = event1.contents.end_date;
			(eedate === undefined).should.be.false;
			(eedate).should.be.equal(event1.contents.end_date);
			done();
		});

		it('should allow getting the event location',function(done){
			event1.save();	
			var eloc = event1.contents.location;
			(eloc === undefined).should.be.false;
			(eloc).should.be.equal(event1.contents.location);
			done();
		});

		it('should allow getting the event schedule',function(done){
			event1.save();	
			var esched = event1.schedule;
			(esched === undefined).should.be.false;
			(esched).should.be.equal(event1.schedule);
			done();
		});


		it('should be able to show an error when try to save without a name', function(done) {
			event1.contents.name = '';
			return event1.save(function(err) {
				should.exist(err);
				done();
			});
		});


		it('should be able to show an error when try to save without a start date', function(done) {
			var esdate_old = event1.contents.start_date;
			event1.contents.start_date= '';
			return event1.save(function(err) {
				event1.contents.start_date = esdate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a end date', function(done) {
			var eedate_old = event1.contents.end_date;
			event1.contents.end_date= '';
			return event1.save(function(err) {
				event1.contents.end_date = eedate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a location', function(done) {
			var eloc_old = event1.contents.location;
			event1.contents.location= '';
			return event1.save(function(err) {
				event1.contents.location = eloc_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a passed start date', function(done) {
			var esdate_old = event1.contents.start_date;
			event1.contents.start_date= '10.31.2000';
			return event1.save(function(err) {
				event1.contents.start_date = esdate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a passed end date', function(done) {
			var eedate_old = event1.contents.end_date;
			event1.contents.end_date= '10.31.2000';
			return event1.save(function(err) {
				event1.contents.end_date = eedate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a valid end date', function(done) {
			var eedate_old = event1.contents.end_date;
			event1.contents.end_date= 'this is not a date';
			return event1.save(function(err) {
				event1.contents.end_date = eedate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with an end date before the start date', function(done) {
			var eedate_old = event1.contents.end_date;
			event1.contents.end_date= '10.29.2014';
			return event1.save(function(err) {
				event1.contents.end_date = eedate_old;
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
