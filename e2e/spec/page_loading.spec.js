describe('e2e page loading tests', function() {

    var delaylength = 500;
    var ptor;
        ptor = browser;


	it('should be able to sign in', function() {
		browser.driver.manage().window().maximize();
		browser.get('http://localhost:3000/#!/');
		
		expect(ptor.getCurrentUrl()).toContain('signin');

		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
		element(by.model('credentials.email')).sendKeys('demo@example.com');
		element(by.model('credentials.password')).sendKeys('password');


		element(by.css('button[type="submit"]')).click();
		browser.waitForAngular();

	});

	it('should be able to get to the leaderboards', function() {
	browser.navigate().back();


		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
		element.all(by.css('.homeButtonContainer a[href="/#!/leaderboard"]')).click();
		browser.waitForAngular();

	
		expect(ptor.getCurrentUrl()).toContain('leaderboard');

	});
	it('should be able to get to the admin page', function() {
	browser.navigate().back();


		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
		element.all(by.css('.homeButtonContainer a[href="/#!/admin"]')).click();
		browser.waitForAngular();


	   
		expect(ptor.getCurrentUrl()).toContain('admin');

	});
	it('should be able to get to the invitations page', function() {
	browser.navigate().back();

		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
		element.all(by.css('.homeButtonContainer a[href="/#!/invite"]')).click();
		browser.waitForAngular();


	   
		expect(ptor.getCurrentUrl()).toContain('invite');

	});
	it('should be able to get to the memoboard page', function() {
	browser.navigate().back();

<<<<<<< HEAD
		expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
		element.all(by.css('.homeButtonContainer a[href="/#!/memoboard"]')).click();
		browser.waitForAngular();


		
		expect(ptor.getCurrentUrl()).toContain('memoboard');
=======
        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/memoboard"]')).click();
	try {
    		driver.switchTo().alert().dismiss();
	} catch (NoAlertPresentException ignored) {}
        browser.waitForAngular();
        try {
                driver.switchTo().alert().dismiss();
        } catch (NoAlertPresentException ignored) {}
        expect(ptor.getCurrentUrl()).toContain('memoboard');
>>>>>>> dev

	});
   it('should be able to sign out',function() {
<<<<<<< HEAD
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
});
=======
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
});
>>>>>>> dev
