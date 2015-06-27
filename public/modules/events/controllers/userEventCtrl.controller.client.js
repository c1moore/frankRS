'use strict';

angular.module('events').controller('userEventCtrl', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', 'dialogs', 'Authentication', '$timeout', '$window', '$modal',
	function($scope, ngTableParams, $http, eventSelector, $filter, dialogs, Authentication, $timeout, $window, $modal) {
		$scope.user = Authentication;
		
		$scope.dpOpen = false;
		$scope.openDatepicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.dpOpen = true;
		};

		var getEvents = function() {
			$http.post('/events/user/allEvents').success(function(data) {
				$scope.events = [];
				$scope.events = data;

				for(var i=0; i < $scope.events.length; i++) {
					//This is what is searched when the user tries to filter the table.  Two different formats are used to increase chances of returning what the user wants: (day_of_week, Month day, Year) & (M/d/yyyy)
					$scope.events[i].date = $filter('date')($scope.events[i].start_date, "EEEE, MMMM d, yyyy") + " - " + $filter('date')($scope.events[i].end_date, "EEEE, MMMM d, yyyy") + " " + $filter('date')($scope.events[i].start_date, "M/d/yyyy") + " - " + $filter('date')($scope.events[i].end_date, "M/d/yyyy");

					$scope.events[i].start_date = $filter('date')($scope.events[i].start_date, "EEE, MMM d, yyyy");
					$scope.events[i].end_date = $filter('date')($scope.events[i].end_date, "EEE, MMM d, yyyy");
				}
			}).error(function(error) {
				//Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
				$timeout(function() {
					getEvents();
				}, 5000);
			});
		};
		getEvents();


	  	$scope.tableParams = new ngTableParams({
        	page: 1,
			count: 10,
			filter: {
			        name:''
			  },
			  sorting: {
			        name:'asc'
			  }
			}, {
			getData: function($defer, params) {
		        var filteredData = params.filter() ? $filter('filter')($scope.events, params.filter()) : $scope.events;
		        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.events;

		        if(orderedData) {
		        	params.total(orderedData.length);
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				} else {
					params.total(0);
					$defer.resolve(null);
				}
			}
        });

        $scope.$watch("events", function() {
        	$timeout(function() {
				$scope.tableParams.reload();
			});
		});

		/*$scope.launch = function(event) {
			dlg = dialogs.confirm("Confirmation Vital", "Are you absolutely sure you want to go through the rigorous tests we put forth to become a recruiter for " + event.name + "? <br /><br />(You obviously have the right stuff if you have access to this page.)", {windowClass : "frank-recruiter-signup-modal"});
			dlg.result.then(function(btn){
				$http.post("candidate/setCandidate", {event_id:event._id}).success(function() {
					getEvents();
				}).error(function(error) {
					$window.alert("There was an error submitting your request.  Please try again later.");
				});
			});
		};*/

		$scope.launch = function(event) {
			var modalInstance = $modal.open({
				templateUrl: 	"modules/events/views/recruiter-form.client.view.html",
				controller: 	"FormModalCtrl",
				backdrop: 		'static',
				keyboard: 		false,
				resolve: 		{
					event: 	function() {
						return event;
					}
				}
			});

			/**
			* The modal instance should return with either a truthy value.  If this value evaluates to
			* true, the table is updated.  Otherwise, the table will not be updated.
			*/
			modalInstance.result.then(function(answers) {
				if(answers) {
					getEvents();
				}
			});
		};

		$timeout(function() {$scope.launch($scope.events[0]);}, 5000);

		/**
		* Adopted from post made on stackoverflow.com by disfated.  Original post here:
		* http://stackoverflow.com/questions/2332811/capitalize-words-in-string
		*/
		$scope.capitalize = function(string, lower) {
			return (lower ? string.toLowerCase() : string).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		};
	}
]);

angular.module("events").controller("FormModalCtrl", ["$scope", "$modalInstance", "event", "usSpinnerService", "$http",
	function($scope, $modalInstance, event, usSpinnerService, $http) {
		$scope.event = event;
		$scope.answers = {};
		$scope.answers.reason = "";
		$scope.answers.connection = "";

		/**
		* 
		*/
		$http.post('/candidate/me').success(function(candidate, status) {
			if(status === 200) {
				if(candidate.note) {
					var startRegex = /\*\*\*\*\*\*\*\*\*\*/;
					var endRegex = /\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/;
					var reasonRegex = /\*\*\*Reason:/;
					var connRegex = /\*\*\*Connections:/;
					var skillsRegex = /\*\*\*Recruiter Skills:/;

					if(candidate.note.search(startRegex) !== -1) {
						var rindex = candidate.note.search(reasonRegex);
						if(rindex !== -1) {
							rindex += 11;		//Go to the start of the reason answer.
						}

						var cindex = candidate.note.search(connRegex);
						var rend;				//End of the reason answer.
						if(cindex !== -1) {
							rend = cindex - 2;
							cindex += 16;		//Go to the start of the connection answer.
						}

						var sindex = candidate.note.search(skillsRegex);
						var cend;
						if(sindex !== -1) {
							cend = sindex - 2;
							sindex += 21;
						}

						var send = candidate.note.search(endRegex);

						if(rindex !== -1 && cindex > rindex && send > sindex && sindex > cindex) {
							$scope.answers.reason = candidate.note.substring(rindex, rend);
							$scope.answers.connection = candidate.note.substring(cindex, cend);
						}
					}
				}
			}
		});

		$scope.spinnerOpts = {
			lines: 		11,
			length: 	12,
			width: 		5,
			radius: 	14,
			corners: 	.5,
			opacity: 	.05,
			shadow: 	true,
			color: 		['#73c92d', '#f7b518', '#C54E90']
		};

		$scope.sending = false;

		$scope.tabs = [];
		$scope.tabs[0] = true;
		$scope.tabs[1] = false;
		$scope.tabs[2] = false;
		$scope.tabs[3] = false;
		$scope.tabs[4] = false;
		$scope.selected = 0;

		$scope.next = function() {
			//Simply set the next tab to be active, do not increment $scope.selected as it will be incremented by bootstrap-ui.
			$scope.tabs[++$scope.selected] = true;
		};

		$scope.previous = function() {
			//Simply set the previous tab to be active, do not increment $scope.selected as it will be incremented by bootstrap-ui.
			$scope.tabs[--$scope.selected] = true;
		};

		/**
		* Send candidate information to the backend.  The candidate's answers will be placed in the note
		* field so an admin can look over them later.
		*/
		$scope.send = function() {
			usSpinnerService.spin('candidate-form-spinner-1');
			$scope.sending = true;
			$scope.next();

			var notes = "PLEASE DO NOT DELETE OR EDIT THIS SECTION:\n**********\n***Reason:\n" + $scope.answers.reason + "\n\n***Connections:\n" + $scope.answers.connection + "\n***************";

			$http.post("candidate/setCandidate", {event_id : event._id, note : notes}).success(function() {
				$scope.sending = false;
				$scope.error = false;
			}).error(function(error) {
				$scope.sending = false;
				$scope.error = true;
			});
		};

		$scope.done = function(status) {
			status = parseInt(status, 10);

			if(status) {
				$modalInstance.close(true);
			} else {
				$modalInstance.close(false);
			}
		};
	}
]);