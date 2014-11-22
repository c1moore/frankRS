'use strict';

//Menu service used for managing  menus
angular.module('core').service('previewService', [
	function() {
		this.preview = {};

		this.preview.modalInstance = null;
		this.preview.event_name = "";
		this.preview.sender_email = "";
		this.preview.receiver_email = "";
		this.preview.receiver_fname = "";
		this.preview.receiver_lname = "";
		this.preview.message = "";
	}
]);
