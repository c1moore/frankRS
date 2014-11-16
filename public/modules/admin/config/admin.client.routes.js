var routerApp = angular.module('routerApp', ['ui.router']);

routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/event');
    
    $stateProvider
    
    
            .state('application', {
                url: '/application',
                views: {
                  '': { templateUrl: 'partial-application.html'},
                  // 'columnUno@application': 
                  'columnDos@application': {
                      templateUrl: 'tabletwo-data.html',
                      controller:'applicationController'
                      
                  }
                }
            })
            
            .state('event', {
                url:'/event',
                views: {
                    '': { templateUrl: 'partial-event.html'},
                   // 'columnOne@event': { template:'Add an event!' },
                    'columnTwo@event': {
                        templateUrl:'table-data.html',
                        controller:'eventController'
                    }
                }
            });
});
