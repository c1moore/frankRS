
describe('e2e leaderboard tests', function() {
    var delaylength = 500;
    var ptor;
    ptor = protractor.getInstance();

    var scrollIntoView = function () {
        arguments[0].scrollIntoView();
    }


    it('should be able to sign in', function() {
        browser.driver.manage().window().maximize();
        browser.get('http://localhost:3000/#!/');
      
        expect(ptor.getCurrentUrl()).toContain('signin');

        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element(by.model('credentials.email')).sendKeys('demo@example.com');
        element(by.model('credentials.password')).sendKeys('password');


        element(by.css('button[type="submit"]')).click();

    });

it('should be able to select demo event',function(){
    element.all(by.css('.dropdown span[data-ng-bind="eventSelector.selectedEvent"]')).click();
    browser.waitForAngular();
    element(by.css('.dropdown.open .dropdown-menu.ng-scope[ng-if="eventSelector.admin"] li a', 'Project Demonstration')).click();
    browser.waitForAngular();
    //expect(element(by.css('.dropdown li a span[eventSelector.selectedEvent'))).toMatch(/Project Demonstration/);
});

 it('should be able to get to the leaderboards', function() {


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
        element.all(by.css('.homeButtonContainer a[href="/#!/leaderboard"]')).click();
        browser.waitForAngular();

      
        expect(ptor.getCurrentUrl()).toContain('leaderboard');

    });
  it('should be able to get to the leaderboard tab', function() {


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
      var link;
       // link = element.all(by.binding('Leaderboard')).click();
       link = element.all(by.css('.nav.nav-tabs li[heading="Leaderboard"]'));
       link.click();
        browser.waitForAngular();
        //browser.driver.sleep(2000);
      
       // expect(ptor.getCurrentUrl()).toContain('leaderboard');

        expect(link.getAttribute('class')).toMatch(/active/);



    });
  it('should be able to sort the leaderboard ranks', function(){
    element.all(by.model('mainTableFilter.displayName')).sendKeys('Alin');
    browser.waitForAngular();
    //browser.driver.sleep(2000);
        element.all(by.model('mainTableFilter.displayName')).clear();
        browser.waitForAngular();


  });

  it('should be able to get to the attending tab', function() {


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
      var link;
       // link = element.all(by.binding('Leaderboard')).click();
       link = element.all(by.css('.nav.nav-tabs li[heading="Attending"]'));
       link.click();
        browser.waitForAngular();
        //browser.driver.sleep(2000);
      
       // expect(ptor.getCurrentUrl()).toContain('leaderboard');

        expect(link.getAttribute('class')).toMatch(/active/);



    });

    // it('should be able to sort the attending by attendee name', function(){
    //     element.all(by.model('params.filter()[name:"Attendee Name"]')).sendKeys('A');
    //     browser.waitForAngular();
    //     //browser.driver.sleep(2000);
    //     element.all(by.model('params.filter()[name]')).clear;
    //     browser.waitForAngular();

    //     });

  it('should be able to get to the Invited tab', function() {


        expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
      var link;
       // link = element.all(by.binding('Leaderboard')).click();
       link = element.all(by.css('.nav.nav-tabs li[heading="Invited"]'));
       link.click();
        browser.waitForAngular();
        //browser.driver.sleep(2000);
      
       // expect(ptor.getCurrentUrl()).toContain('leaderboard');

        expect(link.getAttribute('class')).toMatch(/active/);



    });

  it('should be able to add a comment',function(){
     // element(by.css('.frank-recruiter-comments.frank-recruiter-comments-expanded')).click();
     // browser.executeScript(scrollIntoView, element(by.id('frank-comment-editorDivider')));
    browser.waitForAngular();

    element(by.css('.frank-comment-editor-compressed')).click();
    browser.waitForAngular();
    //browser.driver.sleep(3000);
    // browser.executeScript(scrollIntoView, element(by.css('.ta-scroll-window.ng-scope.ta-text.ta-editor.form-control div[ta-bind="ta-bind"]')));

    element(by.css('.ta-scroll-window.ng-scope.ta-text.ta-editor.form-control div[ta-bind="ta-bind"]')).sendKeys('Testing Comment Box');
        browser.waitForAngular();

    browser.waitForAngular();
  //  browser.driver.sleep(3000);
      // browser.executeScript(scrollIntoView, element(by.css('.frank-comment-editor-submit input[type="submit"]')));
    browser.waitForAngular();

    element(by.css('.frank-comment-editor-submit input[type="submit"]')).click();
    browser.waitForAngular();

    expect(element(by.cssContainingText('.frank-comment-message .ng-binding p','Testing Comment Box')).isPresent());

  //  expect.(element(by.css('.frank-comment-message .ng-binding p','Testing Comment Box')).isPresent());
  //  browser.driver.sleep(3000);

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
    
});