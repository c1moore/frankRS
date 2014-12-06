angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http',
	function($scope, ngTableParams, $http) {
            $scope.newCandidateEvents = [];
      	$scope.candidates = [];
            $scope.selectEvents = [];
            //settings for the multi select directive
            $scope.selectSettings = {
                  smartButtonMaxItems: 3,
                  //the name of the object field sent to the newCanidateEvents array
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

            $scope.addCandidate = function(newCandidate) {
                  if($scope.newCandidateEvents.length > 0) {
                        newCandidate.note = "stuff";
                        newCandidate.events = [];
                        for (var i = 0; i < $scope.newCandidateEvents.length; i++) {
                              newCandidate.events.push($scope.newCandidateEvents[i].event_id);
                        }

                        $http.post('/candidate/setCandidate',newCandidate).success(function() {
                              console.log("Candidate created");
                              $scope.getCandidates();
                        }).error(function(error) {
                              console.log(error);
                        });
                  }

                  $scope.newCandidate = {};
                  $scope.newCanidateEvents = [];
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
