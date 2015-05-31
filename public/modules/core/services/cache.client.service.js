'use strict';

angular.module('core').factory('cacheService', function($http, storageService) {
 	return {
        
        getData: function (key) {
            return storageService.get(key);
        },

        setData: function (key,data) {
            storageService.save(key, data);
        },
        
        removeData: function (key) {
            storageService.remove(key);
        }
	};
});