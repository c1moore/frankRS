'use strict';

angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', '$window', '$location', 'usSpinnerService', '$timeout',
	function($scope, ngTableParams, $http, eventSelector, $filter, $window, $location, usSpinnerService, $timeout) {
		$scope.newCandidateEvents = [];
		$scope.candidates = [];
		$scope.selectEvents = [];
		$scope.statusIsOpen = false;		//Whether the dropdown menu for the status is open.
		$scope.candidateStatuses = ['volunteer', 'invited', 'accepted'];

		var rowUpdated = false;				//Keep track of whether data was actually changed.

		/**
		* Since the name field has multiple fields, ng-blur will not suffice.  This allows
		* the user to edit both the first name and last name before changing back to just
		* displaying the first and last name.
		*/
		$scope.$edit = {};
		$scope.$edit.lName = false;
		$scope.$edit.fName = false;
		$scope.$edit.row = -1;
		$scope.$watch('$edit.lName', function() {
			$timeout(function() {
				if(!$scope.$edit.lName && !$scope.$edit.fName && $scope.$edit.row >= 0) {
					$scope.$data[$scope.$edit.row].$edit.name = false;
					$scope.updateCandidate($scope.$data[$scope.$edit.row]._id, 'name');
				}
			}, 100);
		});
		$scope.$watch('$edit.fName', function() {
			$timeout(function() {
				if(!$scope.$edit.lName && !$scope.$edit.fName && $scope.$edit.row >= 0) {
					$scope.$data[$scope.$edit.row].$edit.name = false;
					$scope.updateCandidate($scope.$data[$scope.$edit.row]._id, 'name');
				}
			}, 100);
		});
		
		//settings for the multi select directive in form to create new candidate
		$scope.selectSettings = {
			smartButtonMaxItems: 3,
			//the name of the object field sent to the newCanidateEvents array
			externalIdProp: 'event_id',
			idProp: 'event_id',
			displayProp: 'label'
		};

		//Settings for multiselect directive in the table of candidates
		$scope.tableMsSettings = {
			smartButtonMaxItems: 1,
			externalIdProp: 'label',
			idProp: 'label',
			displayProp: 'label'
		};

		//updated the selected event from the event selector service
		$scope.$watch(
			function() {
				return eventSelector.selectedEvent;
			},
			function(selectedEvent) {
				$scope.isEventSelected = eventSelector.postEventId ? true : false;

				if($scope.isEventSelected) {
					$scope.selectedEvent = eventSelector.selectedEvent;
					$scope.selectedEvent = selectedEvent;
					$scope.getCandidates();
				}
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

				rowUpdated = false;
			}).error(function(error) {
				//Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
				$timeout(function() {
					$scope.getCandidates();
				}, 5000);
			});
		};

		$scope.addCandidate = function(newCandidate) {
			if($scope.newCandidateEvents.length > 0) {
				newCandidate.events = [];
				for (var i = 0; i < $scope.newCandidateEvents.length; i++) {
					newCandidate.events.push($scope.newCandidateEvents[i].event_id);
				}

				$http.post('/candidate/setCandidate',newCandidate).success(function() {
					//Refresh table view
					$scope.getCandidates();

					//Reset the form
					$scope.candidateForm.$setPristine(true);
					$scope.newCandidate = {};
					$scope.newCanidateEvents = [];
				}).error(function(res) {
					//Warn the user.
					$window.alert("Oops, something bad happened.  We couldn't save the new candidate.  Please make sure all fields are correct and try again.\n\nError: " + res.message);
				});
			}
		};

		$scope.acceptCandidate = function(candidate) {
			var postObject = {candidate_id:candidate._id, event_id:eventSelector.postEventId, accepted:true};
			$http.post('/candidate/setAccepted',postObject).success(function() {
				//refresh table view
				$scope.getCandidates();
			}).error(function(res) {
				//Warn the user.
				$window.alert("Candidate not updated.  Please try again.\n\n" + res.message);
				
				//Refresh table view
				$scope.getCandidates();
			});
		};

		$scope.denyCandidate = function(candidate) {
			$http.post('/candidate/deleteCandidate/event',{candidate_id:candidate._id, event_id:eventSelector.postEventId}).success(function() {
				//refresh table view
				$scope.getCandidates();
			}).error(function(res) {
				//Warn the user.
				$window.alert("Candidate not updated.  Please try again.\n\nError: " + res.message);
				
				//Refresh table view
				$scope.getCandidates();
			});
		};

		//this updates the table when the candidates variable is changed
		$scope.$watch("candidates", function() {
			$timeout(function() {
				$scope.tableParams.reload();
			});
		});

		$scope.tableParams = new ngTableParams({
				page: 1,
				count: 10,
				filter: {
					fName:''
				},
				sorting: {
					fName:'asc'
				}
			}, {
				getData: function($defer, params) {
					var filteredData = params.filter() ? $filter('filter')($scope.candidates, params.filter()) : $scope.candidates;
					var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.candidates;
			
					params.total(orderedData.length);
			
					$scope.$data = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
					$defer.resolve($scope.$data);
				}
			}
		);

		/**
		* This is the logic for sending an email to a candidate.  Instead of having one array with
		* an object that has the keys email and id, two separate arrays will be used to simplify the
		* HTML code.  For security reasons, the candidate ids will be passed to the backend, not
		* their email addresses.
		*/
		$scope.selected = {};
		$scope.selected.emails = [];
		$scope.selected.ids = [];
		$scope.email = {};
		$scope.email.errmess = [];
		$scope.sending = false;
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
				$scope.sending = true;
				usSpinnerService.spin('spinner-2');

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
					$scope.selectedCandidates = [];
						
					$window.alert("Emails sent!");

					usSpinnerService.stop('spinner-2');
					$scope.sending = false;
				}).error(function(response, status) {
					$window.alert("There was an error sending the message.  Please try again later.\n\nError: " + response);
						
					usSpinnerService.stop('spinner-2');
					$scope.sending = false;
				});
			}
		};

		$scope.$watch('$data', function() {
			//Only mark as modified if there actually is data in the table.
			if($scope.$data && $scope.$data.length > 0) {
				rowUpdated = true;
			}
		});

		$scope.updateCandidate = function(id, field) {
			if(rowUpdated) {
				var index = -1;
				for(var i = 0; i < $scope.$data.length; i++) {
					if($scope.$data[i]._id === id)
						index = i;
				}

				if(index !== -1) {
					if(field === 'name') {
						$http.post("/candidate/setfName", {fName : $scope.$data[index].fName, candidate_id : $scope.$data[index]._id}).success(function() {
							$scope.getCandidates();
						}).error(function(res) {
							$scope.getCandidates();

							$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s name.\n\nError: " + res);
						});

						$http.post("/candidate/setlName", {lName : $scope.$data[index].lName, candidate_id : $scope.$data[index]._id}).success(function() {
							$scope.getCandidates();
						}).error(function(res) {
							$scope.getCandidates();

							$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s name.\n\nError: " + res);
						});
					} else {
						var address = "/candidate/set" + field;
						var data = {};

						data[field.toLowerCase()] = $scope.$data[index][field.toLowerCase()];
						data.candidate_id = $scope.$data[index]._id;

						$http.post(address, data).success(function() {
							$scope.getCandidates();
						}).error(function(res) {
							$scope.getCandidates();

							$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s record.\n\nError: " + res);
						});
					}
				} else {
					$scope.getCandidates();

					$window.alert("Candidate could not be found.  Refresh the page and try again.");
				}
			}
		};
	}
]);
