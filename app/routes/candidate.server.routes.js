'use strict';

//routes to get info from candidate
var dan_candidate_routes = require('../../app/controllers/candidate.routes.server.controller.js');

//candidate routes
module.exports = function(app){
	//var candidate = require('../../app/controllers');

	//candidate routes
	app.route('/candidate/getCandidates').post(dan_candidate_routes.getCandidates);
	app.route('/candidate/getCandidatesByEvent').post(dan_candidate_routes.getCandidatesByEvent);
	app.route('/candidate/getfName').post(dan_candidate_routes.getfName);
	app.route('/candidate/getlName').post(dan_candidate_routes.getlName);
	app.route('/candidate/getEmail').post(dan_candidate_routes.getEmail);
	//app.route('/candidate/getStatus').post(dan_candidate_routes.getStatus);
	app.route('/candidate/getEvents').post(dan_candidate_routes.getEvents);
	//app.route('/candidate/getAccept_Key').post(dan_candidate_routes.getAccept_Key);
	app.route('/candidate/getNote').post(dan_candidate_routes.getNote);
	app.route('/candidate/getUser_id').post(dan_candidate_routes.getUser_id);
	app.route('/candidate/me').post(dan_candidate_routes.userCandidate);
	app.route('/candidate/new/no_user').post(dan_candidate_routes.createNonuserCandidate);


	app.route('/candidate/setfName').post(dan_candidate_routes.setfName);
	app.route('/candidate/setlName').post(dan_candidate_routes.setlName);
	app.route('/candidate/setEmail').post(dan_candidate_routes.setEmail);
	app.route('/candidate/setStatus').post(dan_candidate_routes.setEventStatus);
	app.route('/candidate/addEvent').post(dan_candidate_routes.addEvent);
	app.route('/candidate/setAccepted').post(dan_candidate_routes.setEventAccepted);
	app.route('/candidate/setNote').post(dan_candidate_routes.setNote);
	app.route('/candidate/update').post(dan_candidate_routes.updateCandidate);

	app.route('/candidate/setCandidate').post(dan_candidate_routes.setCandidate);
	app.route('/candidate/deleteCandidate').post(dan_candidate_routes.deleteCandidate);
	app.route('/candidate/deleteCandidate/event').post(dan_candidate_routes.deleteCandidateByEvent);

	app.route('/admin/send').post(dan_candidate_routes.sendCandidateEmail);
	app.route('/candidate/send').post(dan_candidate_routes.sendNewCandidateEmail);
};
