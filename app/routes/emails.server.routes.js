'use strict';

module.exports = function(app) {
	//Email routes
	var emails = require("../../app/controllers/email");

	app.route('/admin/send').post(emails.sendCandidateEmail);		//A better route would be /send/programmer
	app.route('/send/nonuser').post(emails.sendNonuserEmail);		//A better route would be /send/nonuser

	app.route('/send/evite').post(emails.sendInvitation);		//A better route would be /send/invitation or /send/invitee
	app.route('/accept/invitation').post(emails.acceptInvitation);	//A better route would be /accept/invitation

	app.route('/send/programmer').post(emails.emailProgrammer);	//A better route would be /send/programmer
};