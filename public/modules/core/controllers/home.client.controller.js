'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$filter',
	function($scope, Authentication, $filter) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		//The users roles
		$scope.userRoles = ['recruiter'];

		// Temporary data for buttons
		$scope.data = {
			buttons: [
				{name:"Leaderboard", description:"Description 1", link:'/#!/leaderboard', roles:['recruiter','admin']},
				{name:"Invites", description:"Description 2", link:'/#!/invite', roles:['recruiter','admin']},
				{name:"Button 3", description:"Description 3", link:'#', roles:['admin']},
				{name:"Button 4", description:"Description 4", link:'#', roles:['admin']}
			],
			comments: ["Comment 1", "Comment 2"]
		};

		//changes button width based on the number of buttons the user can see
		$scope.buttonsWidth = 100/($filter('roles')($scope.data.buttons,$scope.userRoles)).length

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
