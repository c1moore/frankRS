angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http',
	function($scope, ngTableParams, $http) {
      	$scope.candidates = [];
            $scope.events = [];

            $http.get('/events/enumerateAll').success(function(data) {
                  $scope.events = data;
            });

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
                  newCandidate.status = "volunteer";
                  $http.post('/candidate/setCandidate',newCandidate).success(function() {
                        console.log("Candidate created");
                        $scope.candidates.push(newCandidate);
                  }).error(function(error) {
                        console.log(error);
                  });
                  $scope.newCandidate = null;
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
