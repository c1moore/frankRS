'use strict';

angular.module('core').config(['flowFactoryProvider',
	function(flowFactoryProvider) {
		flowFactoryProvider.defaults = {
			target : '/comments/uploadRecruiterImage',
			uploadMethod : 'POST'
		};

		flowFactoryProvider.on('catchAll', function(event) {
			console.log(event);
			console.log('catchAll', arguments);
		});
	}
]);