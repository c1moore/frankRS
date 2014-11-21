// 'use strict';

// var errorHandler = require('../errors'),
// 	mongoose = require('mongoose'),
// 	User = mongoose.model('User'),
// 	config = require('../../../config/config'),
// 	async = require('async'),
// 	fs = require('fs');

// exports.getPreviewTemplate = function(req, res) {
// 	if(!req.isAuthenticated()) {
// 		res.status(401).send({'message' : 'User is not logged in.'});
// 	} else {
// 		if(!req.hasAuthorization(req.user, ["recruiter", "admin"])) {
// 			res.status(401).send({'message' : 'User does not have permission.'});
// 		} else {
// 			if(req.body.event_name == undefined || req.body.event_id == undefined) {
// 				return res.status(400).send({'message' : 'Event name or id not specified.'});
// 			}

// 			async.parallel([
// 				function(callback) {
// 					var fileName = req.body.event_name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")
// 					fileName = fileName.replace(/\s{2,}/g," ");
// 					fileName = fileName.replace(/ /g, "_");

// 					path = "templates/preview/" + fileName;

// 					fs.readFile(path, {encoding: 'utf8'}, function(err, data) {
// 						if(err)
// 							callback('File not found.', null);
// 						callback(null, data);
// 					});
// 				},
// 				function(callback) {
// 					User.findOne({_id : req.user._id}, function(err, result) {
// 						if(err)
// 							callback(err, null);
// 						else {
// 							var i=0;
// 							for(; i<result.status.length; i++) {
// 								if(result.status[i].event_id.toString() === req.body.event_id.toString()) {
// 									if(result.status[i].recruiter)
// 										callback(null, true);
// 									else
// 										callback(null, false);
// 									break;
// 								}
// 							}

// 							if(i===result.status.length)
// 								callback(null, false);
// 						}
// 					});
// 				}
// 			],
// 				function(err, results) {
// 					if(err) {
// 						return res.status(400).send({message : err});
// 					} else {
// 						if(results[1])
// 							return res.status(200).send({'preview' : results[0]});
// 						else
// 							return res.status(401).send({message : 'You do not have permission to view this template.'});
// 					}
// 				}
// 			);
// 		}
// 	}
// };