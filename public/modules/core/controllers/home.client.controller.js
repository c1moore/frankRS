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
				{name:"Admin Page", description:"A place where admins can fulfill their fantasies of being all-powerful.", link:'/#!/admin', roles:['admin'], image: "http://i.imgur.com/L12IQ3m.jpg"},
				{name:"Control Room", description:"Send out your invitations and see your invitation stats.", link:'/#!/invite', roles:['recruiter','admin'], image: "http://frank.jou.ufl.edu/recruiters/Pictures/but3.jpg"},
				{name:"Leaderboard", description:"See how your friends and competitors rank against you.", link:'/#!/leaderboard', roles:['recruiter','admin'], image: "http://frank.jou.ufl.edu/recruiters/Pictures/but4.jpg"},
				{name:"Memo Board", description:"Take a look at what people are saying about the events you are attending and weigh in on the chatter.", link:'/#!/memoboard', roles:['admin', 'recruiter', 'attendee'], image: "http://i.imgur.com/9UYHlAy.jpg"},
				{name:"Request to Become a Recruiter", description:"Think you got what it takes to be a recruiter for frank?  Then sign up here.  Warning: we only accept the best.", link:'#', roles:['recruiter', 'attendee'], titleId:"recruiter-request-button-title", image: "http://i.imgur.com/CSPFqYn.jpg"}
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
]);
