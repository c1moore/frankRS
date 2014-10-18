'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest');

/**
 * Globals
 */
var user, user2;

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
describe('Express.js User Route Unit Tests:', function() {
	it("should be able to access the main page from the user route testing mechanism", function(done) {
		request('http://localhost:3001')
			.get('/')
			.expect(200);
		done();
	});
});
