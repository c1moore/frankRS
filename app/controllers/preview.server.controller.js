'use strict';

var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	config = require('../../config/config'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	_ = require('lodash');

exports.getPreviewTemplate = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({'message' : 'User is not logged in.'});
	} else {
		if(!req.hasAuthorization(req.user, ["recruiter", "admin"])) {
			return res.status(401).send({'message' : 'User does not have permission.'});
		} else {
			if(!req.query.event_name || !req.query.event_id) {
				return res.status(400).send({'message' : 'Event name or id not specified.'});
			}

			async.parallel([
				function(callback) {
					var fileName = req.query.event_name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g,"");
					fileName = fileName.replace(/\s{2,}/g," ");
					fileName = fileName.replace(/ /g, "_");

					var filepath = path.normalize(__dirname + "/../views/templates/preview/" + fileName.toLowerCase() + '.server.view.html');
					//return res.status(400).send({message:filepath});

					fs.readFile(filepath, {encoding: 'utf8'}, function(err, data) {
						if(err) {
							callback(err, null);
						} else {
							callback(null, data);
						}
					});
				},
				function(callback) {
					var query = User.findOne({_id : req.user._id});
					query.populate('status.event_id');
					query.exec(function(err, result) {
						if(_.intersection(result.roles, ["admin"]).length) {
							callback(null, true);
						} else {
							if(err)
								callback(err, null);
							else {
								var i=0;
								for(; i<result.status.length; i++) {
									if((result.status[i].event_id._id.toString() === req.query.event_id.toString()) && (result.status[i].event_id.name === req.query.event_name)) {
										if(result.status[i].recruiter) {
											callback(null, true);
										} else {
											callback(null, false);
										}
										break;
									}
								}

								if(i===result.status.length) {
									callback(null, false);
								}
							}
						}
					});
				}
			],
				function(err, results) {
					if(err) {
						return res.status(400).send({message : err});
					} else {
						if(results[1]) {
							//For now, remove items we do not want.  Eventually we may translate a conditional section in swig to a conditional element in Angular (this would be done by replacing {% if testvar %}{% endif %} => <div ng-if="testvar"></div>)
							var conditonals = /{%.*?%}/g;
							var email_id = /{{email_id}}/g;

							results[0] = results[0].replace(email_id, "");
							results[0] = results[0].replace(conditonals, "");
							
							return res.status(200).send({'preview' : results[0]});
						}
						else
							return res.status(401).send({message : 'You do not have permission to view this template.'});
					}
				}
			);
		}
	}
};