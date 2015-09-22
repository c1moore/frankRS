'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	idvalidator = require('mongoose-id-validator');

/*
* A validation function to check if a required field that has no special needs has a value.
*/
var validateRequired = function(property) {
	return (property && property.length);
};

/*
* A Validation function for the status schema.  While this field is not required for the user to be saved, if the field is
* specified all three subfields must be specified.
*/
var validateOptional = function(property) {
	if(property && property.length)
		return (property.event_id && property.event_id.length && property.attending && property.attending.length && property.recruiter && property.recruiter.length);
	return true;
};

//Create schemas that will be used in arrays.

/**
* Schema for the array of members.
*/
var MemberSchema = new Schema({
	member_id: 	{
		type: Schema.Types.ObjectId,
		ref: 'User',
		validate: [validateRequired, 'Member _id required.'],
		required: true
	}
}, {_id:false});

/**
 * User Schema
 */
var KreweSchema = new Schema({
	kaptain: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		validate: [validateRequired, 'Kaptain required.'],
		required: true
	},
	members: {
		type: [MemberSchema],
		validate: [validateRequired, 'At least one member required.']
	},
	name: {
		type: String,
		required: true,
		validate: [validateRequired, 'Krewe name is required.']
	},
	event_id: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
		validate: [validateRequired, 'Referenced event required.'],
		required: true
	}
});

//Validate that ObjectIds reference actual IDs from other schemas.
MemberSchema.plugin(idvalidator);
KreweSchema.plugin(idvalidator);

mongoose.model('Krewe', KreweSchema);

exports = KreweSchema;
