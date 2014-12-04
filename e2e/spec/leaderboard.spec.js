
describe('e2e leaderboard tests', function() {
    var delaylength = 500;
      var ptor;
        ptor = protractor.getInstance();


    it('should be able to sign in', function() {
        browser.get('http://localhost:3000/#!/');
      
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

      
        expect(ptor.getCurrentUrl()).toContain('leaderboard');

    });
  it('should be able to get to the leaderboard tab', function() {
        browser.get('http://localhost:3000/#!/');


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
      var link;
       // link = element.all(by.binding('Leaderboard')).click();
       link = element.all(by.css('.nav ul li a[heading="Leaderboard"]'));
       link.click();
        browser.waitForAngular();

      
       // expect(ptor.getCurrentUrl()).toContain('leaderboard');

        expect(link.getAttribute('class')).toMatch(/active/);



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