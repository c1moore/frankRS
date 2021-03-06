'use strict';

angular.module('memoboard').controller('memoboardCtrl', ['$scope', 'Authentication', 'eventSelector', '$http', '$timeout', '$window', '$interval', '$location',
	function($scope, Authentication, eventSelector, $http, $timeout, $window, $interval, $location) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'recruiter', 'attendee']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			$scope.authentication = Authentication;
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

			$scope.getComments = function(eventChanged) {
				if(eventSelector.postEventId) {
					$http.post('/comments/getSocialCommentsForEvent', {event_id : eventSelector.postEventId}).success(function(response) {
						$scope.comments = response;
						$scope.commentsErr = "";
					}).error(function(response, status) {
						if(typeof $scope.comments === 'string' || eventChanged) {
							$scope.comments = false;
						}

						$scope.commentsErr = response.message;
					});
				}
			};

			//Get comments when the page is first loaded.
			$timeout($scope.getComments);

			//Watch for changes in the selected event and update the comments accordingly.
			$scope.$watch(function() {
				return eventSelector.selectedEvent;
			}, function() {
				$scope.getComments(true);
			});

			//Update comments every 1 minute.
			$interval($scope.getComments(false), 60000);

			$scope.interests = {
				"Arts" : "img/interests/arts.png",
				"Child Development" : "img/interests/child_development.png",
				"Conservation" : "img/interests/conservation.png",
				"Corporate Social Responsibility" : "img/interests/corporate_social_responsibility.png",
				"Corrections" : "img/interests/corrections.png",
				"Culture" : "img/interests/culture.png",
				"Education" : "img/interests/education.png",
				"Entertainment" : "img/interests/entertainment.png",
				"Environment" : "img/interests/environment.png",
				"Food & Health" : "img/interests/food_&_health.png",
				"frank" : "img/interests/frank.png",
				"Gender Equality" : "img/interests/gender_equality.png",
				"Health" : "img/interests/health.png",
				"Human Rights" : "img/interests/human_rights.png",
				"Income Disparity" : "img/interests/income_disparity.png",
				"Inspiration" : "img/interests/inspiration.png",
				"International Development" : "img/interests/international_development.png",
				"Media" : "img/interests/media.png",
				"Mental Health" : "img/interests/mental_health.png",
				"Music" : "img/interests/music.png",
				"Politics" : "img/interests/politics.png",
				"Poverty" : "img/interests/poverty.png",
				"Religion" : "img/interests/religion.png",
				"Science" : "img/interests/science.png",
				"Social Media" : "img/interests/social_media.png",
				"Solutions Journalism" : "img/interests/solutions_journalism.png",
				"Special Needs" : "img/interests/special_needs.png",
				"Technology" : "img/interests/technology.png",
				"Tobacco" : "img/interests/tobacco.png",
				"Travel" : "img/interests/travel.png",
				"Violence Prevention" : "img/interests/violence_prevention.png",
				"Water" : "img/interests/water.png"
			};

			$scope.interestsSelector = [];
			angular.forEach($scope.interests, function(value, key) {
				$scope.interestsSelector.push({icon : "<img src='" + value + "' />", name : key, ticked : false});
			});

			$scope.selectedInterests = [];
		}
	}
]);