angular.module('admin').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('admin', {
			url: '/admin',
			templateUrl:'modules/admin/views/admin.client.view.html'
		});
		
		.state('application', {
                url: '/admin/application',
                views: {
                  '': { templateUrl: 'modules/admin/views/partial-application.client.view.html'},
                  // 'columnUno@application': 
                  'columnDos@application': {
                      templateUrl: 'modules/admin/views/tabletwo-data.client.view.html',
                      controller:'applicationController'
                      
                  }
                }
            })
            
            .state('event', {
                url:'/admin/event',
                views: {
                    '': { templateUrl: 'modules/admin/views/partial-event.client.view.html'},
                   // 'columnOne@event': { template:'Add an event!' },
                    'columnTwo@event': {
                        templateUrl:'modules/admin/views/table-data.client.view.html',
                        controller:'eventController'
                    }
                }
            });
	}
]);
