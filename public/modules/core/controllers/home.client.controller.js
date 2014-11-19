'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$filter', '$location', 'eventSelector',
	function($scope, Authentication, $filter, $location, eventSelector) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		/*
		* If the user is not logged in they should be sent directly to
		* the login page.  Only authorized users should see this page.
		*/
		if(!$scope.authentication.user) {
			$location.path('/signin');
			return;
		}

		if(eventSelector.nresDisabled) {
			eventSelector.toggleDisabledEvents();
		}

		/*
		* Save the user roles so we can determine the proper buttons to
		* display to the user.
		*/
		$scope.userRoles = $scope.authentication.user.roles;

		//$scope.userRoles = ['recruiter'];

		// Temporary data for buttons
		$scope.data = {
			buttons: [
				{name:"Admin Page", description:"Description 3", link:'#', roles:['admin']},
				{name:"Leaderboard", description:"Description 1", link:'/#!/leaderboard', roles:['recruiter','admin']},
				{name:"Invites", description:"Description 2", link:'/#!/invite', roles:['recruiter','admin']},
				{name:"Volunteer to be a Recruiter", description:"Description 4", link:'#', roles:['admin', 'recruiter', 'attendee']}
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
