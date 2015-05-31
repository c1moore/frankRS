'use strict'; // :)

angular.module("core").filter("roles", function(){
	return function(data, rolesNeeded) {
		//creates array function to find if an array contains an element
		var contains = function(array, needle) {
			for (var x in array) {
				if (array[x] === needle) return true;
			}
			return false;
		};

		//filters out data for arrays of objects
		var objectContaining = function(element) {
			for (var x in rolesNeeded) {
				if (contains(element.roles,rolesNeeded[x])) return true;
			}
			return false;
		};

		//filters out data for arrays of strings
		var arrayContaining = function(element) {
			return contains(rolesNeeded,element);
		};

		//handles the case when data or rolesNeeded don't exist 
		if (data === null || rolesNeeded === null) {
			return [];
		}
		//check if arrays are the same
		else if (angular.equals(data,rolesNeeded)) {
			return rolesNeeded;
		}
		//check if array of objects
		else if (typeof(data[0]) === 'object') {
			return data.filter(objectContaining);
		}
		else {
			return data.filter(arrayContaining);
		}
	};
});
