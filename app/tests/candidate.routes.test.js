// 'use strict';

// /*jshint expr:true */

// /**
//  * Module dependencies.
//  */
//  var should = require('should'),
//  mongoose = require('mongoose'),
//  http = require('http'),
//  superagent=require('superagent'),
//  candidate = mongoose.model('Candidate'),
//  User = mongoose.model('User'),
//  config = require('../../config/config'),
//  request = require('supertest');

// /**
//  * Globals
//  */
//  var candidate1, duplicate, user, user1;

//  function arraysEqual(array0,array1) {
//  	if (array0.length !== array1.length) return false;
//  	for (var i = 0; i<array0.length; i++) {
//  		if (array0[i] !== array1[i]) return false;
//  	}
//  	return true;
//  }

//  describe('Candidate Route Tests:', function() {

//  	describe('Method Save', function() {
//  		before(function(done){
//  			user = new User({
//  				fName: 'Test',
//  				lName: 'ing',
//  				roles: ['admin'],
//  				email: 'test@test.com',
//  				password: 'password',
//  				login_enable: true

//  			});

//  			user.save(function(err){
//  				if(err)throw err;



//  				user1 = superagent.agent('http://localhost:3001');
//  				user1.post('/auth/signin')
//  				.send({username: 'test@test.com', password: 'password'})
// 			//.expect(200)
// 			.end(function (err, res) {
// 				console.log(res.body);

// 				done();
// 			});
// 		});
//  		});
//  		beforeEach(function(done) {
//  			candidate1 = new candidate({
//  				fName : 'Full',
//  				lName : 'Name',
//  				email : 'test@test.com',
//  				status : 'volunteer',
//  				note : 'this is a test'
//  			});
//  			duplicate = new candidate({
//  				fName : 'Full',
//  				lName : 'Name',
//  				email : 'test@test.com',
//  				status : 'volunteer',
//  				note : 'testing'
//  			});

 			
//  			done();
//  		});



//  		it("should be able to access the main page from the candidate route testing mechanism", function(done) {
//  			request('http://localhost:3001')
//  			.get('/')
//  			.expect(200);
//  			done();
//  		});


//  		it("should be able to get the candidate first name", function(done) {
//  			candidate1.save(function(err) {
//  				user1
//  				.get('/candidate/getfName')
//  				.send({candidateID: candidate1._id})
//  				//.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('fName');
//  					res.body.lName.should.be.equal('Full');

//  					done();
//  				});
//  			});
//  		});


//  		it("should be able to get the candidate last name", function(done) {
//  			candidate1.save(function(err) {
//  				request('http://localhost:3001')
//  				.get('/candidate/getlName')
//  				.send({candidateID: candidate1._id})
//  				.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('lName');
//  					res.body.lName.should.be.equal('Name');

//  					done();
//  				});
//  			});
//  		});

//  		it("should be able to get the candidate email", function(done) {
//  			candidate1.save(function(err) {
//  				request('http://localhost:3001')
//  				.get('/candidate/getEmail')
//  				.send({candidateID: candidate1._id})
//  				.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('email');
//  					res.body.email.should.be.equal('test@test.com');

//  					done();
//  				});
//  			});
//  		});
//  		it("should be able to get the candidate status", function(done) {
//  			candidate1.save(function(err) {
//  				request('http://localhost:3001')
//  				.get('/candidate/getStatus')
//  				.send({candidateID: candidate1._id})
//  				.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('status');
//  					res.body.status.should.be.equal('volunteer');
//  					done();
//  				});
//  			});
//  		});
//  		it("should be able to get the candidate accept_key", function(done) {
//  			candidate1.save(function(err) {
//  				request('http://localhost:3001')
//  				.get('/candidate/getAccept_Key')
//  				.send({candidateID: candidate1._id})
//  				.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('accept_key');
//  					res.body.accept_key.should.be.equal('false');
//  					done();
//  				});
//  			});
//  		});
//  		it("should be able to get the candidate note", function(done) {
//  			candidate1.save(function(err) {
//  				request('http://localhost:3001')
//  				.get('/candidate/getNote')
//  				.send({candidateID: candidate1._id})
//  				.expect(200)
//  				.end(function(err,res) {
//  					if (err) throw err;
//  					res.body.should.have.property('note');
//  					res.body.note.should.be.equal('this is a test');

//  					done();
//  				});
//  			});
//  		});

//  		afterEach(function(done) {
//  			candidate1.remove();
//  			duplicate.remove();
//  			user.remove();
//  			done();
//  		});


//  	});
// });
