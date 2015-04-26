'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    errorHandler = require('./errors'),
    fs = require('fs'),
    path = require('path');

/**
 * Return image to the requester.  If rid and uemail are specified, the entry in the
 * recruiter's inviteeList/attendeeList will be updated to show the invitee has read
 * their invitation.
 *
 * @param rid _id field of recruiter that sent the invitation
 * @param uemail email of the user that received the invitation
 * @param eid _id field of event for which the invitation was sent
 */
exports.sendImage = function(req, res) {
	if(req.query.rid && req.query.uemail && req.query.eid) {
		//Update recruiter's lists.
		User.findOne({_id : new mongoose.Types.ObjectId(req.query.rid)}, function(err, recruiter) {
			if(err) {
				return res.status(400).send();
			}
			if(!recruiter) {
				return res.status(400).send();
			}

			User.findOne({email : req.query.uemail}, function(err, invitee) {
				if(err) {
					return res.status(400).send();
				}
				if(!invitee) {
					return res.status(400).send();
				}

				var i = 0;
				var user_id = invitee._id.toString();
				var event_id = req.query.eid.toString();
				if(recruiter.inviteeList) {
					for(; i < recruiter.inviteeList.length; i++) {
						if(recruiter.inviteeList[i].user_id.toString() === user_id && recruiter.inviteeList[i].event_id.toString() === event_id) {
							recruiter.inviteeList[i].read = true;
							break;
						}
					}
				}

				if(!recruiter.inviteeList || i === recruiter.inviteeList.length) {
					//Invitee not found in inviteeList, check attendeeList.
					if(recruiter.attendeeList) {
						for(i = 0; i < recruiter.attendeeList.length; i++) {
							if(recruiter.attendeeList[i].user_id.toString() === user_id && recruiter.attendeeList[i].event_id.toString() === event_id) {
								recruiter.attendeeList[i].read = true;
								break;
							}
						}
					}

					if(!recruiter.attendeeList || i === recruiter.attendeeList.length) {
						//Invitee not found in attendeeList, check almostList.
						if(recruiter.almostList) {
							for(i = 0; i < recruiter.almostList.length; i++) {
								if(recruiter.almostList[i].user_id.toString() === user_id && recruiter.almostList[i].event_id.toString() === event_id) {
									recruiter.almostList[i].read = true;
									break;
								}
							}
						}

						if(!recruiter.almostList || i === recruiter.almostList.length) {
							//User not found, return error.
							return res.status(400).send();
						}
					}
				}

				recruiter.save(function(err) {
					if(err) {
						return res.status(400).send();
					}

					var filepath = path.join(__dirname, "..", "..", "public/modules/core/img/brand/logo.png");
					var fileStats = fs.statSync(filepath);

					res.writeHead(200, {
						'Content-Type' : 'image/gif',
						'Content-Length' : fileStats.size
					});

					var readStream = fs.createReadStream(filepath);
					readStream.pipe(res);
				});
			});
		});
	} else if(!req.query.rid && !req.query.uemail && !req.query.eid){
		//Just return the image.
		var filepath = path.join(__dirname, "..", "..", "public/modules/core/img/brand/logo.png");
		var fileStats = fs.statSync(filepath);

		res.writeHead(200, {
			'Content-Type' : 'image/gif',
			'Content-Length' : fileStats.size
		});

		var readStream = fs.createReadStream(filepath);
		readStream.pipe(res);
	} else {
		return res.status(400).send();
	}
};