'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	/**
 * A Validation function for local strategy properties
 */
//var validateLocalStrategyProperty = function(property) {
//	return ((this.provider !== 'local' && !this.updated) || property.length>0);
//};



var CandidateSchema = new Schema({
	fName: {
		type: String,
		trim: true,
		//validate: [validateLocalStrategyProperty, 'Please fill in your first name']
		require: 'First name required.'
	},
	lName: {
		type: String,
		trim: true,
		//validate: [validateLocalStrategyProperty, 'Please fill in your last name']
		require: "Last name required."
	},
	email: {
		type: String,
		unique: 'Email is already associated with a candidate',
		trim: true,
		default: '',
		require: "Email address required.",
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	status: {
		type: String,
		enum: ['volunteer','invited','accepted'],
		default: 'volunteer'
	},
	events: {
		type: [{
			eventsID: {type: mongoose.Schema.Types.ObjectId},
			accepted: {type: Boolean, default: 'false'}
		}]

	},
	accept_key: {
		type: String,
		default: 'false'
	},
	note: {
		type: String,
		default: ''
	}


});

CandidateSchema.CreateAcceptKey = function() {
	    var chars = "01@2345$6789-ABCDEF+GHIJK=LMNO*PQRSTU#VWXT+Zabcdefghiklmnopqrstuvwxyz"; 
        var randomstring = ''; 
        var string_length = 100;
        for (var i=0; i<string_length; i++) { 
                var rnum = Math.floor(Math.random() * chars.length); 
                randomstring += chars.substring(rnum,rnum+1); 
        }
        return randomstring; 


};







mongoose.model('Candidate', CandidateSchema);