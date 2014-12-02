describe('e2e page loading tests', function() {


    it('should be able to sign in', function() {
        browser.get('http://localhost:3000/#!/');
        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('signin');

        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element(by.model('credentials.email')).sendKeys('faaal1dkcb3nngznn4jhu94hj6@HHuGgdgOBlmE3MMFmyczhOhBsD.gov');
        element(by.model('credentials.password')).sendKeys('password');


        element(by.css('button[type="submit"]')).click();
        browser.sleep(500);

    });

    it('should be able to get to the leaderboards', function() {
        browser.get('http://localhost:3000/#!/');


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/leaderboard"]')).click();
        browser.sleep(500);

        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('leaderboard');

    });
    it('should be able to get to the admin page', function() {
        browser.get('http://localhost:3000/#!/');


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/admin"]')).click();
        browser.sleep(500);


        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('admin');

    });
    it('should be able to get to the invitations page', function() {
        browser.get('http://localhost:3000/#!/');

        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/invite"]')).click();
        browser.sleep(500);


        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('invite');

    });
    it('should be able to get to the memoboard page', function() {
        browser.get('http://localhost:3000/#!/');

        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/memoboard"]')).click();
        browser.sleep(500);


        var ptor;
        ptor = protractor.getInstance();
        expect(ptor.getCurrentUrl()).toContain('memoboard');

    });


