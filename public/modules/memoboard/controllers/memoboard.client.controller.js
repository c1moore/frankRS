'use strict';

angular.module('memoboard').controller('memoboardCtrl', ['$scope', 'Authentication', 'eventSelector', '$http', '$timeout', '$window', '$interval',
	function($scope, Authentication, eventSelector, $http, $timeout, $window, $interval) {
		$scope.authentication = Authentication;
		/*
		* If the user is not logged in, they should be redirected to the sigin page.
		*/
		if(!$scope.authentication.user) {
			$location.path('/signin');
		}


		$scope.editorExpanded = true;

		$scope.removable = function(user_id) {
			if(_.intersection($scope.authentication.user.roles, ['admin']).length === 1)
				return true;
			else {
				if(user_id.toString() === $scope.authentication.user._id.toString())
					return true;
			}

			return false;
		};

		$scope.toHumanReadable = function(time) {
			var date = new Date(parseInt(time));

			return date.toLocaleDateString() + " " + date.toLocaleTimeString();
		};

		$scope.getComments = function() {
			if(eventSelector.postEventId) {
				$http.post('/comments/getSocialCommentsForEvent', {event_id : eventSelector.postEventId}).success(function(response) {
					$scope.comments = response;
				}).error(function(response, status) {
					if(status === 401) {
						$location.path('/');
					} else {
						$window.alert(response.message);
					}
				});
			}
		};

		//Get comments when the page is first loaded.
		$timeout($scope.getComments);

		//Watch for changes in the selected event and update the comments accordingly.
		$scope.$watch(function() {
			return eventSelector.selectedEvent;
		}, $scope.getComments);

		//Update comments every 1 minute.
		$interval($scope.getComments(), 60000);

	}
]);