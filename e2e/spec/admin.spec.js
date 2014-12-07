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

	it('should be able to maximize the browser', function() {
		browser.driver.manage().window().maximize();
	});

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
		element(by.model('newCandidate.note')).sendKeys("Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.");

		expect(element(by.css('button[type="submit"]')).isEnabled()).toBe(true);
		element(by.css('button[type="submit"]')).click();
                browser.waitForAngular();
		browser.refresh();
		browser.waitForAngular();
		element(by.cssContainingText('.dropdown-toggle','Select Event')).click();
                browser.waitForAngular();
                element(by.cssContainingText('.ng-binding','Project Demonstration')).click();
                browser.waitForAngular();
		expect(element(by.cssContainingText('td.ng-binding', 'George Bush')).isPresent()).toBeTruthy();
	});

	/* it('should not be able to add a new candidate without event selected', function() {
                element(by.cssContainingText('.container-fluid h2','Admin Page')).click();
                browser.waitForAngular();
                element(by.model('newCandidate.fName')).sendKeys('Alin');
                element(by.model('newCandidate.lName')).sendKeys('Dobra');
                element(by.model('newCandidate.email')).sendKeys('professor_candidate@example.com');
                element(by.model('newCandidate.note')).sendKeys("Four score and seven years ago...");
		element(by.css('button[type="submit"]')).click();
		browser.waitForAngular();
		expect(element(by.cssContainingText('td.ng-binding', 'Alin Dobra')).isPresent()).toBe(false);
        });*/


	it('should be able to select the events tab', function() {
		element(by.cssContainingText('a.ng-binding','Event')).click();
		browser.waitForAngular();
		expect(element(by.cssContainingText('.frank-main-view','Event List')).isPresent()).toBeTruthy();
        });

        it('should be able to create a new event', function() {
  		element(by.model('newEvent.name')).sendKeys('000_Project Demonstration For Instructor');
                element(by.model('newEvent.start_date')).sendKeys('12/12/2025');
                element(by.model('newEvent.end_date')).sendKeys('12/30/2025');
                element(by.model('newEvent.location')).sendKeys('CSE Building');
		element(by.cssContainingText('button[type="submit"]','Add Event')).click();
		browser.waitForAngular();
		element(by.cssContainingText('a.ng-binding','Event')).click();
                browser.waitForAngular();
		expect(element(by.cssContainingText('span.ng-binding', '000_Project Demonstration For Instructor'))
			.isPresent()).toBeTruthy();
	});

	it('should be able to sign out for later tests',function() {
                element(by.css('.dropdown-toggle span[data-ng-bind="authentication.user.fName"]')).click();
                browser.waitForAngular();
                element(by.css('.dropdown-menu a[href="/auth/signout"]')).click();
                browser.waitForAngular();
                expect(ptor.getCurrentUrl()).toContain('signin');
        });


});
		
