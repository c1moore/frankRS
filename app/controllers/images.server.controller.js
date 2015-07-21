'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    Email = mongoose.model('Email'),
    errorHandler = require('./errors'),
    fs = require('fs'),
    path = require('path');

/**
 * Return image to the requester.  If eid is not specified, either the specified image or the default
 * image will be returned.  The default image is the logo.png image located in
 * public/modules/core/img/email.
 *
 * @param eid _id	field of email document to update
 * @param image 	file to return
 */
exports.sendImage = function(req, res) {
	if(req.query.eid) {
		//Send the image immediately.
		var filepath;
		if(req.query.image) {
			filepath = path.join(__dirname, "..", "..", "public/modules/core/img/email/", req.query.image);
		} else {
			filepath = path.join(__dirname, "..", "..", "public/modules/core/img/email/logo.png");
		}
		var fileStats = fs.statSync(filepath);

		res.writeHead(200, {
			'Content-Type' : 'image/gif',
			'Content-Length' : fileStats.size
		});

		var readStream = fs.createReadStream(filepath);
		readStream.pipe(res);

		//Update email entry for this email.
		var email_id = mongoose.Types.ObjectId(req.query.eid);
		Email.findOne({_id : email_id}, function(err, email) {
			if(!err) {
				if(email) {
					email.read = true;
					email.save(function(err) {
						if(err) {
							console.log("Error updating emails for record " + email._id.toString());
						}
					});
				} else {
					console.log("Email document not found for " + req.query.eid);
				}
			} else {
				console.log("Error2 updating emails for record " + email._id.toString());
			}
		});
	} else {
		//Just return the frank logo.
		var filepath;
		if(req.query.image) {
			filepath = path.join(__dirname, "..", "..", "public/modules/core/img/email/", req.query.image);
		} else {
			filepath = path.join(__dirname, "..", "..", "public/modules/core/img/email/logo.png");
		}
		var fileStats = fs.statSync(filepath);

		res.writeHead(200, {
			'Content-Type' : 'image/gif',
			'Content-Length' : fileStats.size
		});

		var readStream = fs.createReadStream(filepath);
		readStream.pipe(res);
	}
};