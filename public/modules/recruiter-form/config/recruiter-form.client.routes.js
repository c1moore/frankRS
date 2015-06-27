'use strict';

angular.module('recruiter-form').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.
		state("recruiter-form", { 
			url:"/recruiter/form", 
			templateUrl:"modules/recruiter-form/views/recruiter-form.client.view.html" 
		});
	}
]);
