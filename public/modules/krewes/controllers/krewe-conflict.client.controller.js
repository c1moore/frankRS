'use strict';

angular.module('krewes').controller('ConflictModalCtrl', ['$scope', '$modalInstance', 'message', 'serverKrewe', 'localKrewe', 'memberIndex', 'kreweDeleted', 'conflictIndicators', 'frankInterests',
	function($scope, $modalInstance, message, serverKrewe, localKrewe, memberIndex, kreweDeleted, conflictIndicators, frankInterests) {
		$scope.message			= message;
		$scope.serverKrewe		= serverKrewe;
		$scope.localKrewe		= localKrewe;
		$scope.kreweDeleted		= kreweDeleted;
		$scope.interestsSource 	= frankInterests.interests;

		$scope.serverMemberIndex	= memberIndex.server;
		$scope.localMemberIndex		= memberIndex.local;

		$scope.nameConflict 	= conflictIndicators.name;
		$scope.kaptainConflict 	= conflictIndicators.kaptain;
		$scope.memberConflict 	= conflictIndicators.member;

		$scope.closeModal = function(selection) {
			$modalInstance.close(parseInt(selection, 10));
		};
	}
]);