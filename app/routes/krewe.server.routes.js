'use strict';

//Krewe Routes
var krewe_routes = require('../../app/controllers/krewe.routes.server.controller.js');

module.exports = function(app){
	// Setup routes to obtain Krewes
	app.route('/krewes').post(krewe_routes.getKrewes);
	app.route('/krewe').post(krewe_routes.getKaptainsKrewe);

	// Setup routes to obtain information for creating Krewes
	app.route('/krewes/users').post(krewe_routes.getPotentialUsers);

	// Setup routes to save changes
	app.route('/save/krewes').post(krewe_routes.saveKrewesAsAdmin);
	app.route('/save/krewe').post(krewe_routes.saveKreweAsKaptain);
	app.route('/remove/krewes').post(krewe_routes.deleteKrewe);
	app.route('/remove/kaptain').post(krewe_routes.removeKaptainPermissions);
	app.route('/remove/krewe_members').post(krewe_routes.revokeUserKreweMembership);
};
