angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http', 'eventSelector',
	function($scope, ngTableParams, $http, eventSelector) {
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

            $scope.selectedEvent = eventSelector.selectedEvent;

            //updated the selected event from the event selector service
            $scope.$watch( function() {return eventSelector.selectedEvent},
                  function(selectedEvent) {
                        $scope.selectedEvent = selectedEvent;
                        $scope.getCandidates();
                  }
            );

            $http.get('/events/enumerateAll').success(function(data) {
                  //formats the event data for the multiselect directive
                  for (var i=0;i<data.length;i++) {
                        $scope.selectEvents.push({label:data[i].name, event_id:data[i]._id});
                  }
            });

            $scope.getCandidates = function() {
                  $http.post('/candidate/getCandidatesByEvent', {event_id:eventSelector.postEventId}).success(function(data) {
                        $scope.candidates = [];
                        $scope.candidates = data;
                  }).error(function(error) {
                        console.log(error)
                  });
            }

            $scope.getCandidates();

            $scope.addCandidate = function(newCandidate) {
                  if($scope.newCandidateEvents.length > 0) {
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
                  $scope.candidateForm.$setPristine(true);
                  $scope.newCandidate = {};
                  $scope.newCanidateEvents = [];
            }

            $scope.acceptCandidate = function(candidate) {
                  $http.post('/candidate/setAccepted').success(function() {

                  })
            }

            $scope.$watch("candidates", function() {
                  $scope.tableParams.reload();
            });

            $scope.tableParams = new ngTableParams({
            	page: 1,
            	count: 5,
            	}, {
            	getData: function($defer, params) {
                        params.total($scope.candidates.length);
            		$defer.resolve($scope.candidates.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            	}
            });
  }])
