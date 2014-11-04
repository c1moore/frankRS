'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		// Temporary data for buttons
		$scope.data = {
			buttons: [
				{name:"leaderboard", description:"Description 1", link:'/#!/leaderboard'},
				{name:"Button 2", description:"Description 2", link:'#'},
				{name:"Button 3", description:"Description 3", link:'#'},
				{name:"Button 4", description:"Description 4", link:'#'}
			],
			comments: ["Comment 1", "Comment 2"]
		};

		$scope.displayComments = true;
		$scope.buttonsGrid = "col-md-10";

		$scope.toggleComments = function(){
			$scope.displayComments = !$scope.displayComments;
			if ($scope.displayComments) {
				$scope.buttonsGrid = "col-md-10";
			}
			else if (!$scope.displayComments) {
				$scope.buttonsGrid = "col-md-12";
			}
		};

		$scope.showComments = function() {
			if (comments.length === 0) {
				return "No users";
			}
		};
	}
]);
