describe('e2e leaderboard tests', function() {
    var delaylength = 500;

    it('should be able to sign in', function() {
        browser.get('http://localhost:3000/#!/');
        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('signin');

        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element(by.model('credentials.email')).sendKeys('demo@example.com');
        element(by.model('credentials.password')).sendKeys('password');


        element(by.css('button[type="submit"]')).click();

    });

 it('should be able to get to the leaderboards', function() {
        browser.get('http://localhost:3000/#!/');


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/leaderboard"]')).click();
        browser.waitForAngular();

        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('leaderboard');

    });
    
});