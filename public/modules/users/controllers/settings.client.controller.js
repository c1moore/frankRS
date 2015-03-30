'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				for(var i = 0; i < $scope.user.interests.length; i++) {
					$scope.user.interests[i] = $scope.user.interests[i].name;
				}

				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

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
			if(_.intersection($scope.user.interests, [key]).length) {
				$scope.interestsSelector.push({icon : "<img src='" + value + "' />", name : key, ticked : true});
			} else {
				$scope.interestsSelector.push({icon : "<img src='" + value + "' />", name : key, ticked : false});
			}
		});
	}
]);
