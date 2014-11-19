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
				eventSelector.selectedEvent = "Select Event";
				eventSelector.recruiterEvent = true;
				eventSelector.postEventId = null;
			}
		}

		$scope.recruiter_email = $scope.authentication.user.email;

		$scope.invite = new Object();
		$scope.invite.event_name = eventSelector.selectedEvent;
		$scope.invite.event_id = eventSelector.postEventId;

		$scope.send = function() {
			angular.element("#invitation-submit-button").addClass("disabled");
			$http.post('/invitation/send', $scope.invite).success(function(response) {
				$window.alert(response.message);

				//Set all form fields to blank so the user can send another invitation.
				$scope.fName = "";
				$scope.lName = "";
				$scope.email = "";
				$scope.message = "";

				//TODO: Refresh sidebars with new data after sending invitation.

				angular.element("#invitation-submit-button").removeClass("disabled");
			}).error(function(response) {
				console.log(response);
				$window.alert(response.message);
				angular.element("#invitation-submit-button").removeClass("disabled");
			});
		};

		$scope.friends = [{name:'Dom',email:'dom@hotmail.com'},
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
		$scope.livepreview = false;
  }
]);
