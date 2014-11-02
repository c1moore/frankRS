'use strict';

//routes to get info from candidate
var dan_candidate_routes = require('../../app/controllers/candidate.routes.server.controller.js');

//candidate routes
module.exports = function(app){

//var candidate = require('../../app/controllers');

//candidate routes
app.route('/candidate/getfName').get(dan_candidate_routes.getfName);
app.route('/candidate/getlName').get(dan_candidate_routes.getlName);
app.route('/candidate/getEmail').get(dan_candidate_routes.getEmail);
app.route('/candidate/getStatus').get(dan_candidate_routes.getStatus);
app.route('/candidate/getEvents').get(dan_candidate_routes.getEvents);
app.route('/candidate/getAccept_Key').get(dan_candidate_routes.getAccept_Key);
app.route('/candidate/getNote').get(dan_candidate_routes.getNote);

app.route('/candidate/setfName').get(dan_candidate_routes.setfName);
app.route('/candidate/setlName').get(dan_candidate_routes.setlName);
app.route('/candidate/setEmail').get(dan_candidate_routes.setEmail);
app.route('/candidate/setStatus').get(dan_candidate_routes.setStatus);
app.route('/candidate/setEvent').get(dan_candidate_routes.setEvent);
app.route('/candidate/setAccepted').get(dan_candidate_routes.setEventStatus);


//Finish by binding//app.param('candidateId',candidate.candidateByID);


};