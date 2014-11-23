angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams',
	function($scope, ngTableParams) {
      	$scope.candidates = [
                  {fName: 'Dom', lName: 'Nostra'} 
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
            		$defer.resolve($scope.candidates.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            	}
            });

            $scope.addCandidate = function(newCandidate) {
                  $scope.candidates.push(newCandidate);
                  $scope.tableParams.reload();
            }

  }])
