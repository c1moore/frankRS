'use strict';

angular.module('krewes').controller('SaveModalCtrl', ['$scope', '$modalInstance', 'data', '$timeout', 'usSpinnerService',
	function($scope, $modalInstance, data, $timeout, usSpinnerService) {
		$scope.status = data.statusMessage;
		$scope.loading = data.loading;
		$scope.error = data.errorSaving;
		$scope.spinnerOpts = {
			lines: 		11,
			length: 	12,
			width: 		5,
			radius: 	14,
			corners: 	0.5,
			opacity: 	0.05,
			shadow: 	true,
			color: 		[
				'#73c92d',
				'#f7b518',
				'#c54e80'
			]
		};

		$scope.$watch(function() {
			return data.loading;
		}, function() {
			if(data.loading === false) {
				// If done loading, close the modal in 5 seconds.
				$timeout(function() {
					$modalInstance.close();
				}, 5000);
			}
		});

		$scope.$watch(function() {
			return data.statusMessage;
		}, function() {
			$scope.status = data.statusMessage;
			$scope.loading = data.loading;
			$scope.error = data.errorSaving;
		});
	}
]);