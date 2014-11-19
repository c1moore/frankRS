'use strict'; // :)

angular.module('invites').controller('invitesCtrl', ['$scope', 'Authentication', '$location', 'eventSelector',
	function($scope, Authentication, $location, eventSelector) {
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
		}

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
