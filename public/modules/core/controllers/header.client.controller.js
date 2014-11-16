'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$filter',
	function($scope, Authentication, Menus, $filter) {
		$scope.authentication = Authentication;
		$scope.userRoles = ['recruiter','admin'];
		$scope.leaderboardRoles = ['recruiter','admin'];
		$scope.inviteRoles = ['recruiter','admin'];
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.hideLink = function(rolesNeeded) {
			if (($filter('roles')($scope.userRoles,rolesNeeded)).length == 0) {
				return true
			}
			else {
				return false
			}
		};
	}
]);