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
		$scope.kreweRoles = ['admin', 'kreweAdmin'];
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

		/**
		* Returns true if the menu item should not be on the menu based on the roles required for the page.
		* 
		* @param rolesNeeded (array, string) - if an array, the array should contain strings of the required
		* roles.  If a string, a single comma (',') should be used to separate roles.  Accepted strings
		* include:
		*		- "admin"		- admin roles required
		*		- "recruiter"	- recruiter role required
		*		- "attendee"	- attendee role required
		*		- "*"			- any of the above roles.  If specified, it MUST be the only specified role.
		*/
		$scope.hideLink = function(rolesNeeded) {
			if (!$scope.authentication.user) {
				return true;
			}

			if(typeof rolesNeeded === 'string') {
				if(rolesNeeded === '*') {
					return false;
				} else {
					rolesNeeded = rolesNeeded.split(',');
				}
			} else if(rolesNeeded[0] === '*') {
				return false;
			}
			
			if (($filter('roles')($scope.authentication.user.roles,rolesNeeded)).length === 0) {
				return true;
			} else {
				return false;
			}
		};
	}
]);