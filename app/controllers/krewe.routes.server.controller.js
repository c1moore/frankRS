'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	Krewe = mongoose.model('Krewe'),
	Email = mongoose.model('Email'),
	config = require('../../config/config'),
	async = require('async');

/**
* Return all users that are attending the specified event and that have not been assigned
* a Krewe already.
*
* @param event_id <ObjectId> the event for which potential users should be returned
* @return users <[Object]> an array of all potential users with the following fields:
*		- _id <ObjectId> the user's _id
*		- fName <String> the user's first name
*		- lName <String> the user's last name
*		- interests <[String]> an array of the user's interests
*/
exports.getPotentialUsers = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin", "kaptain"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);
	User.aggregate([
		{$unwind : "$status"},
		{$match : {
			"status.event_id" : eid,
			"status.attending" : true,
			"status.active" : true,
			$or : [
				{"status.krewe" : ''},
				{"status.krewe" : null},
				{"status.krewe" : undefined},
				{"status.krewe" : false}
			],
			"login_enabled" : true
		}},
		{$group : {
			_id : "$_id",
			fName : {
				$first : "$fName"
			},
			lName : {
				$first : "$lName"
			},
			interests : {
				$first : "$interests"
			}
		}}
	], function(err, users) {
		if(err) {
			console.error(err);
			return res.status(400).send({message : "An error occurred retreiving users.", error : err});
		} else if(users.length === 0) {
			return res.status(200).send([]);
		}

		return res.status(200).send(users);
	});
};

/**
* Return all Krewes that have been saved to the database already for the specified event.
* All user objects of type UserObject in the returned Krewes have the following format:
*		- _id <ObjectId> the user's _id
*		- fName <String> the user's first name
*		- lName <String> the user's last name
*		- interests <[String]> an array of the user's interests
*
* @param event_id <ObjectId> the event for which assigned Krewes should be returned
* @return krewes <[Object]> an array of all saved krewes with the following fields:
*		- _id <ObjectId> the krewe's _id
*		- kaptain <UserObject> the Krewe Kaptain
*		- name <String> the Krewe's name
*		- members <[UserObject]> an array of all the Krewe's members, excluding the Kaptain
*/
exports.getKrewes = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);

	Krewe.
		find({event_id : eid}).
		select('kaptain members name _id').
		populate({
			path: 'kaptain',
			select: '_id fName lName interests',
			model: 'User'
		}).
		populate({
			path: 'members.member_id',
			select: '_id fName lName interests',
			model: 'User'
		}).
		exec(function(err, krewes) {
			if(err) {
				console.error(err);
				return res.status(400).send({message : "An error occurred retreiving krewes.", error : err});
			}

			var krewesObjs = [];
			for(var i = 0; i < krewes.length; i++) {
				krewesObjs[i] = krewes[i].toObject();

				for(var j = krewesObjs[i].members.length - 1; j >= 0; j--) {
					krewesObjs[i].members[j] = krewesObjs[i].members[j].member_id;
				}
			}

			return res.status(200).send(krewesObjs);
		});
};

/**
* Return the Krewe for which this user is a Kaptain that has been saved to the database
* already for the specified event.  All user objects of type UserObject in the returned
* Krewes have the following format:
*		- _id <ObjectId> the user's _id
*		- fName <String> the user's first name
*		- lName <String> the user's last name
*		- interests <[String]> an array of the user's interests
*
* @param event_id <ObjectId> the event for which assigned Krewes should be returned
* @param user_id <ObjectId> the Kaptain's _id.  If not specified, the requester's _id is used
* @return krewes <Object> an array of all saved krewes with the following fields:
*		- _id <ObjectId> the krewe's _id
*		- kaptain <UserObject> the Krewe Kaptain
*		- name <String> the Krewe's name
*		- members <[UserObject]> an array of all the Krewe's members, excluding the Kaptain
*/
exports.getKaptainsKrewe = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin", "kaptain"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	if(req.hasAuthorization(req.user, ["admin", "kreweAdmin"]) && !req.hasAuthorization(req.user, ["kaptain"]) && (!req.body.user_id || !mongoose.Types.ObjectId.isValid(req.body.user_id))) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);
	var uid;

	if(req.body.user_id && mongoose.Types.ObjectId.isValid(req.body.event_id) && req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		uid = new mongoose.Types.ObjectId(req.body.user_id);
	} else {
		uid = new mongoose.Types.ObjectId(req.user._id);
	}

	Krewe.
		findOne({event_id : eid, kaptain : uid}).
		select('members name _id').
		populate({
			path: 'members.member_id',
			select: '_id fName lName interests',
			model: 'User'
		}).
		exec(function(err, krewe) {
			if(err) {
				console.error(err);
				return res.status(400).send({message : "An error occurred retreiving your Krewe.", error : err});
			}

			if(!krewe) {
				return res.status(200).send({});
			}

			var kreweObj = krewe.toObject();

			kreweObj.kaptain = {
				_id : req.user._id.toString(),
				fName : req.user.fName,
				lName : req.user.lName,
				interests : req.user.interests
			};

			for(var index = kreweObj.members.length - 1; index >= 0; index--) {
				kreweObj.members[index] = kreweObj.members[index].member_id;
			}

			return res.status(200).send(kreweObj);
		});
};

/**
* Save all new or updated Krewes to the database given the requesting user has either an
* admin or kreweAdmin role.  Once all records have successfully been saved, all members
* will be notified of any changes.
*
* @param event_id <ObjectId> the event for which the Krewes should be saved
* @param krewes <[Object]> an array of Krewe objects with ALL of the following fields
*		- _id <ObjectId> If this Krewe has been saved to the database already, the
*				Krewe's _id.  Otherwise, this field should evaluate to false.
*		- name <String> the Krewe's name
*		- kaptain_id <ObjectId> the Kaptain's _id
*		- members <[ObjectId]> an array of all the Krewe's members' _ids
*/
exports.saveKrewesAsAdmin = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id.toString()) || !req.body.krewes || !(req.body.krewes instanceof Array)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);
	var modifiedKrewes = req.body.krewes;

	if(Object.prototype.toString.call(modifiedKrewes) !== "[object Array]") {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var krewesCount = modifiedKrewes.length;

	if(krewesCount === 0) {
		return res.status(200).send({message: "No updates."});
	}

	var requiredKreweKeys = ["_id", "name", "kaptain_id", "members"];

	/**
	* First, check to make sure all data is valid.  If any data is not valid, return immediately
	* without saving.
	*/
	var memberIds = [];
	for(var index = 0; index < krewesCount; index++) {
		var krewe = modifiedKrewes[index];

		if(_.union(Object.keys(krewe), requiredKreweKeys).length !== requiredKreweKeys.length) {
			return res.status(400).send({message : "Required fields not specified."});
		}

		if(_.intersection(Object.keys(krewe), requiredKreweKeys).length !== requiredKreweKeys.length) {
			return res.status(400).send({message : "Required fields not specified."});
		}

		if(krewe._id && !mongoose.Types.ObjectId.isValid(krewe._id.toString())) {
			return res.status(400).send({message : "Incorrect data format."});
		}

		if(krewe.kaptain_id === null || !mongoose.Types.ObjectId.isValid(krewe.kaptain_id.toString())) {
			return res.status(400).send({message : "Incorrect data format."});
		}

		if(!(typeof krewe.name === "string")) {
			return res.status(400).send({message : "Incorrect data format."});
		}

		for(var memberIndex = 0, membersCount = krewe.members.length; memberIndex < membersCount; memberIndex++) {
			if(!krewe.members[memberIndex].member_id || !mongoose.Types.ObjectId.isValid(krewe.members[memberIndex].member_id.toString())) {
				return res.status(400).send({message : "Incorrect data format."});
			}

			var member_id = new mongoose.Types.ObjectId(krewe.members[memberIndex].member_id.toString());
			krewe.members[memberIndex] = {member_id: member_id};
			memberIds.push(member_id);
		}
	}

	/**
	* Save each entry.  Since we want to make sure each entry is saved before replying, handle this by using
	* an asynchronous queue.
	*/
	var aqueue = async.queue(function(data, done) {
		if(!data.krewe_id) {
			var newKrewe = new Krewe(data.kreweData);

			newKrewe.save(function(saveErr) {
				if(saveErr) {
					return done(saveErr);
				}

				async.parallel([
					function(next) {
						User.update(
							{
								_id : data.kreweData.kaptain,
								'status.event_id' : eid
							},
							{
								$set : {'status.$.kaptain': true, 'status.$.krewe': newKrewe._id},
								$addToSet : {roles : 'kaptain'}
							},
							next
						);
					}, function(next) {
						User.update(
							{
								_id: {$in: memberIds},
								'status.event_id': eid
							},
							{
								$set: {'status.$.krewe': newKrewe._id}
							},
							{
								multi: true
							},
							next
						);
					}
				], done);
			});
		} else {
			Krewe.findOne({_id : data.krewe_id}, function(searchErr, krewe) {
				if(searchErr) {
					return done(searchErr);
				}

				if(krewe) {
					// Remove fields that could compromise the system.
					delete data.kreweData._id;
					delete data.kreweData.event_id;

					krewe = _.extend(krewe, data.kreweData);

					krewe.save(function(saveErr) {
						if(saveErr) {
							return done(saveErr);
						}

						async.parallel([
							function(next) {
								User.update(
									{
										_id : data.kreweData.kaptain,
										'status.event_id' : eid
									},
									{
										$set : {'status.$.kaptain': true, 'status.$.krewe': krewe._id},
										$addToSet : {roles : 'kaptain'}
									},
									next
								);
							}, function(next) {
								User.update(
									{
										_id: {$in: memberIds},
										'status.event_id': eid
									},
									{
										$set: {'status.$.krewe': krewe._id}
									},
									{
										multi: true
									},
									next
								);
							}
						], done);
					});
				} else {
					// Data may have changed on the server, return an error message.
					done(new Error("Could not update Krewe " + data.krewe_id.toString() + ".  Krewe may have been deleted by another before changes were saved."));
				}
			});
		}
	}, 20);

	var aqueueErrors = [];
	var aqueueCallback = function(err) {
		if(err) {
			console.error(err);
			aqueueErrors.push(err);
		}
	};

	// Return the result of updating the Krewes to the user.
	aqueue.drain = function() {
		if(aqueue.length() === 0 && aqueue.running() === 0) {
			if(aqueueErrors.length) {
				return res.status(400).send({message : "Some Krewes could not be updated.", error : aqueueErrors});
			}

			return res.status(200).send({message : "All Krewes updated successfully."});
		}
	};

	//Add each Krewe to the queue.
	aqueue.pause();
	for(var index = 0; index < krewesCount; index++) {
		var krewe_id;

		if(modifiedKrewes[index]._id) {
			krewe_id = new mongoose.Types.ObjectId(modifiedKrewes[index]._id.toString());
		} else {
			krewe_id = null;
		}

		var aqueueData = {
			krewe_id : krewe_id,
			kreweData : {
				name : modifiedKrewes[index].name,
				kaptain : new mongoose.Types.ObjectId(modifiedKrewes[index].kaptain_id.toString()),
				members : modifiedKrewes[index].members,
				event_id : eid
			}
		};

		aqueue.push(aqueueData, aqueueCallback);
	}
	aqueue.resume();
};

/**
* Save the new or updated Krewe to the database given the requesting user is a kaptain for
* the Krewe.  If any of the members are already assigned to another Krewe, they will not be
* added to the kaptain's krewe.  Once all records have successfully been saved, all members
* will be notified of any changes.
*
* @param event_id <ObjectId> the event for which the Krewes should be saved
* @param krewe <Object> this user's Krewe as an object with ALL of the following fields
*		- _id <ObjectId> the Krewe _id for which this Kaptain is responsible
*		- name <String> the Krewe's name
*		- members <[ObjectId]> an array of all the Krewe's members' _ids
*/
exports.saveKreweAsKaptain = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message : "Use route for admins."});
	}

	if(!req.hasAuthorization(req.user, ["kaptain"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id.toString()) || !req.body.krewe || !(req.body.krewe instanceof Object)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);
	var newKrewe = req.body.krewe;
	var requiredKreweKeys = ["_id", "name", "members"];

	/**
	* First, check to make sure all data is valid.  If any data is not valid, return immediately
	* without saving.
	*/
	if(_.union(Object.keys(newKrewe), requiredKreweKeys).length !== requiredKreweKeys.length) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	if(_.intersection(Object.keys(newKrewe), requiredKreweKeys).length !== requiredKreweKeys.length) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	if(!mongoose.Types.ObjectId.isValid(newKrewe._id.toString())) {
		return res.status(400).send({message : "Incorrect data format."});
	}

	if(!(typeof newKrewe.name === "string")) {
		return res.status(400).send({message : "Incorrect data format."});
	}

	for(var memberIndex = 0, membersCount = newKrewe.members.length; memberIndex < membersCount; memberIndex++) {
		if(!newKrewe.members[memberIndex].member_id || !mongoose.Types.ObjectId.isValid(newKrewe.members[memberIndex].member_id.toString())) {
			return res.status(400).send({message : "Incorrect data format."});
		}

		newKrewe.members[memberIndex] = {member_id : new mongoose.Types.ObjectId(newKrewe.members[memberIndex].member_id.toString())};
	}

	// Everything checked out, save the Krewe to the database.
	Krewe.findOne({_id : newKrewe._id}, function(searchErr, krewe) {
		if(searchErr) {
			console.error(searchErr);
			return res.status(400).send({message : "Error updating Krewe, Krewe could not be updated."});
		}

		if(krewe) {
			if(krewe.kaptain.equals(req.user._id)) {
				krewe.name = newKrewe.name;
				krewe.members = newKrewe.members;

				krewe.save(function(saveErr) {
					if(saveErr) {
						console.error(saveErr);
						return res.status(400).send({message : "Error updating Krewe, Krewe could not be updated."});
					}

					return res.status(200).send({message: "Krewe updated successfully."});
				});
			} else {
				return res.status(401).send({message : "User does not have permission to modify Krewe."});
			}
		}
	});
};

/**
* Delete a specified Krewes from the database if the requesting user is an admin or kreweAdmin.
*
* @param krewe_ids <[ObjectId]> the _id of the Krewe that should be deleted
*/
exports.deleteKrewe = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	var kreweIds = req.body.krewe_ids;
	if(Object.prototype.toString.call(kreweIds) !== "[object Array]") {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var kreweCount = kreweIds.length;
	for(var index = 0; index < kreweCount; index++) {
		if(!mongoose.Types.ObjectId.isValid(kreweIds[index])) {
			return res.status(400).send({message : "Required fields not specified."});
		}

		kreweIds[index] = new mongoose.Types.ObjectId(kreweIds[index]);
	}

	if(kreweCount === 0) {
		return res.status(200).send({message : "No updates."})
	}

	var aqueue = async.queue(function(kreweId, done) {
		Krewe.remove({_id : kreweId}, done);
	}, 20);

	var aqueueErrors = [];
	var aqueueCallback = function(err) {
		if(err) {
			console.error(err);
			aqueueErrors.push(err);
		}
	};

	aqueue.drain = function() {
		if(aqueue.length() === 0 && aqueue.running() === 0) {
			if(aqueueErrors.length) {
				return res.status(400).send({message : "Error removing deleted Krewes.", error : aqueueErrors});
			}

			return res.status(200).send({message : "All deleted Krewes removed successfully."});
		}
	};

	aqueue.pause();
	for(var index = 0; index < kreweCount; index++) {
		aqueue.push(kreweIds[index], aqueueCallback);
	}
	aqueue.resume();
};

/**
* Take Kaptain permissions away from the specified users for the specified event.
*
* @param event_id <ObjectId> the _id of the event for which Kaptain permissions should be removed
* @param user_ids <[ObjectId]> the _id of the users for which Kaptain permissions should be removed
*/
exports.removeKaptainPermissions = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!req.body.event_id || !mongoose.Types.ObjectId.isValid(req.body.event_id)) {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var eid = new mongoose.Types.ObjectId(req.body.event_id);

	var userIds = req.body.user_ids;
	if(Object.prototype.toString.call(userIds) !== "[object Array]") {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var userCount = userIds.length;
	for(var index = 0; index < userCount; index++) {
		if(!mongoose.Types.ObjectId.isValid(userIds[index])) {
			return res.status(400).send({message : "Required fields not specified."});
		}

		userIds[index] = new mongoose.Types.ObjectId(userIds[index]);
	}

	if(userCount === 0) {
		return res.status(200).send({message: "No updates."});
	}

	var aqueue = async.queue(function(userId, done) {
		User.update(
			{
				_id : userId,
				'status.event_id' : eid
			},
			{
				'status.$.kaptain' : false
			},
			function(updateErr) {
				if(updateErr) {
					return done(updateErr);
				}

				// Check if the user is still a kaptain, if not remove the kaptain role.
				User.findOne(
					{
						_id : userId,
						'status.kaptain' : true
					},
					function(searchErr, user) {
						if(searchErr) {
							return done(searchErr);
						}

						if(!user) {
							// The user is no long a Kaptain, remove the kaptain role.
							User.update(
								{_id : userId},
								{
									$pull : {
										roles : "kaptain"
									}
								},
								done
							);
						}
					}
				);
			}
		);
	}, 20);

	var aqueueErrors = [];
	var aqueueCallback = function(err) {
		if(err) {
			console.error(err);
			aqueueErrors.push(err);
		}
	};

	aqueue.drain = function() {
		if(aqueue.length() === 0 && aqueue.running() === 0) {
			if(aqueueErrors.length) {
				return res.status(400).send({message : "Error removing permissions from ex-Kaptains.", error : aqueueErrors});
			}

			return res.status(200).send({message : "All ex-Kaptains updated successfully."});
		}
	};

	aqueue.pause();
	for(var index = 0; index < userCount; index++) {
		aqueue.push(userIds[index], aqueueCallback);
	}
	aqueue.resume();
};

/**
* Removes Krewe information for all specified users for the specified event.  The users will
* no longer belong to a Krewe and will be returned as potential users.
*
* @param event_id <ObjectId> - the _id of the event from which the user's krewe memborship should be revoked
* @param users [<ObjectId>] - an array of _ids for all users that no longer belong to a krewe
*/
exports.revokeUserKreweMembership = function(req, res) {
	if(!req.isAuthenticated()) {
		return res.status(401).send({message : "User is not logged in."});
	}

	if(!req.hasAuthorization(req.user, ["admin", "kreweAdmin"])) {
		return res.status(401).send({message: "User does not have permission."});
	}

	if(!mongoose.Types.ObjectId.isValid(req.body.event_id)) {
		return res.status(400).send({message: "Required fields not specified."});
	}
	var event_id = mongoose.Types.ObjectId(req.body.event_id);

	var userIds = req.body.users;
	if(Object.prototype.toString.call(userIds) !== "[object Array]") {
		return res.status(400).send({message : "Required fields not specified."});
	}

	var userCount = userIds.length;
	for(var index = 0; index < userCount; index++) {
		if(!mongoose.Types.ObjectId.isValid(userIds[index])) {
			return res.status(400).send({message : "Required fields not specified."});
		}

		userIds[index] = new mongoose.Types.ObjectId(userIds[index]);
	}

	var query = User.update(
		{
			_id: 	{
				$in: 				userIds
			},
			"status.event_id": 		event_id
		},
		{
			$set: 	{
				"status.$.krewe": 	"",
				"status.$.kaptain": false
			}
		},
		{
			multi: 	true
		},
		function(err, numAffected) {
			if(err) {
				return res.status(400).send({message: "Error revoking Krewe membership.", error: err});
			}

			return res.status(200).send({message: "Members updated successfully."});
		}
	);
};