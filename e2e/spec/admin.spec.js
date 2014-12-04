'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var assert = require('assert'),
        users = require('./models/user.server.model'),
	events = require('./models/event.server.model');

/**
* Global Variabls used for testing
*/
var event1, event2, event1d, ptor;

/**
*  Tests
*/

describe('Admin Page Protractor End-To-End Tests',function() {

	ptor = protractor.getInstance();

	it('should be able to visit the sign in page',function() {
		browser.get('http://localhost:3000/');
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('signin');
	});

	it('should be able to sign in',function() {
		browser.waitForAngular();
		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        	element(by.model('credentials.email')).sendKeys('demo@example.com');
        	element(by.model('credentials.password')).sendKeys('password');

        	element(by.css('button[type="submit"]')).click(); //Can select obscure entities
	});

	it('should be able to sign out',function() {
		browser.get('http://localhost:3000/auth/signout');
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('signin');
		ptor.manage().deleteAllCookies();
	});

	it('should be able to visit the sign in page',function() {
		browser.get('http://localhost:3000/');
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('signin');
	});
});
		
