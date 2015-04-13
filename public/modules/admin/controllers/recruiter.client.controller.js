'use strict';

angular.module('admin').controller('recruitersController', ['$scope', 'ngTableParams', '$http', '$timeout', '$filter',
	function($scope, ngTableParams, $http, $filter) {
		$scope.recruiters = [];

		var getRecruiters = function() {
			$http.
		};
		getRecruiters();

		$scope.recruiterTableParams = new ngTableParams({
			page: 	1,
			count: 	5,
			filter: {
				name: 	''
			},
			sorting: {
				name: 	'asc'
			}
		}, {
			getData: function($defer, params) {
				var filteredData = params.filter() ? $filter('filter')($scope.recruiters, params.filter()) : $scope.recruiters;
				var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.recruiters;

				params.total(orderedData.length);
				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			}
		});
	}
]);