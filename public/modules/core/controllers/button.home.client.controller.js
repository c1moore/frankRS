var buttonModel = {
	user:{
		names:["thing1","thing2","thing3"]
	}
	recruiter:{
		names:["thing3","thing4","thing5"]
	}
	admin:{
		names:["thing1","thing2","thing3, thing5"]
	}
}

angular.module('core').controller('ButtonController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		
	}

	$scope.getUserButtons() = function() {
		//we will call this function to return the correct array of buttons depending on user
		if (user==="user") return userArray;
		else if (user==="recruiter") return recruiterArray;
		else if (user==="admin") return adminArray;
	}
]);