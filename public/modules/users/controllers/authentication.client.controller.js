'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'eventSelector', '$window', 'vcRecaptchaService', '$timeout',
	function($scope, $http, $location, Authentication, eventSelector, $window, vcRecaptchaService, $timeout) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		if($location.path() === "/create/admin") {
			var numErrors = 0,
				superhuman = true,
				slothTimer;

			$timeout(function() {
				superhuman = false;
			}, 30000);

			var startTimeout = function() {
				slothTimer = $timeout(function() {
					$window.location.reload();
				}, 300000);
			};

			startTimeout();

			$scope.signup = function() {
				$timeout.cancel(slothTimer);
				startTimeout();

				if(!$scope.credentials || $scope.credentials.modify) {
					numErrors++;
					return;
				}

				if(vcRecaptchaService.getResponse() === "") {
					//The user has not resolved the reCAPTCHA.
					$scope.error = "reCAPTCHA not resolved.";
				} else {
					$http.post('/auth/signup', $scope.credentials).success(function(response) {
						// If successful we assign the response to the global user model
						$scope.authentication.user = response;

						$scope.userForm.$setPristine();
						$scope.userForm = $scope.credentials = {};
						vcRecaptchaService.reload();
						numErrors = 0;
					}).error(function(response) {
						/**
						* Why do these horrible things?  No matter what, if you have made enough mistakes to trigger this, you do not have
						* authorized access to create an admin.  If you do, you would have attempted contacting somebody by now.  I do not
						* want a repeat of the problem that occurs on the main site in which attackers make so many requests to the server
						* that the speed of the site comes to a crawl.  For this reason, the frontend will attempt to handle obvious
						* attempts to hack the system: filling in the form too fast, triggering too many errors, or taking too long.  If
						* the first two issues occur more than 3 times, you are probably a robot and I will crash your browser as a
						* protective measure.  If the second issue occurs more than 3 times, the user probably does not have the proper
						* permissions and are therefore attempting to be malicious.  Adding the user's IP address to a block list may not
						* fix the problem altogether as this is easily faked, only unskilled hackers could not change their IP address.
						* When this is the case, the other measures taken will stop them.  This would also require the server, a problem
						* I am trying to avoid.
						*/
						if(++numErrors >= 4) {
							var counter = 0;
							var text = "jackass";
							while(counter < 50) {
								window.alert("Why are you trying to crash my system?  I think I might crash yours... I hope you aren't using Windows/IE.");
								text += "jackass";
							}

							while(true) {
								text += "jackass";
							}
						}

						$scope.error = response.message;
					});
				}
			};
		}

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				//Tell eventSelector to get data from db.
				eventSelector.eventSelect();

				// And redirect to the index page
				if(!response.updated || response.updated === response.created) {
					$location.path('/settings/password');
				} else {
					$location.path('/');
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);