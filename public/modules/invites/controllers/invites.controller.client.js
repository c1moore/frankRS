'use strict'; // :)

angular.module('invites').controller('invitesCtrl', ['$scope', 'Authentication', '$location', 'eventSelector', '$http', '$window', '$modal', 'cacheService', 'previewService',
	function($scope, Authentication, $location, eventSelector, $http, $window, $modal, cacheService, previewService) {
		$scope.authentication = Authentication;

		/*
		* If the user is not logged in, they should be redirected to the sigin page.  If the
		* user is logged in, but does not have the proper permissions they should be
		* redirected to the homepage.
		*/
		if(!$scope.authentication.user) {
			$location.path('/signin');
		} else if(!(_.intersection($scope.authentication.user.roles, ['recruiter', 'admin']).length)) {
			$location.path('/');
		}
		
		if(!eventSelector.nresDisabled) {
			eventSelector.toggleDisabledEvents();
			if(!eventSelector.recruiterEvent) {
				angular.element("#invitation-submit-button").addClass("disabled");
				angular.element("#invitation-preview-button").addClass("disabled");
			}
		}

		var tempEvent = cacheService.getData('selectedEvent');

		if(!tempEvent || tempEvent === "Select Event") {
			angular.element("#invitation-submit-button").addClass("disabled");
			angular.element("#invitation-preview-button").addClass("disabled");

			$scope.eventWarning = $modal.open({
				controller : 'modalCtrl',
				template : "<div class='modal-header'>" +
								"<h3 class='modal-title'>Select Event</h3>" +
							"</div>" +
							"<div class='modal-body'>" +
								"<p>It looks like you do not have an event selected or you did not have an event for which you are recruiting selected.  That's alright, just select the event for which you want to send an invitation before proceeding.</p>" +
								"<p>(The event selector is in the top right-hand corner by your name.)</p>" +
							"</div>" +
							"<div class='modal-footer'>" +
								"<button class='btn btn-primary' ng-click='closeWarning()'>OK</button>" +
							"</div>"
			});
		}

		$scope.recruiter_email = $scope.authentication.user.email;

		$scope.invite = {};
		$scope.invite.event_name = eventSelector.selectedEvent;
		$scope.invite.event_id = eventSelector.postEventId;

		$scope.$watch (
			function() {
				return eventSelector.selectedEvent;
			},
			function() {
				angular.element("#invitation-submit-button").removeClass("disabled");
				angular.element("#invitation-preview-button").removeClass("disabled");
				$scope.invite.event_name = eventSelector.selectedEvent;
				getPreview();
			}
		);

		$scope.$watch (
			function() {
				return eventSelector.postEventId;
			},
			function() {
				$scope.invite.event_id = eventSelector.postEventId;
				getSideTables();
			}
		);

		$scope.send = function() {
			angular.element("#invitation-submit-button").addClass("disabled");
			$http.post('/invitation/send', $scope.invite).success(function(response) {
				$window.alert(response.message);

				//Set all form fields to blank so the user can send another invitation.
				$scope.invite.fName = "";
				$scope.invite.lName = "";
				$scope.invite.email = "";
				$scope.invite.message = "";

				angular.element("#invitation-submit-button").removeClass("disabled");

				getSideTables();
			}).error(function(response) {
				$window.alert(response.message);
				console.log(response.message);

				angular.element("#invitation-submit-button").removeClass("disabled");
			});
		};

	/*
	* Sidebar controllers
	*/

	$scope.firstSelected = true;
	$scope.secondSelected = false;
	$scope.thirdSelected = false;
	$scope.attendees = {}, $scope.attendees.list = [];
	$scope.invitees = {}, $scope.invitees.list = [];
	$scope.almosts = {}, $scope.almosts.list = [];

	var getSideTables = function() {
		if($scope.invite.event_id) {
			var request = {event_id : $scope.invite.event_id};
			$http.post('/recruiter/attendees', request).success(function(response) {
				$scope.attendees.list = response;
				$scope.attendees.error = '';
			}).error(function(response, status) {
				$scope.attendees.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signin');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.attendees.error = "Looks like nobody you invited has accepted your request.  Keep trying, eventually you'll find the right people.";
				}
			});
			
			$http.post('/recruiter/invitees', request).success(function(response) {
				$scope.invitees.list = response;
				$scope.invitees.error = '';
			}).error(function(response, status) {
				$scope.invitees.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signin');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.invitees.error = "How will anybody have be able to enjoy {{$scope.invite.event_name}} without wonderful people like you inviting them?  You should invite more people.";
				}
			});

			$http.post('/recruiter/almosts', request).success(function(response) {
				$scope.almosts.list = response;
				$scope.almosts.error = '';
			}).error(function(response, status) {
				$scope.almosts.list = [];
				if(status === 401) {
					if(response.message === "User is not logged in.") {
						$location.path('/signin');
					} else {
						$location.path('/');
					}
				} else if(status === 400) {
					$scope.almosts.error = "Nobody has chosen somebody else's invitation over your invitation.  Looks like somebody is popular.";
				}
			});
		} else {
			$scope.attendees.error = "You have not selected an event.  You can do so in the top right-hand corner.";
			$scope.invitees.error = "You have not selected an event.  You can do so in the top right-hand corner.";
			$scope.almosts.error = "You have not selected an event.  You can do so in the top right-hand corner.";
		}
	};

	getSideTables();

	/*
	* Logic for preview.
	*/

	var previewOptions = {};


	previewService.preview.sender_email = $scope.authentication.user.email;
	previewService.preview.event_name = $scope.invite.event_name;
	previewService.preview.receiver_email = $scope.invite.invitee_email;
	previewService.preview.receiver_fname = $scope.invite.fName;
	previewService.preview.receiver_lname = $scope.invite.lName;
	previewService.preview.message = $scope.invite.message;

	$scope.$watchCollection('invite', function() {
		previewService.preview.sender_email = $scope.authentication.user.email;
		previewService.preview.event_name = $scope.invite.event_name;
		previewService.preview.receiver_email = $scope.invite.invitee_email;
		previewService.preview.receiver_fname = $scope.invite.fName;
		previewService.preview.receiver_lname = $scope.invite.lName;
		previewService.preview.message = $scope.invite.message;
	});

	var getPreview = function() {
		var request = {event_id : eventSelector.postEventId, event_name : eventSelector.selectedEvent};
		$http.get('/preview/invitation', {params : request}).success(function(response) {
			previewOptions.template = response.preview;
			
			previewOptions.template = "<div class='modal-header'>" +
											"<h3 class='modal-title'>{{eventSelector.selectedEvent}} Invitation Preview</h3>" +
										"</div>" +
										"<div class='modal-body'>" +
											previewOptions.template +
										"</div>" +
										"<div class='modal-footer'>" +
											"<button class='btn btn-primary' ng-click='closePreview()'>Got it!</button>" +
										"</div>";
		}).error(function(response, status) {
			previewOptions = {};
			if(status === 401) {
				if(response.message === "User is not logged in.") {
					$location.path('/signin');
				} else {
					$location.path('/');
				}
			} else if(status === 400) {
				previewOptions.template = response.message;//"There was an error getting the template.  Please try refreshing the page or selecting an event in the top right-hand corner.";
				
				previewOptions.template = "<div class='modal-header'>" +
												"<h3 class='modal-title'>{{eventSelector.selectedEvent}} Invitation Preview</h3>" +
											"</div>" +
											"<div class='modal-body' style='overflow: auto;'>" +
												previewOptions.template +
											"</div>" +
											"<div class='modal-footer'>" +
												"<button class='btn btn-primary' ng-click='closePreview()'>Got it!</button>" +
											"</div>";
			}
		});
	};

	$scope.togglePreview = function() {
		if(!previewService.preview.modalInstance) {
			previewOptions.controller = 'modalCtrl';
			previewOptions.backdrop = false;
			previewOptions.windowClass = 'frank-invite-preview-modal';
			previewOptions.modalDraggable = true;
			previewOptions.keyboard = false;
			previewService.preview.modalInstance = $modal.open(previewOptions);
		}
	};
  }
]);


angular.module('invites').controller('modalCtrl', ['$scope', '$modalInstance', 'eventSelector', 'previewService',
	function($scope, $modalInstance, eventSelector, previewService) {
		$scope.closeWarning = function() {
			$modalInstance.dismiss('done');
		};

		$scope.previewService = previewService;
		$scope.event_name = previewService.preview.event_name;
		$scope.receiver_fname = previewService.preview.receiver_fname;
		$scope.receiver_lname = previewService.preview.receiver_lname;
		$scope.receiver_email = previewService.preview.receiver_email;
		$scope.sender_email = previewService.preview.sender_email;
		$scope.message = previewService.preview.message;
		$scope.modalInstance = previewService.preview.modalInstance;

		$scope.$watchCollection('previewService.preview', function() {
			$scope.event_name = previewService.preview.event_name;
			$scope.receiver_fname = previewService.preview.receiver_fname;
			$scope.receiver_lname = previewService.preview.receiver_lname;
			$scope.receiver_email = previewService.preview.receiver_email;
			$scope.sender_email = previewService.preview.sender_email;
			$scope.message = previewService.preview.message;
			$scope.modalInstance = previewService.preview.modalInstance;
		});

		$scope.closePreview = function() {
			$modalInstance.close();
			previewService.preview.modalInstance = null;
		};
	}
]);