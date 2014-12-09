angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', '$window', '$location',
	function($scope, ngTableParams, $http, eventSelector, $filter, $window, $location) {
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

            $scope.isEventSelected = eventSelector.postEventId ? true : false;
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
                              //refresh table view
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
                  var postObject = {candidate_id:candidate._id, event_id:eventSelector.postEventId, accepted:true};
                  $http.post('/candidate/setAccepted',postObject).success(function() {
                        console.log("Candidate Accepted");
                        //refresh table view
                        $scope.getCandidates();
                  }).error(function(error) {
                        console.log(error);
                  });
            }

            $scope.denyCandidate = function(candidate) {
                  $http.post('/candidate/deleteCandidate/event',{candidate_id:candidate._id, event_id:eventSelector.postEventId}).success(function(){
                        console.log("Candidate Deleted");
                        //refresh table view
                        $scope.getCandidates();
                  }).error(function(error) {
                        console.log(error);
                  })
            }

            //this updates the table when the candidates variable is changed
            $scope.$watch("candidates", function() {
                  $scope.tableParams.reload();
            });

            $scope.tableParams = new ngTableParams({
            	page: 1,
            	count: 5,
                  filter: {
                        fName:''
                  },
                  sorting: {
                        fName:'asc'
                  }
            	}, {
            	getData: function($defer, params) {
                        var filteredData = params.filter() ?
                              $filter('filter')($scope.candidates, params.filter()) :
                              $scope.candidates;
                        var orderedData = params.sorting() ? 
                              $filter('orderBy')(filteredData, params.orderBy()) : 
                              $scope.candidates;
                        params.total(orderedData.length);
            		$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            	}
            });

            $scope.selected = {};
            $scope.selected.emails = [];
            $scope.selected.ids = [];
            $scope.email = {};
            $scope.email.errmess = [];
            $scope.setSelected = function(_id, email) {
                for(var i=0; i<$scope.selected.ids.length; i++) {
                    if($scope.selected.ids[i] === _id) {
                        $scope.selected.ids.splice(i, 1);
                        $scope.selected.emails.splice(i, 1);
                        return;
                    }
                }

                $scope.selected.ids.push(_id);
                $scope.selected.emails.push(email);
            };

            $scope.sendMessages = function() {
                $scope.email.error = false;
                $scope.email.errmess = [];

                if(!$scope.email.message) {
                    $scope.email.error = true;
                    $scope.email.errmess.push("Message is required.");
                }
                if(!$scope.selected.ids.length) {
                    $scope.email.error = true;
                    $scope.email.errmess.push("At least one recipient is required.");
                }

                if(!$scope.email.error) {
                    var body = {
                        candidate_ids : $scope.selected.ids,
                        subject : $scope.email.subject,
                        message : $scope.email.message
                    };
                    $http.post('/admin/send', body).success(function(response) {
                        $scope.selected = {};
                        $scope.selected.emails = [];
                        $scope.selected.ids = [];
                        $scope.email = {};
                        $scope.email.errmess = [];
                        
                        $window.alert("Emails sent!");
                    }).error(function(response, status) {
                        console.log(response.message);
                        if(status === 401) {
                            if(response.message === "User is not logged in.") {
                                $location.path('/signin');
                            } else {
                                $location.path('/');
                            }
                        } else if(status === 400) {
                            $window.alert("There was an error sending the message.  Please try again later.");
                        }
                    });
                }
            };
    }
]);
