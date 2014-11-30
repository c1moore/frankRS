describe('angularjs homepage todo list', function() {
    // Add the custom locator.


  it('should be able to sign in', function() {
    browser.get('http://localhost:3000/#!/');
    expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');

    element(by.model('credentials.email')).sendKeys('h6qep298x61j@pGop1bULdMtDiO5nbggEPu6eF5tyyXaMLs.com');
    element(by.model('credentials.password')).sendKeys('password');


    element(by.css('button[type="submit"]')).click();
    //<button type="submit" class="btn btn-primary">Sign in</button>

    // var todoList = element.all(by.repeater('todo in todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write a protractor test');
  });

  it('should be able to get to the leaderboards', function() {
    browser.get('http://localhost:3000/#!/');
    expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
    //element(by.buttonText('Leaderboard')).click();
   element.all((by.binding('button[type="Leaderboard"]'))).click();

    //<button type="submit" class="btn btn-primary">Sign in</button>

    // var todoList = element.all(by.repeater('todo in todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write a protractor test');
  });
    it('should be able to get to the admin page', function() {
    browser.get('http://localhost:3000/#!/');
    expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
    //element(by.buttonText('Leaderboard')).click();
    element.all((by.binding('button[type="Control Room"]'))).click();

    //<button type="submit" class="btn btn-primary">Sign in</button>

    // var todoList = element.all(by.repeater('todo in todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write a protractor test');
  });
    it('should be able to get to the invitations page', function() {
    browser.get('http://localhost:3000/#!/');
    expect(browser.getTitle()).toEqual('frank Recruiter System - Development Environment');
    //element(by.buttonText('Leaderboard')).click();
    element.all((by.binding('button[type="Invitations"]'))).click();

    //<button type="submit" class="btn btn-primary">Sign in</button>

    // var todoList = element.all(by.repeater('todo in todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write a protractor test');
  });

});

