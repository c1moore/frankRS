 'use strict';

 /*jshint expr:true */

 /**
	* Module dependencies.
	*/
	var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	superagent=require('superagent'),
	Candidate = mongoose.model('Candidate'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),

	config = require('../../config/config'),
	request = require('supertest');

 /**
	* Globals
	*/
	var candidate1, user, user1,event1,event2,event3;

	function arraysEqual(array0,array1) {
		if (array0.length !== array1.length) return false;
		for (var i = 0; i<array0.length; i++) {
			if (array0[i] !== array1[i]) return false;
		}
		return true;
	}

	describe('Candidate Route Integration Tests:', function() {

		before(function(done){
			event1 = new Event({
				name:  'testing123',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event2 = new Event({
				name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'SFCC',
					schedule: 'www.google.com'
				});
			event3 = new Event({
				name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'Orlando',
					schedule: 'www.google.com'
				});


			event1.save(function() {
				event2.save(function() {
					event3.save(function(err){
					//	console.log(err);
						user = new User({
							fName: 'Test',
							lName: 'ing',
							roles: ['admin'],
							email: 'test@test.com',
							password: 'password',
							login_enable: true

						});

						candidate1 = new Candidate({
							fName : 'Full',
							lName : 'Name',
							email : 'test@test.com',
							status : 'volunteer',
							events: [{eventsID: event1._id, accepted: false},{eventsID:event2._id,accepted:false}],
							note : 'this is a test'
						});
						
						user.save(function(err, res) {
							user1 = superagent.agent();
							user1
							.post('http://localhost:3001/auth/signin')
							.send({'email': user.email, 'password': 'password'})
							.end(function (err, res) {
								done();
							});
						});
					});
				});
			});

		});

 it("should save the user.", function(done) {
	var query = User.findOne({"email" : user.email});
	query.exec(function(err, res) {
		done(err);
	});
 });

 it("should be able to access the main page from the candidate route testing mechanism", function(done) {
	request('http://localhost:3001')
	.get('/')
	.expect(200);
	done();
 });

 it("should be able to get the candidate first name", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getfName')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('fName');
			res.body.fName.should.be.equal('Full');
			done();
		});
	});
 });


 it("should be able to get the candidate last name", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getlName')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('lName');
			res.body.lName.should.be.equal('Name');
			done();
		});
	});
 });


 it("should be able to get the candidate email", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getEmail')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('email');
			res.body.email.should.be.equal('test@test.com');
			done();
		});
	});
 });
 it("should be able to get the candidate status", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getStatus')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('status');
			res.body.status.should.be.equal('volunteer');
			done();
		});
	});
 });


 it("should be able to get the candidate accept_key", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getAccept_Key')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('accept_key');
			res.body.accept_key.should.be.equal('false');
			done();
		});
	});
 });
 it("should be able to get the candidate EventsID", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getEvents')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('events');
			(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
			(res.body.events[0].accepted.toString()).should.be.equal('false');
			(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
			(res.body.events[1].accepted.toString()).should.be.equal('false');
			done();
		});
	});
 });
 it("should be able to get the candidate note", function(done) {
	candidate1.save(function(err) {
		user1
		.get('http://localhost:3001/candidate/getNote')
		.send({candidateID: candidate1._id})
		.end(function(err,res) {
			if (err) throw err;
			res.status.should.equal(200);
			res.body.should.have.property('note');
			res.body.note.should.be.equal('this is a test');
			done();
		});
	});
 });

 it("should be able to set the candidate first name", function(done) {
	user1
	.get('http://localhost:3001/candidate/setfName')
	.send({candidateID: candidate1._id,newfName:'dan'})
	.end(function(err,res) {
		if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('dan');
						done();
					});
		});

 });
 it("should be able to set the candidate last name", function(done) {
	user1
	.get('http://localhost:3001/candidate/setlName')
	.send({candidateID: candidate1._id,newlName:'pickle'})
	.end(function(err,res) {
		if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getlName')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('lName');
						res1.body.lName.should.be.equal('pickle');
						done();
					});
		});

 });

 it("should be able to set the candidate email", function(done) {
	user1
	.get('http://localhost:3001/candidate/setEmail')
	.send({candidateID: candidate1._id,newEmail:'DanP@test.com'})
	.end(function(err,res) {
		if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getEmail')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('email');
						res1.body.email.should.be.equal('DanP@test.com');
						done();
					});
		});

 });
 it("should be able to set the candidate status", function(done) {
	user1
	.get('http://localhost:3001/candidate/setStatus')
	.send({candidateID: candidate1._id,newStatus:'accepted'})
	.end(function(err,res) {
		if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getStatus')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('status');
						res1.body.status.should.be.equal('accepted');
						done();
					});
		});

 });
 
	it("should be able to add(set) candidate event", function(done) {
		user1
			.get('http://localhost:3001/candidate/setEvent')
			.send({candidateID: candidate1._id,newEvent:{eventsID: event3._id, accepted: true}})
			.end(function(err,res) {
				if (err) throw err;

				res.status.should.equal(200);
				
				user1
					.get('http://localhost:3001/candidate/getEvents')
					.send({candidateID: candidate1._id})
					.end(function(err,res) {
						if (err) throw err;

						res.status.should.equal(200);
						res.body.should.have.property('events');

						(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
						(res.body.events[0].accepted.toString()).should.be.equal('false');
						(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
						(res.body.events[1].accepted.toString()).should.be.equal('false');
						(res.body.events[2].eventsID.toString()).should.be.equal(event3._id.toString());
						(res.body.events[2].accepted.toString()).should.be.equal('true');

						done();
					});
			});
	});

	it("should be able to set candidate event accepted field", function(done) {
		user1
			.get('http://localhost:3001/candidate/setAccepted')
			.send({'candidateID' : candidate1._id, 'eventsID': event2._id, 'accepted': true})
			.end(function(err,res) {
				if (err) throw err;
				
				res.status.should.equal(200);
				
				candidate1.save(function(err) {
					user1
						.get('http://localhost:3001/candidate/getEvents')
						.send({candidateID: candidate1._id})
						.end(function(err,res) {
							if (err) throw err;
							
							res.status.should.equal(200);
							res.body.should.have.property('events');
						
							(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
							(res.body.events[0].accepted.toString()).should.be.equal('false');
							(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
							(res.body.events[1].accepted.toString()).should.be.equal('true');
							(res.body.events[2].eventsID.toString()).should.be.equal(event3._id.toString());
							(res.body.events[2].accepted.toString()).should.be.equal('true');
							
							done();
						});
				});
			});
	});

 it("should be able to set the candidate status", function(done) {
	user1
	.get('http://localhost:3001/candidate/setNote')
	.send({candidateID: candidate1._id,newNote:'I have changed the candidate note'})
	.end(function(err,res) {
		if (err) throw err;
			res.status.should.equal(200);
			
			user1
			.get('http://localhost:3001/candidate/getNote')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('note');
						res1.body.note.should.be.equal('I have changed the candidate note');
						done();
					});
		});

 });

 after(function(done) {
	candidate1.remove();
	user.remove();
	event1.remove();
	event2.remove();
	event3.remove();
	done();
 });
}); 