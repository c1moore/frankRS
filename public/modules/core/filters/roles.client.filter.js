'use strict'; // :)

angular.module("core").filter("roles", function(){
	return function(data, rolesNeeded) {
		//creates array function to find if an array contains an element
		Array.prototype.contains = function(needle) {
			for (i in this) {
				if (this[i] == needle) return true;
			}
			return false;
		}

		var filtered = data.filter(containing);

		//filters out data not containing the roles
		var containing = function(element) {
			var found = false;
			for (var x in rolesNeeded) {
				if(element.roles.contains(x)) {
					found = true;
					break;
				}
			}
			return found;
		}

		return filtered;
	};
});
