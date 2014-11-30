'use strict';

/**
* Service that allows users to select the event for which the current page should display information about.  Admins should be able to view all events
* at all times, the eventSelector will have to behave slightly differently if the user is an admin.  Otherwise, the user should only view the events that are in
* their status array.  While this is handled in the backend, the data sent to the frontend differs slightly.
*/
angular.module('core').service('eventSelector', ['$http', '$location', 'cacheService', 'Authentication',

	function($http, $location, cacheService, Authentication) {
		var thisService = this;
		this.events = [];
		this.selectedEvent = "Select Event";
		this.disabled = false;
		this.numRecruiting = 0;
		this.postEventId = null;
		this.nresDisabled = false;
		this.recruiterEvent = true;
		this.admin = false;

		var cache = cacheService;
		var keys = [];
		var put = function(key, value) {
			cache.setData(key,value);
		}

		//Functions common to all users.
		var checkEvent = function(needle) {
			for (var i=0; i<thisService.events.length; i++) {
				if (thisService.events[i].event_id._id === needle) return true;
			}
			return false;
		}

		this.hideEventSelector = function() {
			var path = $location.path();

			return (path === '/signin' || path === '/settings/profile' || path === '/settings/password');
		}

		if(_.intersection(Authentication.user.roles, ['admin']).length === 1) {
			this.admin = true;
			$http.get('/users/events').success(function(data) {
				thisService.events = data;

				var cachedEvent = cache.getData('selectedEvent'), cachedId = cache.getData('eventId');

				if(!(cachedEvent) && !(cachedId) && (data.length > 0) && checkEvent(cachedId)) {
					thisService.selectedEvent = cache.getData('selectedEvent');
					thisService.postEventId = cache.getData('eventId');
				}
			}).error(function(error, status) {
				thisService.selectedEvent = "Error";
				console.log(error);
			});

			thisService.changeEvent = function(event) {
				thisService.selectedEvent = event.name;
				thisService.postEventId = event._id;
				put('selectedEvent', event.name);
				put('eventId', event._id);
			};

			thisService.showDivider = function() {
				return false;
			}

			thisService.toggleDisabledEvents = function() {};
		} else {
			$http.get('/users/events').success(function(data) {
				thisService.events = data.status;
				for(var i=0; i<thisService.events.length; i++) {
					if(thisService.events[i].recruiter)
						thisService.numRecruiting++;
				}
				if(cache.getData('selectedEvent') != null && cache.getData('eventId') != null && thisService.events.length > 0 && checkEvent(cache.getData('eventId')) == true) {
					thisService.selectedEvent = cache.getData('selectedEvent');
					thisService.postEventId = cache.getData('eventId');
					thisService.recruiterEvent = cache.getData('recruiterEvent');
				}
			}).error(function(error, status) {
				if(status === 401) {
					thisService.selectedEvent = "Error";
					thisService.disabled = !thisService.disabled;
				}
				console.log(error);
			});

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

			thisService.toggleDisabledEvents = function() {
				thisService.nresDisabled = !thisService.nresDisabled;
			};
		}
	}
]);