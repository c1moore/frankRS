'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};



var CandidateSchema = new Schema({
	fName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	email: {
		type: String,
		unique: 'Email is already associated with a candidate',
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	status: {
		type: String,
		enum: ['volunteer','invited','accepted'],
		default: 'volunteer'
	},
	events: {
		type: [{
			eventsID: {type: Objectid},
			accepted: {type: Boolean, default: 'false'}
		}]

	},
	accept_key: {
		type: string,
		default: 'false'
	},
	note: {
		type: string,
		default: ''
	}


});

CandidateSchema.CreateAcceptKey = function() {
	        var chars = 
"01@2345$6789-ABCDEF+GHIJK=LMNO*PQRSTU#VWXT+Zabcdefghiklmnopqrstuvwxyz"; 
        var randomstring = ''; 
        var string_length = 100;
        for (var i=0; i<string_length; i++) { 
                var rnum = Math.floor(Math.random() * chars.length); 
                randomstring += chars.substring(rnum,rnum+1); 
        }
        return randomstring; 


};







mongoose.model('Candidate', CandidateSchema);