'use strict';

angular.module('krewes').config(['localStorageServiceProvider',
	function(localStorageServiceProvider) {
		localStorageServiceProvider
			.setPrefix('frankRS')							// Prefix for frankRS localstorage
			.setStorageCookie(365)							// Cookies should not expire for 1 year and use the default path
			.setStorageCookieDomain(window.location.host)	// Use host name for the domain
			.setStorageType('localStorage')					// Use localstorage, if available
			.setNotify(false, false);						// Notifications are not necessary
	}
]);