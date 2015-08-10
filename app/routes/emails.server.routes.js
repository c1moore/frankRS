'use strict';

module.exports = function(app) {
	//Email routes
	var emails = require("../../app/controllers/email");

	app.route('/admin/send').post(emails.sendCandidateEmail);
	app.route('/send/nonuser').post(emails.sendNonuserEmail);

	app.route('/send/evite').post(emails.sendInvitation);
	app.route('/accept/invitation').post(emails.acceptInvitation);

	app.route('/send/programmer').post(emails.emailProgrammer);

	app.route('/view/template').get(emails.renderEmailTemplate);
};