'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$filter', 'eventSelector',
	function($scope, Authentication, Menus, $filter, eventSelector) {
		$scope.authentication = Authentication;
		$scope.userRoles = ['recruiter','admin'];
		$scope.leaderboardRoles = ['recruiter','admin'];
		$scope.inviteRoles = ['recruiter','admin'];
		$scope.memoRoles = ['recruiter','admin','attendee'];
		$scope.eventsRoles = ['attendee','recruiter'];
		$scope.adminRoles = ['admin'];
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');
		$scope.eventSelector = eventSelector;

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.hideLink = function(rolesNeeded) {
			if (!$scope.authentication.user) {
				return true;
			}
			else if (($filter('roles')($scope.authentication.user.roles,rolesNeeded)).length === 0) {
				return true;
			}
			else {
				return false;
			}
		};
	}
]);