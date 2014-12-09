'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */

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

        	element(by.css('button[type="submit"]')).click();
	});

	it('should be able to sign out',function() {
		element(by.css('.dropdown-toggle span[data-ng-bind="authentication.user.fName"]')).click();
		browser.waitForAngular();
		element(by.css('.dropdown-menu a[href="/auth/signout"]')).click();
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('signin');
	});

	it('should be able to visit the sign in page',function() {
		browser.get('http://localhost:3000/');
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('signin');
	});

	it('should be able to sign in',function() {
		element(by.model('credentials.email')).sendKeys('demo@example.com');
        	element(by.model('credentials.password')).sendKeys('password');
        	element(by.css('button[type="submit"]')).click();
        	browser.waitForAngular();
	});

	it('should be able to visit the admin page', function() {
		element(by.css('.homeButton.text-center a[href="/#!/admin"]')).click();
		browser.waitForAngular();
		expect(ptor.getCurrentUrl()).toContain('admin');
	});

	it('should be able to add a new candidate', function() {
		element(by.css('.dropdown-toggle.ng-binding.btn.btn-default')).click();
		browser.waitForAngular();
		element(by.cssContainingText('a[role="menuitem"]',' Project Demonstration')).click();
		browser.waitForAngular();
		element(by.cssContainingText('.container-fluid h2','Admin Page')).click();
		browser.waitForAngular();
		element(by.model('newCandidate.fName')).sendKeys('George');
		element(by.model('newCandidate.lName')).sendKeys('Bush');
		element(by.model('newCandidate.email')).sendKeys('bagins_candidate@example.com');
		expect(element(by.css('button[type="submit"]')).isEnabled()).toBe(true);
		element(by.css('button[type="submit"]')).click();
                browser.waitForAngular();
		browser.refresh();
		browser.waitForAngular();
		expect(element(by.cssContainingText('frank-main-view tbody tr td', 'George Bush')).isPresent()).toBeTruthy();
	});

	it('should be able to visit the event tab',function() {
		element(by.cssContainingText('.nav.nav-tabs li a','Event')).click();
		browser.waitForAngular();
		expect(element(by.cssContainingText('.col-sm-8','Event List')).isDisplayed()).toBeTruthy();
        });

	it('should be able to add a new event', function() {
		element(by.model('newEvent.name')).sendKeys('Super Cool Event');
		element(by.model('newEvent.start_date')).sendKeys('12/12/2025');
		element(by.model('newEvent.end_date')).sendKeys('12/20/2025');
		element(by.model('newEvent.location')).sendKeys('CSE Building');
		element(by.cssContainingText('button[type="submit"]','Add Event')).click();
		browser.waitForAngular();
		browser.refresh();
		browser.waitForAngular();
		element(by.cssContainingText('.nav.nav-tabs li a','Event')).click();
                browser.waitForAngular();
                expect(element(by.cssContainingText('.col-sm-8','Event List')).isDisplayed()).toBeTruthy();
		browser.waitForAngular();
		expect(element(by.cssContainingText('frank-main-view tbody tr td[data-title="Name"]',
			'Super Cool Event')).isPresent()).toBeTruthy();
	});
		

	it('should be able to sign out for later tests',function() {
                element(by.css('.dropdown-toggle span[data-ng-bind="authentication.user.fName"]')).click();
                browser.waitForAngular();
                element(by.css('.dropdown-menu a[href="/auth/signout"]')).click();
                browser.waitForAngular();
                expect(ptor.getCurrentUrl()).toContain('signin');
        });

});
		
