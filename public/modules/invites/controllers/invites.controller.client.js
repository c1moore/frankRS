'use strict'; // :)

angular.module('invites').controller('invitesCtrl', ['$scope', 'Authentication', '$location', 'eventSelector', '$http', '$window',
	function($scope, Authentication, $location, eventSelector, $http, $window) {
		$scope.authentication = Authentication;

		/*
		* If the user is not logged in, they should be redirected to the sigin page.  If the
		* user is logged in, but does not have the proper permissions they should be
		* redirected to the homepage.
		*/
		if(!$scope.authentication.user) {
		  $location.path('/signin');
		} else if(!(_.intersection($scope.authentication.user.roles, ['recruiter', 'admin']).length)) {
		  $location.path('/');
		}
		
		if(!eventSelector.nresDisabled) {
			eventSelector.toggleDisabledEvents();
			if(!eventSelector.recruiterEvent) {
				angular.element("#invitation-submit-button").addClass("disabled");
				angular.element("#invitation-preview-button").addClass("disabled");
			}
		}

		$scope.recruiter_email = $scope.authentication.user.email;

		$scope.invite = {};
		$scope.invite.event_name = eventSelector.selectedEvent;
		$scope.invite.event_id = eventSelector.postEventId;

		$scope.$watch (
			function() {
				return eventSelector.selectedEvent;
			},
			function() {
				angular.element("#invitation-submit-button").removeClass("disabled");
				angular.element("#invitation-preview-button").removeClass("disabled");
				$scope.invite.event_name = eventSelector.selectedEvent;
			}
		);

		$scope.$watch (
			function() {
				return eventSelector.postEventId;
			},
			function() {
				$scope.invite.event_id = eventSelector.postEventId;
				getSideTables();
			}
		);

		$scope.send = function() {
			angular.element("#invitation-submit-button").addClass("disabled");
			$http.post('/invitation/send', $scope.invite).success(function(response) {
				$window.alert(response.message);

				//Set all form fields to blank so the user can send another invitation.
				$scope.invite.fName = "";
				$scope.invite.lName = "";
				$scope.invite.email = "";
				$scope.invite.message = "";

				angular.element("#invitation-submit-button").removeClass("disabled");

				getSideTables();
			}).error(function(response) {
				$window.alert(response.message);
				console.log(response.message);

				angular.element("#invitation-submit-button").removeClass("disabled");
			});
		};

	/*
	* Sidebar controllers
	*/

	$scope.firstSelected = true;
	$scope.attendees = {}, $scope.attendees.list = [];
	$scope.invitees = {}, $scope.invitees.list = [];
	$scope.almosts = {}, $scope.almosts.list = [];

	var getSideTables = function() {
		if($scope.invite.event_id) {
			var request = {event_id : $scope.invite.event_id};
			$http.post('/recruiter/attendees', request).success(function(response) {
				$scope.attendees.list = response;
				$scope.attendees.error = '';
			}).error(function(response, status) {
				$scope.attendees.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signing');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.attendees.error = "Looks like nobody you invited has accepted your request.  Keep trying, eventually you'll find the right people.";
				}
			});
			
			$http.post('/recruiter/invitees', request).success(function(response) {
				$scope.invitees.list = response;
				$scope.invitees.error = '';
			}).error(function(response, status) {
				$scope.invitees.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signing');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.invitees.error = "How will anybody have be able to enjoy {{$scope.invite.event_name}} without wonderful people like you inviting them?  You should invite more people.";
				}
			});

			$http.post('/recruiter/almosts', request).success(function(response) {
				$scope.almosts.list = response;
				$scope.almosts.error = '';
			}).error(function(response, status) {
				$scope.almosts.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signing');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.almosts.error = "Nobody has chosen somebody else's invitation over your invitation.  Looks like somebody is popular.";
				}
			});
		} else {
			console.log("No sending blank requests.");
		}
	};

	getSideTables();


	/*$scope.friends = [{name:'Dom',email:'dom@hotmail.com'},
	  {name:'Dan', email:'dan@gmail.com'},
	  {name:'Dalton', email:'dalton@gmail.com'},
	  {name:'Calvin', email:'calvin@gmail.com'},
	  {name:'James', email:'james@gmail.com'},
	  {name:'James', email:'james@gmail.com'}];
	$scope.attendingLimit = 5;
	$scope.invites = [{name:'Dom',email:'dom@gmail.com'},
	  {name:'Dan', email:'dan@gmail.com'},
	  {name:'Dalton', email:'dalton@gmail.com'},
	  {name:'Calvin', email:'calvin@gmail.com'},
	  {name:'James', email:'james@gmail.com'},
	  {name:'James', email:'james@gmail.com'},
	  {name:'Dom',email:'dom@gmail.com'},
	  {name:'Dan', email:'dan@gmail.com'},
	  {name:'Dalton', email:'dalton@gmail.com'},
	  {name:'Calvin', email:'calvin@gmail.com'},
	  {name:'James', email:'james@gmail.com'},
	  {name:'James', email:'james@gmail.com'}];
	$scope.inviteLimit = 5;
	$scope.livepreview = false;*/

  }
]);
