'use strict'; // :)

angular.module("core").filter("roles", function(){
	return function(data, rolesNeeded) {
		//creates array function to find if an array contains an element
		var contains = function(array, needle) {
			for (var x in array) {
				if (array[x] === needle) return true;
			}
			return false;
		}

		//filters out data not containing the roles
		var containing = function(element) {
			for (var x in rolesNeeded) {
				if (contains(element.roles,rolesNeeded[x])) return true;
			}
			return false;
		};
		
		return data.filter(containing);
	};
});
