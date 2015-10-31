'use strict';

angular.module('krewes').controller('KreweController', ['$scope', 'Authentication', '$http', '$location', 'eventSelector', '$timeout', 'localStorageService',
	function($scope, Authentication, $http, $location, eventSelector, $timeout, localStorageService) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'kreweAdmin', 'kaptain']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			if(_.intersection(Authentication.user.roles, ['admin', 'kreweAdmin']).length !== 0) {
				/*** scope Variables ***/
				$scope.krewes = [];
				$scope.potentialMembers = [];

				// Dictionary of potential interests as the key and the path to their image as the value.
				$scope.interestsSource = {
					"Arts" : "img/interests/arts.png",
					"Child Development" : "img/interests/child_development.png",
					"Conservation" : "img/interests/conservation.png",
					"Corporate Social Responsibility" : "img/interests/corporate_social_responsibility.png",
					"Corrections" : "img/interests/corrections.png",
					"Culture" : "img/interests/culture.png",
					"Education" : "img/interests/education.png",
					"Entertainment" : "img/interests/entertainment.png",
					"Environment" : "img/interests/environment.png",
					"Food & Health" : "img/interests/food_&_health.png",
					"frank" : "img/interests/frank.png",
					"Gender Equality" : "img/interests/gender_equality.png",
					"Health" : "img/interests/health.png",
					"Human Rights" : "img/interests/human_rights.png",
					"Income Disparity" : "img/interests/income_disparity.png",
					"Inspiration" : "img/interests/inspiration.png",
					"International Development" : "img/interests/international_development.png",
					"Media" : "img/interests/media.png",
					"Mental Health" : "img/interests/mental_health.png",
					"Music" : "img/interests/music.png",
					"Politics" : "img/interests/politics.png",
					"Poverty" : "img/interests/poverty.png",
					"Religion" : "img/interests/religion.png",
					"Science" : "img/interests/science.png",
					"Social Media" : "img/interests/social_media.png",
					"Solutions Journalism" : "img/interests/solutions_journalism.png",
					"Special Needs" : "img/interests/special_needs.png",
					"Technology" : "img/interests/technology.png",
					"Tobacco" : "img/interests/tobacco.png",
					"Travel" : "img/interests/travel.png",
					"Violence Prevention" : "img/interests/violence_prevention.png",
					"Water" : "img/interests/water.png"
				};

				/*** Variables ***/
				var originalDataPrefix = "original_";		// Prefix to add to original krewe data.
				var currentDataPrefix = "dirty_";			// Prefix to add to current version of krewe data.

				/**
				* Load all saved krewes in database and transform them to a format expected by 
				* the drag and drop plugin.  Saves data in $scope.krewes.
				*/
				var loadKrewes = function() {
					$http.post('/krewes', {event_id: eventSelector.postEventId}).success(function(kreweData) {
						// Transform the kaptain field for each krewe to the format dnd expects.
						for (var i = kreweData.length - 1; i >= 0; i--) {
							kreweData[i].kaptain = [kreweData[i].kaptain];
						};

						$scope.krewes = kreweData;
					}).error(function(errMessage, status) {
						if(status === 400 && errMessage === "Required fields not specified.") {
							// Data was not passed to backend.  Most likely the user does not have an event selected.
						} else if(status === 4000 && errMessage === "An error occurred retreiving krewes.") {
							// Some error occurred.  Warn the user and give them the option to report the problem.
						} else {
							// Unknown error (probably 500).  Warn user.
						}
					});
				};

				/**
				* Load all the potential members and save the result in $scope.potentialMembers.
				*/
				var loadPotentialMemebers = function() {
					$http.post('/krewes/users', {event_id: eventSelector.postEventId}).success(function(unassignedUsers) {
						$scope.potentialMembers = unassignedUsers;
					}).error(function(errMessage, status) {
						if(status === 400 && errMessage === "Required fields not specified.") {
							// Data was not passed to backend.  Most likely the user does not have an event selected.
						} else if(status === 4000 && errMessage === "An error occurred retreiving krewes.") {
							// Some error occurred.  Warn the user and give them the option to report the problem.
						} else {
							// Unknown error (probably 500).  Warn user.
						}
					});
				};

				/**
				* Store the initial copy of the data retreived from the backend to localstorage.
				*
				* @param event_id <String> - the _id of the event to which this data pertains
				* @param originalKrewes <Object> - the data stored in the backend when changes started
				*/
				var storeOriginalVersionLocally = function(event_id, originalKrewes) {
					var storageKey = originalDataPrefix + event_id;

					localStorageService.set(storageKey, originalKrewes);
				};

				/**
				* Returns the original krewes as stored in local storage.
				*
				* @param event_id <String> - the _id of the event for which data should be retreived
				*
				* @return <Object> if requested data for this event is in localstorage, null otherwise
				*/
				var retreiveOriginalVersionLocally = function(event_id) {
					var storageKey = originalDataPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
						return localStorageService.get(storageKey);
					}

					return null;
				}

				/**
				* Returns true iff the a local version of the state of krewe data when changes
				* began is stored in localstorage.  Returns false otherwise.
				*
				* @param event_id <String> - the _id of the event
				*
				* @return <Bool> - true iff local version of the state of krewe data when changes began is in localstorage
				*/
				var originalStateExistsLocally = function(event_id) {
					var storageKey = originalDataPrefix + event_id;

					return (_.intersection(localStorageService.keys(), [storageKey]).length === 1);
				}

				/**
				* Store the current version of data being edited by the user to localstorage.
				*
				* @param event_id <String> - the _id of the event for which kreweData pertains
				* @param kreweData <Object> - the current krewe data for event_id
				*/
				var storeChangesLocally = function(event_id, kreweData) {
					var storageKey = currentDataPrefix + event_id;

					localStorageService.set(storageKey, kreweData);
				};

				/**
				* Returns the local krewe data for the event specified by event_id.
				*
				* @param event_id <String> - the _id of the event for which local krewe data should be retreived
				*
				* @return <Object if requested data for this event is in localstorage, null otherwise
				*/
				var retreiveChangesLocally = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
						return localStorageService.get(storageKey);
					}

					return null;
				}

				/**
				* Return true iff local changes to krewe data for event_id is stored.  Returns
				* false otherwise.
				*
				* @param event_id <String> - the _id of the event
				*
				* @return <Bool> - true iff local changes are stored, false otherwise
				*/
				var localChangesExist = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					return (_.intersection(localStorageService.keys(), [storageKey]).length === 1);
				}

				/*** Event Listeners ***/
				// Load data from backend when the selected event changes.
				$scope.$watch(
					function() {
						return eventSelector.postEventId;
					},
					function() {
						if(eventSelector.postEventId !== null) {
							if(!localChangesExist(eventSelector.postEventId)) {
								// No local changes exist.  Update the local information.
								loadKrewes();
								loadPotentialMemebers();

								storeOriginalVersionLocally(eventSelector.postEventId, $scope.krewes);
							} else {
								// Local changes have been made.  Make sure the backend still has the same version as the local original version.
							}
						}
					}
				);

				/*** scope Functions ***/
				$scope.editKreweName = function(kreweIndex) {

				};

				/**
				* Remove the current Kaptain from this krewe.  If another Kaptain is being replacing
				* the current Kaptain, newKaptain should contain the new Kaptain.  Otherwise, this
				* field should be left blank
				*
				* @param kreweIndex <int> - the index of the krewe from which the kaptain should be removed
				* @param newKaptain <Object> (optional) - the new kaptain that is replacing the current kaptain
				*
				* @return newKaptain <Object> - iff newKaptain was specified, otherwise nothing is returned
				*/
				$scope.removeKaptain = function(kreweIndex, newKaptain) {
					$scope.krewes[kreweIndex].kaptain.splice(0, 1);

					storeChangesLocally(eventSelector.postEventId, $scope.krewes);

					if(newKaptain) {
						return newKaptain;
					}
				};

				/**
				* Remove the memberIndexth member from this krewe.
				*
				* @param kreweIndex <int> - the index of the krewe from which this member should be removed
				* @param memberIndex <int> - the index of the member within the krewe that should be removed
				*/
				$scope.removeMember = function(kreweIndex, memberIndex) {
					$scope.krewes[kreweIndex].members.splice(0, 1);

					storeChangesLocally(eventSelector.postEventId, $scope.krewes);
				};

				/**
				* Create a new, empty Krewe.
				*/
				$scope.addNewKrewe = function() {
					var newKrewe = {
						_id: 		null,
						name: 		"",
						kaptain: 	{
							_id: 	null,
							fName: 	"",
							lName: 	""
						},
						members: 	[]
					};

					$scope.krewes.append(newKrewe);
				};

				/**
				* Save all changes to the backend to be processed and refresh localstorage's
				* copy of backend data.  After all changes have been saved, clear the
				* localstorage current krewe data for this event since the local version now
				* matches the backend.
				*/
				$scope.saveChanges = function() {

				};

				/**
				* Pull all changes not shown in this local version from the backend.
				*/
				$scope.updateLocalKrewes = function() {

				};

				/**
				* Remove potentialMemberIndexth user from the potential members.
				*
				* @param potentialMemberIndex <int> the index of the member to remove within the potentialMembers array
				*/
				$scope.removePotentialMember = function(potentialMemberIndex) {

				};
			}
		}
	}
]);