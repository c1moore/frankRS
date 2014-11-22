'use strict';

//Routes to get info from Comment
var james_comment_routes = require('../../app/controllers/comment.routes.server.controller.js');

module.exports = function(app) {

	// Event Routes
	app.route('/comments/getCommentObj').get(james_comment_routes.getCommentObj);
	app.route('/comments/getSocialCommentsForEvent').get(james_comment_routes.getSocialCommentsForEvent);
	app.route('/comments/getRecruiterCommentsForEvent').get(james_comment_routes.getRecruiterCommentsForEvent);
	app.route('/comments/postCommentSocial').post(james_comment_routes.postCommentSocial);
	app.route('/comments/postCommentRecruiter').post(james_comment_routes.postCommentRecruiter);
	app.route('/comments/delete').post(james_comment_routes.delete);

};
