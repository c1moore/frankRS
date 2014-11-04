'use strict';

// roles checking service for user variables
angular.module('users').factory('Roles', [

	var instance = function(rolesReq, roles) {
		var isIn = true;
		for (var=x in roles) {
			for (var=y in rolesReq) {
				if(roles[x] != roles[y]) {
					isIn = false;
				}
			}
		}
		return isIn;
	}
	return instance;
]);