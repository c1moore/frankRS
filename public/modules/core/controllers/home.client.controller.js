'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		// Temporary data for buttons
		$scope.data = {
			buttons: [
				{name:"Button 1", description:"Description 1"},
				{name:"Button 2", description:"Description 2"},
				{name:"Button 3", description:"Description 3"},
				{name:"Button 4", description:"Description 4"}
			]
		};

		$scope.displayComments = true;
		$scope.buttonsGrid = "col-md-10"

		$scope.toggleComments = function(){
			$scope.displayComments = !$scope.displayComments;
			if ($scope.displayComments) {
				$scope.buttonsGrid = "col-md-10";
			}
			else if (!$scope.displayComments) {
				$scope.buttonsGrid = "col-md-12";
			}
		}
	}
]);