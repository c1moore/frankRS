'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	events = mongoose.model('Events');

/**
* Global Variabls used for testing
*/
var event1, event2, event3;

/**
*  Test functionality of Events
*/

describe('Event Model Unit Tests',function() {
	before(function(done){
		event1 = new events({
		name:  "testing123",
		sdate: "10.30.2014",
		edate: "10.31.2014",
		loc: "UF",
		sched: "www.google.com"
		});
	event2 = new events({
		name:  "testing123",
		sdate: "10.30.2014",
		edate: "10.31.2014",
		loc: "UF",
		sched: "www.google.com"
		});
		done();
	});

	describe('Method Save',function(){
		it('should be able to save with out problems',function(done){
			event1.save(done);
		});

		it('should fail to save an existing event again',function(done){
			event2.save;
			return event2.save(function(err){
				should.exist(err);
				done();
			});
		});

		it('should allow an event to share everything but the name',function(done){
			event2.name = 'Off campus';
			event2.save;
			
		});

		it('should allow getting the event name',function(done){
			var ename = event1.get('name');
			assert.equal(ename,event1.name);
			assert.notequal(ename,undefined);
		});

		it('should allow getting the event start date',function(done){
			var esdate = event1.get('sdate');
			assert.equal(esdate,event1.sdate);
			assert.notequal(esdate,undefined);
		});

		it('should allow getting the event end date',function(done){
			var eedate = event1.get('edate');
			assert.equal(eedate,event1.edate);
			assert.notequal(eedate,undefined);
		});

		it('should allow getting the event location',function(done){
			var eloc = event1.get('loc');
			assert.equal(eloc,event1.loc);
			assert.notequal(eloc,undefined);
		});

		it('should allow getting the event schedule',function(done){
			var esched = event1.get('sched');
			assert.equal(esched,event1.sched);
			assert.notequal(esched,undefined);
		});


		it('should be able to show an error when try to save without a name', function(done) {
			var ename_old = event1.name;
			event1.name= '';
			return event.save(function(err) {
				event.name = ename_old;
				should.exist(err);
				done();
			});
		});


		it('should be able to show an error when try to save without a start date', function(done) {
			var esdate_old = event1.sdate;
			event1.sdate= '';
			return event.save(function(err) {
				event.sdate = esdate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a end date', function(done) {
			var eedate_old = event1.edate;
			event1.edate= '';
			return event.save(function(err) {
				event.edate = eedate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a location', function(done) {
			var eloc_old = event1.loc;
			event1.loc= '';
			return event.save(function(err) {
				event.loc = eloc_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a past start date', function(done) {
			var esdate_old = event1.sdate;
			event1.sdate= '10.31.2000';
			return event.save(function(err) {
				event.sdate = esdate_old;
				should.exist(err);
				done();
			});
		});
		it('should be able to show an error when try to save without a valid start date', function(done) {
			var esdate_old = event1.sdate;
			event1.sdate= 'not a date';
			return event.save(function(err) {
				event.sdate = esdate_old;
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with a past end date', function(done) {
			var eedate_old = event1.edate;
			event1.edate= '10.31.2000';
			return event.save(function(err) {
				event.edate = eedate_old;
				should.exist(err);
				done();
				});
			});

		it('should be able to show an error when try to save without a valid end date', function(done) {
			var eedate_old = event1.edate;
			event1.edate= 'this is not a date';
			return event.save(function(err) {
				event.edate = eedate_old;
				should.exist(err);
				done();
				});
			});
		it('should be able to show an error when try to save with an end date before the start date', function(done) {
			var eedate_old = event1.edate;
			event1.edate= '10.29.2014';
			return event.save(function(err) {
				event.edate = eedate_old;
				should.exist(err);
				done();
				});
			});
		});


	});
	
	after(function(done)){
		event1.remove().exec();
		event2.remove().exec();
		event3.remove().exec();
	});



});