'use strict';

//Menu service used for managing  menus
angular.module('core').service('previewService', [
	function() {
		this.preview = {};

		this.preview.modalInstance = null;
		this.preview.recruiter_name = "";
		this.preview.event_name = "";
		this.preview.sender_email = "";
		this.preview.receiver_email = "";
		this.preview.receiver_name = "";
		this.preview.message = "";
	}
]);
