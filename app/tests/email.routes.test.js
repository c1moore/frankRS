'use strict';

/* jshint expr:true */

/**
* Module dependencies.
*/
var should = require('should'),
	_ = require('lodash'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest'),
	agent = require('superagent'),
	path = require('path');

var tempAgent = agent.agent(),
	responseText = "This is a test to determine whether <or not> this method can truly return everything \"I expect \" it to 'contain.'  I hope it does; however, I have been wrong before.";

describe('Email Integration Tests:', function() {
	it('should return a template if necessary fields are specified.', function(done) {
		this.timeout(10000);

		tempAgent
			.get('http://localhost:3001/view/template')
			.query({filename : "preview/test_event", determine : "determine"})
			.end(function(err, res) {
				if(err) {
					return done(err);
				}

				res.status.should.equal(200);
				res.text.should.equal(responseText);

				done();
			});
	});

	it('should return an error when filename is not specified.', function(done) {
		tempAgent
			.get('http://localhost:3001/view/template')
			.query({determine : "determine"})
			.end(function(err, res) {
				if(err) {
					return done(err);
				}

				res.status.should.equal(400);
				res.body.message.should.equal("No file specified.");

				done();
			});
	});

	it('should return a 400 error when filename is incorrect.', function(done) {
		tempAgent
			.get('http://localhost:3001/view/template')
			.query({filename : "preview/test_event_500", determine : "determine"})
			.end(function(err, res) {
				if(err) {
					return done(err);
				}

				res.status.should.equal(400);
				res.body.message.should.equal("File not found.");

				done();
			});
	});

	it('should not render fields that are functions.', function(done) {
		tempAgent
			.get('http://localhost:3001/view/template')
			.query({filename : "preview/test_event", determine : function(){return "determine";}})
			.end(function(err, res) {
				if(err) {
					return done(err);
				}

				res.status.should.equal(200);
				res.text.should.equal(responseText.replace(/determine/, ""));

				done();
			});
	});
});