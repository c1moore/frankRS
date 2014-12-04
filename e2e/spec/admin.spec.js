'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var assert = require('assert'),
        users = require('./models/user.server.model'),
	events = require('./models/events.server.model');

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
		
