'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	candidate = mongoose.model('Candidate'),
	config = require('../../config/config'),
	request = require('supertest');

/**
 * Globals
 */
var candidate1, duplicate;

function arraysEqual(array0,array1) {
    if (array0.length !== array1.length) return false;
    for (var i = 0; i<array0.length; i++) {
        if (array0[i] !== array1[i]) return false;
    }
    return true;
}

/**
 * Unit tests
 *
describe('Express.js Canidate Route Unit Tests:', function() {
	it("should be able to access the main page from the candidate route testing mechanism", function(done) {
		request('http://localhost:3001')
			.get('/')
			.expect(200);
		done();
	});
});
*/


describe('Candidate Route Tests:', function() {

	describe('Method Save', function() {
		beforeEach(function(done) {
			candidate1 = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer',
				note : 'this is a test'
			});
			duplicate = new candidate({
				fName : 'Full',
				lName : 'Name',
				email : 'test@test.com',
				status : 'volunteer',
				note : 'testing'
			});

			done();
		});
	

it("should be able to access the main page from the candidate route testing mechanism", function(done) {
		request('http://localhost:3001')
			.get('/')
			.expect(200);
		done();
	});
it("should be able to get the candidate first name", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getfName')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('fName');
					done();
				});
		});
	});


it("should be able to get the candidate last name", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getlName')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('lName');
					done();
				});
		});
	});

it("should be able to get the candidate last name", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getlName')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('lName');
					done();
				});
		});
	});

it("should be able to get the candidate email", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getEmail')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('email');
					done();
				});
		});
	});
it("should be able to get the candidate status", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getStatus')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('status');
					done();
				});
		});
	});
it("should be able to get the candidate events", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getEvents')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('events');
					done();
				});
		});
	});
it("should be able to get the candidate accpet_key", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.get('/candidate/getAccept_Key')
				.send({candidateID: candidate1._id})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('accept_key');
					done();
				});
		});
	});
it("should be able to get the candidate note", function(done) {
		candidate1.save(function(err) {
			request('http://localhost:3001')
				.send({candidateID: candidate1._id})
				.send({name: "test@test.com"})
				.expect(200)
				.end(function(err,res) {
					if (err) throw err;
					res.body.should.have.property('note');
					done();
				});
		});
	});








	});
});

