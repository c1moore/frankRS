'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	assert = require('assert'),
        users = mongoose.model('User'),
	events = mongoose.model('Event');

/**
* Global Variabls used for testing
*/
var event1, event2, event1d, ptor;

/**
*  Test functionality of Events
*/

describe('Admin Page Protractor End-To-End Tests',function() {

	ptor = protractor.getInstance();

	it('should be able to visit the sign in page',function() {
		browser.get('http://localhost:3000/');
		expect(ptor.getCurrentUrl()).toContain('signin');
	});

});
		
