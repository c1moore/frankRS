angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams',
	function($scope, ngTableParams) {
      	$scope.applications = [
                  {name: 'Nostra Dom'}, 
                  {name: 'Bob the Builder',},
                  {name: 'Clive',}
            ];

            $scope.addApplicant = function(index) {
            	$scope.applications.splice(index, 1);
            }

            $scope.removeApplicant = function(index) {
            	$scope.applications.splice(index, 1);
            }

            $scope.tableParams = new ngTableParams({
            	page: 1,
            	count: 10,
            	}, {
            	getData: function($defer, params) {
            		$defer.resolve($scope.applications.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            	}
            });

  }])
