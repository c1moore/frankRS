'use strict'; // :)

angular.module('invites').controller('invitesCtrl', ['$scope', 'Authentication', '$location', 'eventSelector', '$http', '$window', '$modal', 'cacheService', 'previewService', 'usSpinnerService',
	function($scope, Authentication, $location, eventSelector, $http, $window, $modal, cacheService, previewService, usSpinnerService) {
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
		} else {
			//Defaults for when the screen is too small to display the sidebar.
			$scope.sidebarActiveColor = '#333232';
			$scope.sidebarInactiveColor = '#6c6969';
			$scope.sidebarColor = $scope.sidebarInactiveColor;
			$scope.sidebarOpen = false;
			
			if(!eventSelector.recruiterEvent) {
				angular.element("#invitation-submit-button").addClass("disabled");
				angular.element("#invitation-preview-button").addClass("disabled");
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
					if(eventSelector.postEventId) {
						if(eventSelector.recruiterEvent) {
							angular.element("#invitation-submit-button").removeClass("disabled");
							angular.element("#invitation-preview-button").removeClass("disabled");
						}

						$scope.invite.event_name = eventSelector.selectedEvent;
						$scope.invite.event_id = eventSelector.postEventId;

						getPreview();
					}
				}
			);

			$scope.sending = false;
			$scope.send = function() {
				$scope.sending = true;
				usSpinnerService.spin('spinner-1');
				angular.element("#invitation-submit-button").addClass("disabled");

				$http.post('/send/evite', $scope.invite).success(function(response) {
					//Set all form fields to blank so the user can send another invitation.
					$scope.invite.fName = "";
					$scope.invite.lName = "";
					$scope.invite.email = "";
					$scope.invite.message = "";

					angular.element("#invitation-submit-button").removeClass("disabled");

					getSideTables();

					usSpinnerService.stop('spinner-1');
					$scope.sending = false;

					$window.alert(response.message);
				}).error(function(response, status) {
					if(status !== 401) {
						if(status !== 500) {
							angular.element("#invitation-submit-button").removeClass("disabled");
							
							usSpinnerService.stop('spinner-1');
							$scope.sending = false;

							$window.alert("There was an error sending this message.\n\nError: " + response.message + "\nIf this error continues, please <a href='/#!/problems'>report this issue</a>");
						} else {
							angular.element("#invitation-submit-button").removeClass("disabled");
							
							usSpinnerService.stop('spinner-1');
							$scope.sending = false;

							$window.alert("We could not connect to the server right now.\nIf this error continues, please <a href='/#!/problems'>report this issue</a>");
						}
					} else {
						angular.element("#invitation-submit-button").removeClass("disabled");
						
						usSpinnerService.stop('spinner-1');
						$scope.sending = false;

						$location.path("/");	
					}
				});
			};

			/*
			* Logic for sidebars
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

						if(response.length) {
							$scope.attendees.error = '';
						} else {
							$scope.attendees.error = "What?  How could this be?  Nobody has accepted one of your invitations yet!?!";
						}

					}).error(function(response, status) {
						$scope.attendees.list = [];
						//Since the http interceptor handles 401 cases, simply display a message despite the error code.
						if(status === 400 && response.message === "User not found or nobody the user invited has signed up to attend yet.") {
							$scope.attendees.error = "What?  How could this be?  Nobody has accepted one of your invitations yet!?!";
						} else {
							$scope.attendees.error = response.message;		//If the interceptor has not redirected the user, this message may contain helpful information.
						}
					});
					
					$http.post('/recruiter/invitees', request).success(function(response) {
						$scope.invitees.list = response;
						
						if(response.length) {
							$scope.invitees.error = '';
						} else {
							$scope.invitees.error = "How will anybody have be able to enjoy " + eventSelector.selectedEvent + " without wonderful people like you inviting them?  You should invite more people.";
						}
					
					}).error(function(response, status) {
						$scope.invitees.list = [];
						
						if(status === 400 && response.message === "User not found or nobody the user invited has signed up to attend yet.") {
							$scope.invitees.error = "How will anybody have be able to enjoy " + eventSelector.selectedEvent + " without wonderful people like you inviting them?  You should invite more people.";
						} else {
							$scope.attendees.error = response.message;
						}
					});

					$http.post('/recruiter/almosts', request).success(function(response) {
						$scope.almosts.list = response;

						if(response.length) {
							$scope.almosts.error = '';
						} else {
							$scope.almosts.error = "Nobody has chosen somebody else's invitation over your invitation.  Looks like somebody is popular.";
						}

					}).error(function(response, status) {
						$scope.almosts.list = [];
						
						if(status === 400 && response.message === "User not found or nobody the user invited has signed up to attend yet.") {
							$scope.almosts.error = "Nobody has chosen somebody else's invitation over your invitation.  Looks like somebody is popular.";
						} else {
							$scope.almosts.error = response.message;
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
			var minPreviewWindowSize = 750;		//Miniumum size (inclusive) of the window before the window will open the preview in a new tab.
			$scope.previewNewTab = false;
			$scope.previewQuery = "";

			if($window.innerWidth <= minPreviewWindowSize) {
				$scope.previewNewTab = true;
			}

			$scope.$watch(function() {
				return $window.innerWidth;
			}, function() {
				if($window.innerWidth <= minPreviewWindowSize) {
					$scope.previewNewTab = true;
				} else if($scope.previewNewTab) {
					$scope.previewNewTab = false;
				}
			});

			previewService.preview.recruiter_name = $scope.authentication.user.fName;
			previewService.preview.sender_email = $scope.authentication.user.email;
			previewService.preview.event_name = $scope.invite.event_name;
			previewService.preview.receiver_email = $scope.invite.invitee_email;
			previewService.preview.receiver_name = $scope.invite.fName;
			previewService.preview.message = $scope.invite.message;
			$scope.previewQuery =	"filename="			+ encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, " ").replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, "").replace(/\s/g, "_"))	+
									"&recruiter_name="	+ encodeURIComponent(previewService.preview.recruiter_name) +
									"&sender_email="	+ encodeURIComponent(previewService.preview.sender_email)	+
									"&event_name="		+ encodeURIComponent(previewService.preview.event_name)		+
									"&receiver_email="	+ encodeURIComponent(previewService.preview.receiver_email)	+
									"&receiver_name="	+ encodeURIComponent(previewService.preview.receiver_name)	+
									"&message="			+ encodeURIComponent(previewService.preview.message);

			$scope.$watchCollection('invite', function() {
				previewService.preview.sender_email = $scope.authentication.user.email;
				previewService.preview.event_name = $scope.invite.event_name;
				previewService.preview.receiver_email = $scope.invite.invitee_email;
				previewService.preview.receiver_name = $scope.invite.fName;
				previewService.preview.message = $scope.invite.message;
				$scope.previewQuery =	"filename="			+ encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, " ").replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, "").replace(/\s/g, "_"))	+
										"&recruiter_name="	+ encodeURIComponent(previewService.preview.recruiter_name) +
										"&sender_email="	+ encodeURIComponent(previewService.preview.sender_email)	+
										"&event_name="		+ encodeURIComponent(previewService.preview.event_name)		+
										"&receiver_email="	+ encodeURIComponent(previewService.preview.receiver_email)	+
										"&receiver_name="	+ encodeURIComponent(previewService.preview.receiver_name)	+
										"&message="			+ encodeURIComponent(previewService.preview.message);
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

					previewOptions.template = response.message;
					
					previewOptions.template = "<div class='modal-header'>" +
													"<h3 class='modal-title'>{{eventSelector.selectedEvent}} Invitation Preview</h3>" +
												"</div>" +
												"<div class='modal-body' style='overflow: auto;'>" +
													previewOptions.template +
												"</div>" +
												"<div class='modal-footer'>" +
													"<button class='btn btn-primary' ng-click='closePreview()'>Got it!</button>" +
												"</div>";
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

			$scope.$watch (
				function() {
					return eventSelector.postEventId;
				},
				function() {
					$scope.invite.event_id = eventSelector.postEventId;

					$scope.previewQuery =	"filename="			+ encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, " ").replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, "").replace(/\s/g, "_"))	+
											"&recruiter_name="	+ encodeURIComponent(previewService.preview.recruiter_name) +
											"&sender_email="	+ encodeURIComponent(previewService.preview.sender_email)	+
											"&event_name="		+ encodeURIComponent(previewService.preview.event_name)		+
											"&receiver_email="	+ encodeURIComponent(previewService.preview.receiver_email)	+
											"&receiver_name="	+ encodeURIComponent(previewService.preview.receiver_name)	+
											"&message="			+ encodeURIComponent(previewService.preview.message);
											
					getSideTables();
				}
			);
		}
	}
]);


angular.module('invites').controller('modalCtrl', ['$scope', '$modalInstance', 'eventSelector', 'previewService',
	function($scope, $modalInstance, eventSelector, previewService) {
		$scope.closeWarning = function() {
			$modalInstance.dismiss('done');
		};

		$scope.previewService = previewService;
		$scope.recruiter_name = previewService.preview.recruiter_name;
		$scope.event_name = previewService.preview.event_name;
		$scope.receiver_name = previewService.preview.receiver_name;
		$scope.receiver_email = previewService.preview.receiver_email;
		$scope.sender_email = previewService.preview.sender_email;
		$scope.message = previewService.preview.message;
		$scope.modalInstance = previewService.preview.modalInstance;

		$scope.$watchCollection('previewService.preview', function() {
			$scope.event_name = previewService.preview.event_name;
			$scope.receiver_name = previewService.preview.receiver_name;
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