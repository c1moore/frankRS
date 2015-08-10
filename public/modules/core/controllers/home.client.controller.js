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
		} else {
			/*
			* Save the user roles so we can determine the proper buttons to
			* display to the user.
			*/
			$scope.userRoles = $scope.authentication.user.roles;

			//$scope.userRoles = ['recruiter'];

			// Temporary data for buttons
			$scope.data = {
				buttons: [
					{name:"Admin Page", description:"A place where admins can fulfill their fantasies of being all-powerful.", link:'/#!/admin', roles:['admin'], image: "/modules/core/img/icons/admin.png"},
					{name:"Control Room", description:"Send out your invitations and see your invitation stats.", link:'/#!/invite', roles:['recruiter','admin'], image: "/modules/core/img/icons/invites.png"},
					{name:"Leaderboard", description:"See how your friends and competitors rank against you.", link:'/#!/leaderboard', roles:['recruiter','admin'], image: "/modules/core/img/icons/leaderboard.png"},
					{name:"frank Lounge", description:"Take a look at what people are saying about the events you are attending and weigh in on the chatter.", link:'/#!/franklounge', roles:['admin', 'recruiter', 'attendee'], image: "/modules/core/img/icons/frank_lounge.png"},
					{name:"Recruiter Registration", description:"Think you got what it takes to be a recruiter for frank?  Then sign up here.  Warning: we only accept the best.", link:'/#!/events', roles:['recruiter', 'attendee'], titleId:"recruiter-request-button-title", image: "/modules/core/img/icons/recruiter_registration.png"},
					{name:"Register", description:"Register to attend frank 2016.", link:'https://frank2016.eventbrite.com/', roles:['recruiter', 'admin'], image: "/modules/core/img/icons/register.png", newTab : true}
				]
				/*,
				comments: ["Comment 1", "Comment 2"]
				*/
			};

			//changes button width based on the number of buttons the user can see
			/*$scope.buttonsWidth = 100/($filter('roles')($scope.data.buttons,$scope.userRoles)).length;*/

			/*$scope.displayComments = true;*/
			/*$scope.buttonsGrid = "col-md-10";*/

			/*$scope.toggleComments = function(){
				$scope.displayComments = !$scope.displayComments;
				if ($scope.displayComments) {
					$scope.buttonsGrid = "col-md-10";
				}
				else if (!$scope.displayComments) {
					$scope.buttonsGrid = "col-md-12";
				}
			};*/

			/*$scope.showComments = function() {
				if (comments.length === 0) {
					return "No users";
				}
			};*/
		}
	}
]);
