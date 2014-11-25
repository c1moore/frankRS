angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http',
	function($scope, ngTableParams, $http) {
            $scope.newCandidate = {
                  events: []
            }
      	$scope.candidates = [];
            $scope.selectEvents = [];
            $scope.selectSettings = {
                  smartButtonMaxItems: 3,
                  externalIdProp: 'event_id',
                  idProp: 'event_id',
                  displayProp: 'label'
            };

            $http.get('/events/enumerateAll').success(function(data) {
                  //formats the event data for the multiselect directive
                  for (var i=0;i<data.length;i++) {
                        $scope.selectEvents.push({label:data[i].name, event_id:data[i]._id});
                  }
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

            $scope.addCandidate = function() {
                  $scope.newCandidate.status = "volunteer";
                  $http.post('/candidate/setCandidate',$scope.newCandidate).success(function() {
                        console.log("Candidate created");
                        $scope.candidates.push($scope.newCandidate);
                  }).error(function(error) {
                        console.log(error);
                  });

                  $scope.newCandidate = {
                        events: []
                  };
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
