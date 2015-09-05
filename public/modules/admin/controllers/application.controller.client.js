'use strict';

angular.module('admin').controller('applicationController', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', '$window', '$location', 'usSpinnerService', '$timeout', '$sce', '$modal', 'Authentication',
	function($scope, ngTableParams, $http, eventSelector, $filter, $window, $location, usSpinnerService, $timeout, $sce, $modal, Authentication) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
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
						$scope.getCandidates(true);
					}
				}
			);

			$http.get('/events/enumerateAll').success(function(data) {
				//formats the event data for the multiselect directive
				for (var i=0;i<data.length;i++) {
					$scope.selectEvents.push({label:data[i].name, event_id:data[i]._id});
				}
			}).error(function(data) {
				$scope.selectEvents = [];
				$scope.selectEvents[0] = {label : "Error", event_id : "error"};
			});

			$scope.getCandidates = function(eventChanged) {
				$http.post('/candidate/getCandidatesByEvent', {event_id:eventSelector.postEventId}).success(function(data) {
					for(var i = 0; i < data.length; i++) {
						data[i].displayName = data[i].lName + ", " + data[i].fName;
					}
					
					$scope.candidates = [];
					$scope.candidates = data;

					rowUpdated = false;
				}).error(function(error, status) {
					if(eventChanged || error.message === "No candidates found.") {
						$scope.candidates = [];
					}
					
					/**
					* If the error was not an authentication problem, try reloading the data.  If the problem
					* was related to authentication, the interceptor will take care of routing the user.
					* Problems related to no events existing will be treated the same way for now from here.
					*/
					if(status !== 401 && $location.path()=== "/leaderboard") {
						$timeout(function() {
							$scope.getCandidates();
						}, 5000);
					}
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
					}).error(function(res, status) {
						//Warn the user iff there wasn't an authentication issue (window.alert will keep the page from redirecting immediately).
						if(status !== 401) {
							$window.alert("Oops, something bad happened.  We couldn't save the new candidate.  Please make sure all fields are correct and try again.\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report this issue</a>");
						}
					});
				}
			};

			$scope.acceptCandidate = function(candidate) {
				var postObject = {candidate_id : candidate._id, event_id : eventSelector.postEventId, accepted : true};
				$http.post('/candidate/setAccepted',postObject).success(function() {
					//refresh table view
					$scope.getCandidates();
				}).error(function(res, status) {
					//Warn the user.
					if(status !== 401) {
						//Refresh table view so the candidate no longer appears as accepted.
						$scope.getCandidates();

						$window.alert("Candidate not updated.  Please try again.\n\n" + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
					}
				});
			};

			$scope.denyCandidate = function(candidate) {
				$http.post('/candidate/deleteCandidate/event',{candidate_id:candidate._id, event_id:eventSelector.postEventId}).success(function() {
					//refresh table view
					$scope.getCandidates();
				}).error(function(res) {					
					//Refresh table view so the candidate's real status is displayed.
					$scope.getCandidates();

					//Warn the user.
					$window.alert("Candidate not updated.  Please try again.\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
				});
			};

			//This updates the table when the candidates variable is changed.
			//I may be able to move this safely into the getCandidates() function.  Tests are needed to confirm this.
			$scope.$watch("candidates", function() {
				$timeout(function() {
					$scope.tableParams.reload();
				});
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
			$scope.selectedCandidates = [];
			$scope.setSelected = function(_id, email, index) {
				if($scope.selectedCandidates[index]) {
					for(var i=0; i<$scope.selected.ids.length; i++) {
						if($scope.selected.ids[i] === _id) {
							$scope.selected.ids.splice(i, 1);
							$scope.selected.emails.splice(i, 1);

							$scope.selectedCandidates[index] = false;
							return;
						}
					}
				}

				$scope.selected.ids.push(_id);
				$scope.selected.emails.push(email);
				$scope.selectedCandidates[index] = true;
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
						message : $scope.email.message,
						event_id : eventSelector.postEventId
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
						if(status !== 401) {
							$window.alert("There was an error sending the message.  Please try again later.\n\nError: " + response.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
						}
							
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
							}).error(function(res, status) {
								if(status !== 401) {
									$scope.getCandidates();

									$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s name.\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
								}
							});

							$http.post("/candidate/setlName", {lName : $scope.$data[index].lName, candidate_id : $scope.$data[index]._id}).success(function() {
								$scope.getCandidates();
							}).error(function(res, status) {
								if(status !== 401) {
									$scope.getCandidates();

									$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s name.\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
								}
							});
						} else {
							var address = "/candidate/set" + field;
							var data = {};

							data.candidate_id = $scope.$data[index]._id;

							if(field === "Status") {
								data[field.toLowerCase()] = $scope.$data[index].events[field.toLowerCase()];
								data.event_id = eventSelector.postEventId;
							} else {
								data[field.toLowerCase()] = $scope.$data[index][field.toLowerCase()];
							}

							$http.post(address, data).success(function() {
								$scope.getCandidates();
							}).error(function(res, status) {
								if(status !== 401) {
									$scope.getCandidates();
									
									$window.alert("Error occurred while updating " + $scope.$data[index].fName + "'s record.\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
								}
							});
						}
					} else {
						$scope.getCandidates();

						$window.alert("Candidate could not be found.  Refresh the page and try again.\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
					}
				}
			};

			$scope.inviteRecruiter = function(event) {
				var modalInstance = $modal.open({
					templateUrl: 	"modules/admin/views/inviteRecruiter.client.view.html",
					controller: 	"RecruiterInvitationCtrl",
					backdrop: 		"static",
					keyboard: 		false
				});
			};
		}
	}
]);

angular.module("admin").controller("RecruiterInvitationCtrl", ["$scope", "$modalInstance", "$http", "eventSelector", "$location", "usSpinnerService",
	function($scope, $modalInstance, $http, eventSelector, $location, usSpinnerService) {
		$scope.event = {name : eventSelector.selectedEvent, id : eventSelector.postEventId};
		$scope.invite = {subject : "We Want You to Be Our Next Great Recruiter"};

		$scope.editorMode = true;
		$scope.sending = false;
		$scope.sentMode = false;
		$scope.error = false;

		var link = "http://" + $location.host() + "/#!/recruiter/form?eid=" + encodeURIComponent(eventSelector.postEventId.toString());
		var linkHtml = "<a href='" + link + "'>" + link + "</a>";
		var linkRegex = /#link#/g;

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

		$scope.sendInvite = function() {
			usSpinnerService.spin('admin-new-recruiter-spinner-1');
			$scope.editorMode = $scope.sentMode = false;
			$scope.sending = true;
			$scope.error = false;

			var invite = {};
			angular.extend(invite, $scope.invite);

			//Replace HTML unsafe characters with their proper HTML safe equivalents.
			invite.message = _.escape(invite.message);
			
			//Either add the link to the end of the email or replace the reserved word with the link.
			if(invite.message.search(linkRegex) === -1) {
				invite.message += "\n\nYou can sign up at " + linkHtml;
			} else {
				invite.message = invite.message.replace(linkRegex, linkHtml);
			}

			//Replace all newline characters with <br />.
			invite.message = invite.message.replace(/\n/g, "<br />");

			//Split the string of emails into an array
			invite.emails = invite.emails.split(/, */g);

			invite.event_id = eventSelector.postEventId;

			$http.post("/send/nonuser", invite).success(function() {
				$scope.sending = false;
				$scope.sentMode = true;

				$scope.invite = {subject : "We Want You to Be Our Next Great Recruiter"};

				usSpinnerService.stop('admin-new-recruiter-spinner-1');
			}).error(function(res, status) {
				$scope.error = res.message + "  Error: " + res.error.code;
				
				$scope.sending = false;
				$scope.editorMode = true;
				
				usSpinnerService.stop("admin-new-recruiter-spinner-1");
			});
		};

		$scope.done = function() {
			$modalInstance.close();
		};
	}
]);
