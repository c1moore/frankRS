angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http',
	function($scope, ngTableParams, $http) {
      	$scope.candidates = [];

            $scope.getCandidates = function() {
                  $http.post('/candidate/getCandidates').success(function(data) {
                        $scope.candidates = [];
                        $scope.candidates = data;
                  }).error(function(error) {
                        console.log(error)
                  });
            }

            $scope.getCandidates();

            $scope.addCandidate = function(newCandidate) {
                  
            }

            $scope.$watch("candidates", function() {
                  $scope.tableParams.reload();
            });

            $scope.tableParams = new ngTableParams({
            	page: 1,
            	count: 10,
            	}, {
            	getData: function($defer, params) {
            		$defer.resolve($scope.candidates.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            	}
            });
  }])
