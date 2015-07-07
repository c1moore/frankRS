'use strict';

/**
* Service that allows users to select the event for which the current page should display information about.  Admins should be able to view all events
* at all times, the eventSelector will have to behave slightly differently if the user is an admin.  Otherwise, the user should only view the events that are in
* their status array.  While this is handled in the backend, the data sent to the frontend differs slightly.
*
* Since the eventSelector is refreshed every time the page is refreshed, we should store the value that
* the user selected before refreshing the page so this event can automatically be restored.  We are using
* cacheService to deal with saving these values to the localStorage.
*/
angular.module('core').service('eventSelector', ['$rootScope', '$http', '$location', 'cacheService', 'Authentication', '$window', '$timeout',

	function($rootScope, $http, $location, cacheService, Authentication, $window, $timeout) {
		var thisService = this;
		var cache = cacheService;

		this.events = [];				//List of events viewable to this user.
		this.selectedEvent = "Select Event";
		this.postEventId = null;
		this.numRecruiting = 0;
		this.recruiterEvent = true;		//Whether or not this user is recruiting for the selected event.
		this.nresDisabled = false;		//Whether or not the events for which this user is only attending (not recruiting) are disabled (used on pages that require recruiter/admin privileges).
		this.disabled = false;
		this.admin = false;				//Whether or not this user is an admin.

		var keys = [];
		var put = function(key, value) {
			cache.setData(key,value);
		};

		this.hideEventSelector = function() {
			var path = $location.path();

			return (path === '/signin' || path === '/settings/profile' || path === '/settings/password' || !Authentication.user);
		};

		thisService.eventSelect = function() {
			/**
			* Functions will be defined based on whether or not the current user is an admin.  Since
			* admins should be able to see all events, their eventSelector will behave differently than
			* attendees and recruiters.
			*/
			if(_.intersection(Authentication.user.roles, ['admin']).length > 0) {
				thisService.admin = true;

				var checkEvent = function(needle) {
					for (var i=0; i<thisService.events.length; i++) {
						if(thisService.events[i]._id === needle)
							return i;
					}
					return false;
				};

				
				/*This request the available events from the db. If there already is a cache of the selected event,
				this event is used as the currently selected event. If there is not a cache of events, it will use
				the first available event in the events array from the db as the selected event. */
				var getEvents = function() {
					$http.get('/users/events').success(function(data) {
						thisService.events = data;

						var cachedEvent = cache.getData('selectedEvent'), cachedId = cache.getData('eventId'), cachedUI = cache.getData('ui');

						var index;
						if(cachedEvent && cachedEvent != "undefined" && cachedId && cachedId != "undefined" && thisService.events.length && (index = checkEvent(cachedId)) && cachedUI && cachedUI === Authentication.user._id) {
							thisService.selectedEvent = thisService.events[index].name;
							thisService.postEventId = thisService.events[index]._id;
						} else {
							thisService.selectedEvent = thisService.events[0].name;
							thisService.postEventId = thisService.events[0]._id;

							put('selectedEvent', thisService.events[0].name);
							put('eventId', thisService.events[0]._id);
							put('ui', Authentication.user._id);
						}
					}).error(function(error, status) {
						thisService.selectedEvent = "Error";

						//Attempt again in 5 seconds.
						if(status !== 401) {
							$timeout(function() {
								getEvents();
							}, 5000);
						}
					});
				};
				getEvents();

				thisService.changeEvent = function(event) {
					thisService.selectedEvent = event.name;
					thisService.postEventId = event._id;
					
					put('selectedEvent', event.name);
					put('eventId', event._id);
				};

				/**
				* Admins have permission to do anything with any event so there is no need for a divider.
				*/
				thisService.showDivider = function() {
					return false;
				};
			} else {
				var restrictedPaths = ["/invite", "/leaderboard"];

				$rootScope.$on('$locationChangeSuccess', function(event) {
					var current_path = $location.path();

					for(var i=0; i < restrictedPaths.length; i++) {
						if(current_path === restrictedPaths[i]) {
							thisService.nresDisabled = true;
							break;
						}
					}

					if(i === restrictedPaths.length) {
						thisService.nresDisabled = false;
					}
				});

				var checkEvent = function(needle) {
					for (var i=0; i<thisService.events.length; i++) {
						if (thisService.events[i].event_id._id === needle) {
							return i;
						}
					}
					return false;
				};

				var getEvents = function() {
					$http.get('/users/events').success(function(data) {
						thisService.events = data.status;
						console.log(data);
						for(var i=0; i<thisService.events.length; i++) {
							if(thisService.events[i].event_id.recruiter)
								thisService.numRecruiting++;
						}

						var cachedEvent = cache.getData('selectedEvent'), cachedId = cache.getData('eventId'), cachedUI = cache.getData('ui');

						var index;
						if(cachedEvent && cachedEvent != "undefined" && cachedId && cachedId != "undefined" && thisService.events.length && (index = checkEvent(cachedId)) && cachedUI && cachedUI === Authentication.user._id) {
							thisService.selectedEvent = thisService.events[index].event_id.name;
							thisService.postEventId = thisService.events[index].event_id._id;
							thisService.recruiterEvent = thisService.events[index].recruiter;
						} else {
							thisService.selectedEvent = thisService.events[0].event_id.name;
							thisService.postEventId = thisService.events[0].event_id._id;
							thisService.recruiterEvent = thisService.events[0].recruiter;

							put('selectedEvent', thisService.events[0].event_id.name);
							put('eventId', thisService.events[0].event_id._id);
							put('recruiterEvent', thisService.recruiterEvent);
							put('ui', Authentication.user._id);
						}
					}).error(function(error, status) {
						if(status === 400) {
							thisService.selectedEvent = "Error";
							thisService.disabled = !thisService.disabled;
						}

						//Attempt again in 5 seconds.
						if(status !== 401) {
							$timeout(function() {
								getEvents();
							}, 5000);
						}
					});
				};
				getEvents();

				thisService.changeEvent = function(event) {
					thisService.selectedEvent = event.event_id.name;
					thisService.postEventId = event.event_id._id;
					thisService.recruiterEvent = event.recruiter;
					
					put('selectedEvent',event.event_id.name);
					put('eventId',event.event_id._id);
					put('recruiterEvent', thisService.recruiterEvent);
				};

				thisService.showDivider = function() {
					return ((thisService.numRecruiting > 0) && (thisService.events.length > thisService.numRecruiting));
				};
			}
		}

		if($window.user != "") {
			thisService.eventSelect();
		}
	}
]);