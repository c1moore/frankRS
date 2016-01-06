'use strict';

/*jshint expr:true */

/**
* Module dependencies.
*/
var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest'),
	agent=require('superagent'),
	Krewe = mongoose.model('Krewe'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),
	async = require('async'),
	_ = require('lodash');

/**
* Globals
*/
var krewe1, krewe2, kaptain1, kaptain2, member1, member2, member3, event1, event2, admin, kreweAdmin,
	kaptain1Agent = agent.agent(), kaptain2Agent = agent.agent(), adminAgent = agent.agent(), kreweAdminAgent = agent.agent();

describe('Krewe Routes Integration Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove(function(removeUserErr) {
			if(removeUserErr) {
				return done(removeUserErr);
			}

			Event.remove(function(removeEventErr) {
				if(removeEventErr) {
					return done(removeEventErr);
				}

				Krewe.remove(function(removeKreweErr) {
					if(removeKreweErr) {
						return done(removeKreweErr);
					}

					var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
					var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
					var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day

					event1 = new Event({
						name:  'testing1231',
						start_date: startDate,
						end_date:  endDate,
						location: 'UF',
						schedule: 'www.google.com',
						capacity: 50
					});

					event2 = new Event({
						name:  'testing1232',
						start_date: startDate,
						end_date:  endDate,
						location: 'SFCC',
						schedule: 'www.google.com',
						capacity: 50
					});

					event1.save(function(event1Err) {
						if(event1Err) {
							return done(event1Err);
						}

						event2.save(function(event2Err) {
							if(event2Err) {
								return done(event2Err);
							}

							admin = new User({
								fName: 			'Frank',
								lName: 			'Karel',
								displayName: 	'Karel, Frank',
								roles: 			['admin'],
								email: 			'frank_admin_cen3031.0.boom0625@spamgourmet.com',
								password: 		'password',
								login_enabled: 	true
							});

							admin.save(function(adminErr) {
								if(adminErr) {
									return done(adminErr);
								}

								adminAgent
									.post('http://localhost:3001/auth/signin')
									.send({email : admin.email, password : 'password'})
									.end(function(adminLoginErr, res) {
										if(adminLoginErr) {
											return done(adminLoginErr);
										}

										res.status.should.equal(200);

										done();
									});
							});
						});
					});
				});				
			});
		});
	});

	beforeEach(function(done) {
		kaptain1 = new User({
			fName: 			'Ann',
			lName: 			'Christiano',
			displayName: 	'Christiano, Ann',
			email: 			'achristano_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['kaptain', 'attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	true
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		kaptain2 = new User({
			fName: 			'Ellen',
			lName: 			'Nodine',
			displayName: 	'Nodine, Ellen',
			email: 			'enodine_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	true
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		member1 = new User({
			fName: 			'Waylon',
			lName: 			'Jennings',
			displayName: 	'Jennings, Waylon',
			email: 			'waylon_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true,
			interests: 		['programming']
		});

		member2 = new User({
			fName: 			'Uncle',
			lName: 			'Sam',
			displayName: 	'Sam, Uncle',
			email: 			'us_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		member3 = new User({
			fName: 			'Bruce',
			lName: 			'Wayne',
			displayName: 	'Wayne, Bruce',
			email: 			'batman_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	false
				},
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		kreweAdmin = new User({
			fName: 			'Rowdy',
			lName: 			'Yates',
			displayName: 	'Yates, Rowdy',
			email: 			'rowdy_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee', 'kreweAdmin'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	false,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		async.parallel(
			[
				function(callback) {
					kaptain1.save(callback);
				},
				function(callback) {
					kaptain2.save(callback);
				},
				function(callback) {
					member1.save(callback);
				},
				function(callback) {
					member2.save(callback);
				},
				function(callback) {
					member3.save(callback);
				},
				function(callback) {
					kreweAdmin.save(callback);
				}
			],
			function(saveErr) {
				if(saveErr) {
					return done(saveErr);
				}

				krewe1 = new Krewe({
					kaptain: 	kaptain1._id,
					members: 	[
						{
							member_id: 	member1._id
						}
					],
					name: 		'Alpha Krewe',
					event_id: 	event1._id
				});

				krewe2 = new Krewe({
					kaptain: 	kaptain2._id,
					members: 	[
						{
							member_id: 	member1._id
						},
						{
							member_id: 	member2._id
						}
					],
					name: 		'Krewe Awesome',
					event_id: 	event1._id
				});

				kaptain1.status[0].krewe = krewe1._id.toString();
				kaptain2.status[0].krewe = krewe2._id.toString();
				member1.status[0].krewe = krewe1._id.toString();
				member2.status[0].krewe = krewe2._id.toString();

				async.parallel(
					[
						function(callback) {
							krewe1.save(callback);
						},
						function(callback) {
							krewe2.save(callback);
						},
						function(callback) {
							kaptain1.save(callback);
						},
						function(callback) {
							kaptain2.save(callback);
						},
						function(callback) {
							member1.save(callback);
						},
						function(callback) {
							member2.save(callback);
						},
						function(next) {
							kaptain1Agent
								.post('http://localhost:3001/auth/signin')
								.send({email : kaptain1.email, password : 'password'})
								.end(function(err, res) {
									if(err) {
										return next(err);
									}

									if(res.status !== 200) {
										return next(new Error("Kaptain 1 could not sign in."));
									}

									next(null);
								});
						},
						function(next) {
							kaptain2Agent
								.post('http://localhost:3001/auth/signin')
								.send({email : kaptain2.email, password : 'password'})
								.end(function(err, res) {
									if(err) {
										return next(err);
									}

									if(res.status !== 200) {
										return next(new Error("Kaptain 2 could not sign in."));
									}

									next(null);
								});
						},
						function(next) {
							kreweAdminAgent
								.post('http://localhost:3001/auth/signin')
								.send({email : kreweAdmin.email, password : 'password'})
								.end(function(err, res) {
									if(err) {
										return next(err);
									}

									if(res.status !== 200) {
										return next(new Error("Krewe Admin could not sign in."));
									}

									next(null);
								});
						}
					],
					done
				);
			}
		);
	});

	it('should return all users that are not assigned to a Krewe, but are attending the event if the requesting user is an admin.', function(done) {
		this.timeout(10000);
		var tempMember = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempMember.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			adminAgent
				.post('http://localhost:3001/krewes/users')
				.send({event_id : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					for(var i = 0; i < res.body.length; i++) {
						if(res.body[i]._id !== tempMember._id.toString() && res.body[i]._id !== member3._id.toString() && res.body[i]._id !== kreweAdmin._id.toString()) {
							return done(new Error('Error finding correct potential users.'));
						}
					}

					tempMember.remove(done);
				});
		});
	});

	it('should return all users that are not assigned to a Krewe, but are attending the event if the requesting user is a kreweAdmin.', function(done) {
		this.timeout(10000);
		var tempMember = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempMember.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			kreweAdminAgent
				.post('http://localhost:3001/krewes/users')
				.send({event_id : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					for(var i = 0; i < res.body.length; i++) {
						if(res.body[i]._id !== tempMember._id.toString() && res.body[i]._id !== member3._id.toString() && res.body[i]._id !== kreweAdmin._id.toString()) {
							return done(new Error('Error finding correct potential users.'));
						}
					}

					tempMember.remove(done);
				});
		});
	});

	it('should return all users that are not assigned to a Krewe, but are attending the event if the requesting user is a kaptain.', function(done) {
		this.timeout(10000);
		var tempMember = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event1._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempMember.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			kaptain1Agent
				.post('http://localhost:3001/krewes/users')
				.send({event_id : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					for(var i = 0; i < res.body.length; i++) {
						if(res.body[i]._id !== tempMember._id.toString() && res.body[i]._id !== member3._id.toString() && res.body[i]._id !== kreweAdmin._id.toString()) {
							return done(new Error('Error finding correct potential users.'));
						}
					}

					tempMember.remove(done);
				});
		});
	});

	it('should return an error when a recruiter requests to see all users that are not assigned to a Krewe.', function(done) {
		this.timeout(10000);
		var tempRecruiter = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiter.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAgent = agent.agent();
			tempRecruiterAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiter.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAgent.saveCookies(loginRes);

					tempRecruiterAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiter.remove(done);
						});
				});
		});
	});

	it('should return an error when an attendee requests to see all users that are not assigned to a Krewe.', function(done) {
		this.timeout(10000);
		var tempAttendee = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempAttendee.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempAttendeeAgent = agent.agent();
			tempAttendeeAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempAttendee.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempAttendeeAgent.saveCookies(loginRes);

					tempAttendeeAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempAttendee.remove(done);
						});
				});
		});
	});

	it('should return an error when a recruiterAdmin requests to see all users that are not assigned to a Krewe.', function(done) {
		this.timeout(10000);
		var tempRecruiterAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiterAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAdminAgent = agent.agent();
			tempRecruiterAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiterAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAdminAgent.saveCookies(loginRes);

					tempRecruiterAdminAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiterAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when a userAdmin requests to see all users that are not assigned to a Krewe.', function(done) {
		this.timeout(10000);
		var tempUserAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUserAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAdminAgent = agent.agent();
			tempUserAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUserAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAdminAgent.saveCookies(loginRes);

					tempUserAdminAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempUserAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when a nonauthenticated user requests to see all users that are not assigned to a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = agent.agent();
		tempUser
			.post('http://localhost:3001/krewes/users')
			.send({event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User is not logged in.");

				done();
			});
	});

	it('should return an error when the user requests to see potential users for a Krewe without sending the event _id.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewes/users')
			.send({event_id : null})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when the user requests to see potential users for a Krewe with an invalid event _id.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewes/users')
			.send({event_id : "null"})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return all the Krewes when the requesting user is an admin.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewes')
			.send({event_id : event1._id})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.length.should.equal(2);

				for(var kreweCounter = 0; kreweCounter < res.body.length; kreweCounter++) {
					var krewe = res.body[kreweCounter];

					if(krewe._id.toString() === krewe1._id.toString()) {
						// Make sure all expected fields were returned and the subdocuments were populated.
						krewe.name.should.equal(krewe1.name);
						
						krewe.kaptain._id.toString().should.equal(krewe1.kaptain.toString());
						krewe.kaptain.fName.should.equal(kaptain1.fName);
						krewe.kaptain.lName.should.equal(kaptain1.lName);

						krewe.members[0]._id.toString().should.equal(member1._id.toString());
						krewe.members[0].fName.should.equal(member1.fName);
						krewe.members[0].lName.should.equal(member1.lName);
					} else if(res.body[kreweCounter]._id.toString() === krewe2._id.toString()) {
						// Make sure all expected fields were returned and the subdocuments were populated.
						krewe.name.should.equal(krewe2.name);
						
						krewe.kaptain._id.toString().should.equal(krewe2.kaptain.toString());
						krewe.kaptain.fName.should.equal(kaptain2.fName);
						krewe.kaptain.lName.should.equal(kaptain2.lName);

						for(var memberCounter = 0; memberCounter < krewe.members.length; memberCounter++) {
							var member = krewe.members[memberCounter],
								originalMember;

							if(member._id.toString() === member1._id.toString()) {
								originalMember = member1;
							} else if(member._id.toString() === member2._id.toString()) {
								originalMember = member2;
							} else {
								return done(new Error("Unkown member found."));
							}

							member.fName.should.equal(originalMember.fName);
							member.lName.should.equal(originalMember.lName);
						}
					} else {
						return done(new Error("Unknown Krewe returned."));
					}
				}

				done();
			});
	});

	it('should return all the Krewes when the requesting user is a kreweAdmin.', function(done) {
		this.timeout(10000);
		kreweAdminAgent
			.post('http://localhost:3001/krewes')
			.send({event_id : event1._id})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.length.should.equal(2);

				for(var kreweCounter = 0; kreweCounter < res.body.length; kreweCounter++) {
					var krewe = res.body[kreweCounter];

					if(krewe._id.toString() === krewe1._id.toString()) {
						// Make sure all expected fields were returned and the subdocuments were populated.
						krewe.name.should.equal(krewe1.name);
						
						krewe.kaptain._id.toString().should.equal(krewe1.kaptain.toString());
						krewe.kaptain.fName.should.equal(kaptain1.fName);
						krewe.kaptain.lName.should.equal(kaptain1.lName);

						krewe.members[0]._id.toString().should.equal(member1._id.toString());
						krewe.members[0].fName.should.equal(member1.fName);
						krewe.members[0].lName.should.equal(member1.lName);
					} else if(res.body[kreweCounter]._id.toString() === krewe2._id.toString()) {
						// Make sure all expected fields were returned and the subdocuments were populated.
						krewe.name.should.equal(krewe2.name);
						
						krewe.kaptain._id.toString().should.equal(krewe2.kaptain.toString());
						krewe.kaptain.fName.should.equal(kaptain2.fName);
						krewe.kaptain.lName.should.equal(kaptain2.lName);

						for(var memberCounter = 0; memberCounter < krewe.members.length; memberCounter++) {
							var member = krewe.members[memberCounter],
								originalMember;

							if(member._id.toString() === member1._id.toString()) {
								originalMember = member1;
							} else if(member._id.toString() === member2._id.toString()) {
								originalMember = member2;
							} else {
								return done(new Error("Unkown member found."));
							}

							member.fName.should.equal(originalMember.fName);
							member.lName.should.equal(originalMember.lName);
						}
					} else {
						return done(new Error("Unknown Krewe returned."));
					}
				}

				done();
			});
	});

	it('should return an error when the user is requesting all Krewes and is a kaptain.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewes')
			.send({event_id : event1._id})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User does not have permission.");

				done();
			});
	});

	it('should return an error when the user is requesting all Krewes and is a recruiter.', function(done) {
		this.timeout(10000);
		var tempRecruiter = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiter.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAgent = agent.agent();
			tempRecruiterAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiter.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAgent.saveCookies(loginRes);

					tempRecruiterAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiter.remove(done);
						});
				});
		});
	});

	it('should return an error when the user is requesting all Krewes and is an attendee.', function(done) {
		this.timeout(10000);
		var tempAttendee = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempAttendee.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempAttendeeAgent = agent.agent();
			tempAttendeeAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempAttendee.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempAttendeeAgent.saveCookies(loginRes);

					tempAttendeeAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempAttendee.remove(done);
						});
				});
		});
	});

	it('should return an error when the user is requesting all Krewes and is a recruiterAdmin.', function(done) {
		this.timeout(10000);
		var tempRecruiterAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiterAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAdminAgent = agent.agent();
			tempRecruiterAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiterAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAdminAgent.saveCookies(loginRes);

					tempRecruiterAdminAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiterAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when the user is requesting all Krewes and is a userAdmin.', function(done) {
		this.timeout(10000);
		var tempUserAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUserAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAdminAgent = agent.agent();
			tempUserAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUserAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAdminAgent.saveCookies(loginRes);

					tempUserAdminAgent
						.post('http://localhost:3001/krewes/users')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempUserAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when the user is requesting all Krewes and is not an authenticated user.', function(done) {
		this.timeout(10000);
		var tempUser = agent.agent();
		tempUser
			.post('http://localhost:3001/krewes/users')
			.send({event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User is not logged in.");

				done();
			});
	});

	it('should return an error when requesting all Krewes without the event_id.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewes')
			.send({event_id : null})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when requesting all Krewes with an invalid event_id.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewes')
			.send({event_id : "null"})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return the requesting Kaptain\'s Krewe when they are requesting it and the event_id is specified.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewe')
			.send({event_id : event1._id})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.should.have.property('members');

				res.body.name.should.equal(krewe1.name);
				res.body._id.toString().should.equal(krewe1._id.toString());

				res.body.members.length.should.equal(1);

				var member = res.body.members[0];
				member.should.have.property('_id');
				member.should.have.property('fName');
				member.should.have.property('lName');
				member.should.have.property('interests');

				member._id.toString().should.equal(member1._id.toString());
				member.fName.should.equal(member1.fName);
				member.lName.should.equal(member1.lName);
				member.interests[0].should.equal(member1.interests[0]);

				done();
			});
	});

	it('should return a Kaptain\'s Krewe when an admin is requesting it and the event_id and user_id are specified.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewe')
			.send({
				event_id : event1._id,
				user_id : kaptain1._id.toString()
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.should.have.property('members');

				res.body.name.should.equal(krewe1.name);
				res.body._id.toString().should.equal(krewe1._id.toString());

				res.body.members.length.should.equal(1);

				var member = res.body.members[0];
				member.should.have.property('_id');
				member.should.have.property('fName');
				member.should.have.property('lName');
				member.should.have.property('interests');

				member._id.toString().should.equal(member1._id.toString());
				member.fName.should.equal(member1.fName);
				member.lName.should.equal(member1.lName);
				member.interests[0].should.equal(member1.interests[0]);

				done();
			});
	});

	it('should return a Kaptain\'s Krewe when a kreweAdmin is requesting it and the event_id and user_id are specified.', function(done) {
		this.timeout(10000);
		kreweAdminAgent
			.post('http://localhost:3001/krewe')
			.send({
				event_id: 	event1._id,
				user_id: 	kaptain1._id.toString()
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.should.have.property('members');

				res.body.name.should.equal(krewe1.name);
				res.body._id.toString().should.equal(krewe1._id.toString());

				res.body.members.length.should.equal(1);

				var member = res.body.members[0];
				member.should.have.property('_id');
				member.should.have.property('fName');
				member.should.have.property('lName');
				member.should.have.property('interests');

				member._id.toString().should.equal(member1._id.toString());
				member.fName.should.equal(member1.fName);
				member.lName.should.equal(member1.lName);
				member.interests[0].should.equal(member1.interests[0]);

				done();
			});
	});

	it('should return a Kaptain\'s Krewe when a kaptain that has admin roles is requesting it and the event_id and user_id are specified.', function(done) {
		this.timeout(10000);
		var tempKaptainAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['kaptain', 'admin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempKaptainAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempKaptainAdminAgent = agent.agent();
			tempKaptainAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempKaptainAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempKaptainAdminAgent.saveCookies(loginRes);

					tempKaptainAdminAgent
						.post('http://localhost:3001/krewe')
						.send({
							event_id: 	event1._id,
							user_id: 	kaptain1._id.toString()
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							res.body.should.have.property('_id');
							res.body.should.have.property('name');
							res.body.should.have.property('members');

							res.body.name.should.equal(krewe1.name);
							res.body._id.toString().should.equal(krewe1._id.toString());

							res.body.members.length.should.equal(1);

							var member = res.body.members[0];
							member.should.have.property('_id');
							member.should.have.property('fName');
							member.should.have.property('lName');
							member.should.have.property('interests');

							member._id.toString().should.equal(member1._id.toString());
							member.fName.should.equal(member1.fName);
							member.lName.should.equal(member1.lName);
							member.interests[0].should.equal(member1.interests[0]);

							tempKaptainAdmin.remove(done);
						});
			});
		});
	});

	it('should return an error when an admin requests a Kaptain\'s Krewe without the user_id.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewe')
			.send({
				event_id: 	event1._id
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when an admin requests a Kaptain\'s Krewe with an invalid user_id.', function(done) {
		this.timeout(10000);
		adminAgent
			.post('http://localhost:3001/krewe')
			.send({
				event_id: 	event1._id,
				user_id: 	"kaptain1._id.toString()"
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when a kreweAdmin requests a Kaptain\'s Krewe without the user_id.', function(done) {
		this.timeout(10000);
		kreweAdminAgent
			.post('http://localhost:3001/krewe')
			.send({
				event_id: 	event1._id
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when a recruiter tries to request a Kaptain\'s Krewe.', function(done) {
		this.timeout(10000);
		var tempRecruiter = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiter.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAgent = agent.agent();
			tempRecruiterAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiter.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAgent.saveCookies(loginRes);

					tempRecruiterAgent
						.post('http://localhost:3001/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiter.remove(done);
						});
				});
		});
	});

	it('should return an error when an attendee tries to request a Kaptain\'s Krewe.', function(done) {
		this.timeout(10000);
		var tempAttendee = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempAttendee.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempAttendeeAgent = agent.agent();
			tempAttendeeAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempAttendee.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempAttendeeAgent.saveCookies(loginRes);

					tempAttendeeAgent
						.post('http://localhost:3001/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempAttendee.remove(done);
						});
				});
		});
	});

	it('should return an error when a recruiterAdmin tries to request a Kaptain\'s Krewe.', function(done) {
		this.timeout(10000);
		var tempRecruiterAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiterAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAdminAgent = agent.agent();
			tempRecruiterAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiterAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAdminAgent.saveCookies(loginRes);

					tempRecruiterAdminAgent
						.post('http://localhost:3001/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiterAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when a userAdmin tries to request a Kaptain\'s Krewe.', function(done) {
		this.timeout(10000);
		var tempUserAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUserAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAdminAgent = agent.agent();
			tempUserAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUserAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAdminAgent.saveCookies(loginRes);

					tempUserAdminAgent
						.post('http://localhost:3001/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempUserAdmin.remove(done);
						});
				});
		});
	});

	it('should return an error when a Kaptain requests his/her krewe without an event_id.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewe')
			.send({})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should return an error when a Kaptain requests his/her krewe with an invalid event_id.', function(done) {
		this.timeout(10000);
		kaptain1Agent
			.post('http://localhost:3001/krewe')
			.send({event_id : "not_an_id"})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				done();
			});
	});

	it('should let an admin save changes to a single krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = "New Krewe Name",
			newKaptain = member3._id,
			newMembers = krewe1.members;

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.message.should.equal("All Krewes updated successfully.");

				// Make sure the krewe was updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(newKreweName);
					newKrewe.kaptain.toString().should.equal(newKaptain.toString());

					newKrewe.members.length.should.equal(newMembers.length);
					var newMemberEncountered = false;
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						if(newKrewe.members[newMemberCounter].member_id.equals(kaptain1._id)) {
							newMemberEncountered = true;
							continue;
						}

						for(var oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}
					}

					if(!newMemberEncountered) {
						return done(new Error("New member not added to Krewe."));
					}

					// Make sure the new Kaptain's permissions were updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(1);

						done();
					});
				});
			});
	});

	it('should let an admin save changes to multiple krewes.', function(done) {
		this.timeout(10000);
		var newKrewe1Name = "New Krewe Name",
			newKaptain1 = member3._id,
			newKrewe1Members = krewe1.members;

		var newKrewe2Name = "Best Krewe",
			newKaptain2 = member2._id,
			newKrewe2Members = [{member_id : member1._id}];

		newKrewe1Members.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKrewe1Name,
						kaptain_id: 	newKaptain1,
						members:		newKrewe1Members
					},
					{
						_id: 			krewe2._id,
						name: 			newKrewe2Name,
						kaptain_id: 	newKaptain2,
						members: 		newKrewe2Members
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.message.should.equal("All Krewes updated successfully.");

				// Make sure the krewe1 was updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr1, newKrewe1) {
					if(kreweErr1) {
						return done(kreweErr1);
					}

					newKrewe1.name.should.equal(newKrewe1Name);
					newKrewe1.kaptain.toString().should.equal(newKaptain1.toString());

					newKrewe1.members.length.should.equal(newKrewe1Members.length);
					var newMemberEncountered = false;
					for(var newMemberCounter = 0; newMemberCounter < newKrewe1.members.length; newMemberCounter++) {
						if(newKrewe1.members[newMemberCounter].member_id.equals(kaptain1._id)) {
							newMemberEncountered = true;
							continue;
						}

						for(var oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe1.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}
					}

					if(!newMemberEncountered) {
						return done(new Error("New member not added to Krewe."));
					}

					// Make sure the new Kaptain's permissions were updated for krewe1.
					User.findOne({_id : newKaptain1}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(1);

						// Make sure krewe2 was updated.
						Krewe.findOne({_id : krewe2._id}, function(kreweErr2, newKrewe2) {
							if(kreweErr2) {
								return done(kreweErr2);
							}

							newKrewe2.name.should.equal(newKrewe2Name);
							newKrewe2.kaptain.toString().should.equal(newKaptain2.toString());

							newKrewe2.members.length.should.equal(newKrewe2Members.length);
							if(!newKrewe2.members[0].member_id.equals(newKrewe2Members[0].member_id)) {
								return done(new Error("Krewe's members were not updated."));
							}

							// Make sure the new Kaptain's permissions were updated.
							User.findOne({_id : newKaptain2}, function(kaptain2Err, newMember2) {
								if(kaptain2Err) {
									return done(kaptain2Err);
								}

								_.intersection(newMember2.roles, ["kaptain"]).length.should.equal(1);

								done();
							});
						});
					});
				});
			});
	});

	it('should let an admin save multiple new krewes.', function(done) {
		this.timeout(10000);
		var newKrewe1Name = "New Krewe Name",
			newKaptain1 = member3._id,
			newKrewe1Members = krewe1.members;

		var newKrewe2Name = "Best Krewe",
			newKaptain2 = member2._id,
			newKrewe2Members = [{member_id : member1._id}];

		newKrewe1Members.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			null,
						name: 			newKrewe1Name,
						kaptain_id: 	newKaptain1,
						members:		newKrewe1Members
					},
					{
						_id: 			false,
						name: 			newKrewe2Name,
						kaptain_id: 	newKaptain2,
						members: 		newKrewe2Members
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.message.should.equal("All Krewes updated successfully.");

				// Make sure the krewe1 was updated.
				Krewe.findOne({name : newKrewe1Name, kaptain : newKaptain1}, function(kreweErr1, newKrewe1) {
					if(kreweErr1) {
						return done(kreweErr1);
					}

					if(!newKrewe1) {
						return done(new Error("First new krewe not saved."));
					}

					newKrewe1.name.should.equal(newKrewe1Name);
					newKrewe1.kaptain.toString().should.equal(newKaptain1.toString());

					newKrewe1.members.length.should.equal(newKrewe1Members.length);
					var newMemberEncountered = false;
					for(var newMemberCounter = 0; newMemberCounter < newKrewe1.members.length; newMemberCounter++) {
						if(newKrewe1.members[newMemberCounter].member_id.equals(kaptain1._id)) {
							newMemberEncountered = true;
							continue;
						}

						for(var oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe1.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}
					}

					if(!newMemberEncountered) {
						return done(new Error("New member not added to Krewe."));
					}

					// Make sure the new Kaptain's permissions were updated for krewe1.
					User.findOne({_id : newKaptain1}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(1);

						// Make sure krewe2 was updated.
						Krewe.findOne({name : newKrewe2Name, kaptain : newKaptain2}, function(kreweErr2, newKrewe2) {
							if(kreweErr2) {
								return done(kreweErr2);
							}

							if(!newKrewe2) {
								return done(new Error("Second new krewe not saved."));
							}

							newKrewe2.name.should.equal(newKrewe2Name);
							newKrewe2.kaptain.toString().should.equal(newKaptain2.toString());

							newKrewe2.members.length.should.equal(newKrewe2Members.length);
							if(!newKrewe2.members[0].member_id.equals(newKrewe2Members[0].member_id)) {
								return done(new Error("Krewe's members were not updated."));
							}

							// Make sure the new Kaptain's permissions were updated.
							User.findOne({_id : newKaptain2}, function(kaptain2Err, newMember2) {
								if(kaptain2Err) {
									return done(kaptain2Err);
								}

								_.intersection(newMember2.roles, ["kaptain"]).length.should.equal(1);

								done();
							});
						});
					});
				});
			});
	});

	it('should let a kreweAdmin save changes to a multiple krewes.', function(done) {
		this.timeout(10000);
		var newKrewe1Name = "New Krewe Name",
			newKaptain1 = member3._id,
			newKrewe1Members = krewe1.members;

		var newKrewe2Name = "Best Krewe",
			newKaptain2 = member3._id,
			newKrewe2Members = [{member_id : member1._id}];

		newKrewe1Members.push({member_id: kaptain1._id});

		kreweAdminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKrewe1Name,
						kaptain_id: 	newKaptain1,
						members:		newKrewe1Members
					},
					{
						_id: 			krewe2._id,
						name: 			newKrewe2Name,
						kaptain_id: 	newKaptain2,
						members: 		newKrewe2Members
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.message.should.equal("All Krewes updated successfully.");

				// Make sure the krewe1 was updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr1, newKrewe1) {
					if(kreweErr1) {
						return done(kreweErr1);
					}

					newKrewe1.name.should.equal(newKrewe1Name);
					newKrewe1.kaptain.toString().should.equal(newKaptain1.toString());

					newKrewe1.members.length.should.equal(newKrewe1Members.length);
					var newMemberEncountered = false;
					for(var newMemberCounter = 0; newMemberCounter < newKrewe1.members.length; newMemberCounter++) {
						if(newKrewe1.members[newMemberCounter].member_id.equals(kaptain1._id)) {
							newMemberEncountered = true;
							continue;
						}

						for(var oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe1.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}
					}

					if(!newMemberEncountered) {
						return done(new Error("New member not added to Krewe."));
					}

					// Make sure the new Kaptain's permissions were updated for krewe1.
					User.findOne({_id : newKaptain1}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(1);

						// Make sure krewe2 was updated.
						Krewe.findOne({_id : krewe2._id}, function(kreweErr2, newKrewe2) {
							if(kreweErr2) {
								return done(kreweErr2);
							}

							newKrewe2.name.should.equal(newKrewe2Name);
							newKrewe2.kaptain.toString().should.equal(newKaptain2.toString());

							newKrewe2.members.length.should.equal(newKrewe2Members.length);
							if(!newKrewe2.members[0].member_id.equals(newKrewe2Members[0].member_id)) {
								return done(new Error("Krewe's members were not updated."));
							}

							// Make sure the new Kaptain's permissions were updated.
							User.findOne({_id : newKaptain2}, function(kaptain2Err, newKaptain) {
								if(kaptain2Err) {
									return done(kaptain2Err);
								}

								_.intersection(newKaptain.roles, ["kaptain"]).length.should.equal(1);

								done();
							});
						});
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe without the event_id.', function(done) {
		this.timeout(10000);
		var newKreweName = "New Krewe Name",
			newKaptain = member3._id,
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure specified new kaptain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe with an invalid event_id.', function(done) {
		this.timeout(10000);
		var newKreweName = "New Krewe Name",
			newKaptain = member3._id,
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	"not_a_valid_id",
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure specified new kaptain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe without the name for the krewe.', function(done) {
		this.timeout(10000);
		var newKaptain = member3._id,
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure the specified new kpatain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe with an invalid name for the krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = 12345,
			newKaptain = member3._id,
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure the specified new kpatain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe without the kaptain_id for the krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = "New Krewe Name",
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}

						done()
					}
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe with an invalid kaptain_id for the krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = "Best Krewe Ever",
			newKaptain = {kaptain : "Kaptain"},
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push({member_id: kaptain1._id});

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}

						done();
					}
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe without the members in the krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = "New Krewe Name",
			newKaptain = member3._id;

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure the specified new kpatain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should return an error and not make any changes when an admin tries to save a krewe with an invalid members array for the krewe.', function(done) {
		this.timeout(10000);
		var newKreweName = Number(45),
			newKaptain = member3._id,
			newMembers = krewe1.members.slice(0);		// Give newMembers a shallow copy instead of a pointer to the same array.

		newMembers.push(1232123);

		adminAgent
			.post('http://localhost:3001/save/krewes')
			.send({
				event_id: 	event1._id,
				krewes: 	[
					{
						_id: 			krewe1._id,
						name: 			newKreweName,
						kaptain_id: 	newKaptain,
						members: 		newMembers
					}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				// Make sure the krewe was not updated.
				Krewe.findOne({_id : krewe1._id}, function(kreweErr, newKrewe) {
					if(kreweErr) {
						return done(kreweErr);
					}

					newKrewe.name.should.equal(krewe1.name);
					newKrewe.kaptain.toString().should.equal(krewe1.kaptain.toString());

					newKrewe.members.length.should.equal(krewe1.members.length);
					for(var newMemberCounter = 0; newMemberCounter < newKrewe.members.length; newMemberCounter++) {
						var oldMemberCounter;
						for(oldMemberCounter = 0; oldMemberCounter < krewe1.members.length; oldMemberCounter++) {
							if(newKrewe.members[newMemberCounter].member_id.equals(krewe1.members[oldMemberCounter].member_id)) {
								break;
							}
						}

						if(oldMemberCounter === newKrewe.members.length) {
							return done(new Error("Krewe's members changed."));
						}
					}

					// Make sure the specified new kpatain's permissions were not updated.
					User.findOne({_id : newKaptain}, function(kaptainErr, newMember3) {
						if(kaptainErr) {
							return done(kaptainErr);
						}

						_.intersection(newMember3.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should not allow a recruiter to save krewes.', function(done) {
		this.timeout(10000);
		var tempRecruiter = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiter.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAgent = agent.agent();
			tempRecruiterAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiter.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAgent.saveCookies(loginRes);

					tempRecruiterAgent
						.post('http://localhost:3001/save/krewes')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiter.remove(done);
						});
				});
		});
	});

	it('should not allow an attendee to save krewes.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post('http://localhost:3001/save/krewes')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempUser.remove(done);
						});
				});
		});
	});

	it('should not allow a kaptain to save other krewes.', function(done) {
		this.timeout(10000);
		var tempKaptain = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['kaptain'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempKaptain.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempKaptainAgent = agent.agent();
			tempKaptainAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempKaptain.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempKaptainAgent.saveCookies(loginRes);

					tempKaptainAgent
						.post('http://localhost:3001/save/krewes')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempKaptain.remove(done);
						});
				});
		});
	});

	it('should not allow a recruiterAdmin to save other krewes.', function(done) {
		this.timeout(10000);
		var tempRecruiterAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempRecruiterAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempRecruiterAdminAgent = agent.agent();
			tempRecruiterAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempRecruiterAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempRecruiterAdminAgent.saveCookies(loginRes);

					tempRecruiterAdminAgent
						.post('http://localhost:3001/save/krewes')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempRecruiterAdmin.remove(done);
						});
				});
		});
	});

	it('should not allow a userAdmin to save other krewes.', function(done) {
		this.timeout(10000);
		var tempUserAdmin = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUserAdmin.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAdminAgent = agent.agent();
			tempUserAdminAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUserAdmin.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAdminAgent.saveCookies(loginRes);

					tempUserAdminAgent
						.post('http://localhost:3001/save/krewes')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							tempUserAdmin.remove(done);
						});
				});
		});
	});

	/* saveKreweAsKaptain - /save/krewe */
	it('should allow a Kaptain to save their Krewe.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: event1._id.toString(),
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);
				res.body.message.should.equal("Krewe updated successfully.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(newName);

					newKrewe1.members.length.should.equal(newMembers.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < newMembers.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === newMembers[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === newMembers.length) {
							return done(new Error("Unknown member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save another Krewe.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: event1._id.toString(),
				krewe: {
					_id: 		krewe2._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal("User does not have permission to modify Krewe.");

				Krewe.findOne({_id : krewe2._id}, function(findErr, newKrewe2) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe2.name.should.equal(krewe2.name);

					newKrewe2.members.length.should.equal(krewe2.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe2.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe2.members.length; varIndex++) {
							if(newKrewe2.members[dbIndex].member_id.toString() === krewe2.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe2.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe2.event_id.toString().should.equal(krewe2.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the event_id is missing.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the event_id is invalid.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	"fake_id12",
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe field is missing.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe field is not an object.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: [{
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe\'s _id is missing.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe\'s _id is invalid.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		1011101,
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe\'s name is missing.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe\'s name is invalid', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		{name : newName},
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when the krewe\'s members field is missing.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a Kaptain to save a Krewe when one of the krewe\'s members field is invalid.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push(3701);

		kaptain1Agent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);
				res.body.message.should.equal("Incorrect data format.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow an admin to save a Krewe from the Kaptain\'s route.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		adminAgent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal("Use route for admins.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a recruiter to save a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post('http://localhost:3001/save/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
								if(findErr) {
									return done(findErr);
								}

								newKrewe1.name.should.equal(krewe1.name);

								newKrewe1.members.length.should.equal(krewe1.members.length);
								for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
									var varIndex = 0;
									for(; varIndex < krewe1.members.length; varIndex++) {
										if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
											break;
										}
									}

									if(varIndex === krewe1.members.length) {
										return done(new Error("Member added to Krewe."));
									}
								}

								newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

								done();
							});
						});
				});
		});
	});

	it('should not allow an attendee to save a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post('http://localhost:3001/save/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
								if(findErr) {
									return done(findErr);
								}

								newKrewe1.name.should.equal(krewe1.name);

								newKrewe1.members.length.should.equal(krewe1.members.length);
								for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
									var varIndex = 0;
									for(; varIndex < krewe1.members.length; varIndex++) {
										if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
											break;
										}
									}

									if(varIndex === krewe1.members.length) {
										return done(new Error("Member added to Krewe."));
									}
								}

								newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

								done();
							});
						});
				});
		});
	});

	it('should not allow a kreweAdmin to save a Krewe.', function(done) {
		var newName = "My New Krewe Name",
			newMembers = krewe1.members.slice(0);

		newMembers.push({member_id : member3._id.toString()});

		kreweAdminAgent
			.post('http://localhost:3001/save/krewe')
			.send({
				event_id: 	event1._id, 
				krewe: {
					_id: 		krewe1._id.toString(),
					name: 		newName,
					members: 	newMembers
				}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);
				res.body.message.should.equal("Use route for admins.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	it('should not allow a recruiterAdmin to save a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post('http://localhost:3001/save/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
								if(findErr) {
									return done(findErr);
								}

								newKrewe1.name.should.equal(krewe1.name);

								newKrewe1.members.length.should.equal(krewe1.members.length);
								for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
									var varIndex = 0;
									for(; varIndex < krewe1.members.length; varIndex++) {
										if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
											break;
										}
									}

									if(varIndex === krewe1.members.length) {
										return done(new Error("Member added to Krewe."));
									}
								}

								newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

								done();
							});
						});
				});
		});
	});

	it('should not allow a userAdmin to save a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post('http://localhost:3001/save/krewe')
						.send({event_id : event1._id.toString()})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
								if(findErr) {
									return done(findErr);
								}

								newKrewe1.name.should.equal(krewe1.name);

								newKrewe1.members.length.should.equal(krewe1.members.length);
								for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
									var varIndex = 0;
									for(; varIndex < krewe1.members.length; varIndex++) {
										if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
											break;
										}
									}

									if(varIndex === krewe1.members.length) {
										return done(new Error("Member added to Krewe."));
									}
								}

								newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

								done();
							});
						});
				});
		});
	});

	it('should not allow a guest to save a Krewe.', function(done) {
		var tempUserAgent = agent.agent();
		tempUserAgent
			.post('http://localhost:3001/save/krewe')
			.send({event_id : event1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User is not logged in.");

				Krewe.findOne({_id : krewe1._id}, function(findErr, newKrewe1) {
					if(findErr) {
						return done(findErr);
					}

					newKrewe1.name.should.equal(krewe1.name);

					newKrewe1.members.length.should.equal(krewe1.members.length);
					for(var dbIndex = 0; dbIndex < newKrewe1.members.length; dbIndex++) {
						var varIndex = 0;
						for(; varIndex < krewe1.members.length; varIndex++) {
							if(newKrewe1.members[dbIndex].member_id.toString() === krewe1.members[varIndex].member_id.toString()) {
								break;
							}
						}

						if(varIndex === krewe1.members.length) {
							return done(new Error("Member added to Krewe."));
						}
					}

					newKrewe1.event_id.toString().should.equal(krewe1.event_id.toString());

					done();
				});
			});
	});

	/* deleteKrewe - /remove/krewes */
	it('should allow an admin to delete several krewes.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : [
					krewe1._id.toString(),
					krewe2._id.toString()
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("All deleted Krewes removed successfully.");

				Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
					if(search1Err) {
						return done(search1Err);
					}

					if(newKrewe1) {
						return done(new Error("Krewe was not deleted."));
					}

					Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(newKrewe2) {
							return done(new Error("Krewe was not deleted."));
						}

						done();
					});
				});
			});
	});

	it('should allow a kreweAdmin to delete several krewes.', function(done) {
		kreweAdminAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : [
					krewe1._id.toString(),
					krewe2._id.toString()
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("All deleted Krewes removed successfully.");

				Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
					if(search1Err) {
						return done(search1Err);
					}

					if(newKrewe1) {
						return done(new Error("Krewe was not deleted."));
					}

					Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(newKrewe2) {
							return done(new Error("Krewe was not deleted."));
						}

						done();
					});
				});
			});
	});

	it('should return an error when a Krewe _id is invalid.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : [
					krewe1._id.toString(),
					{number: 201520}
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
					if(search1Err) {
						return done(search1Err);
					}

					// This method does not modify any fields, so no need to check expected values.
					if(!newKrewe1) {
						return done(new Error("Krewe was deleted."));
					}

					Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(!newKrewe2) {
							return done(new Error("Krewe was deleted."));
						}

						done();
					});
				});
			});
	});

	it('should return immediately when no krewe_ids is invalid.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : {}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
					if(search1Err) {
						return done(search1Err);
					}

					// This method does not modify any fields, so no need to check expected values.
					if(!newKrewe1) {
						return done(new Error("Krewe was deleted."));
					}

					Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(!newKrewe2) {
							return done(new Error("Krewe was deleted."));
						}

						done();
					});
				});
			});
	});

	it('should return immediately when no krewe _ids are specified.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : []
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("No updates.");

				done();
			});
	});

	it('should not allow a recruiter to delete a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/krewes")
						.send({
							krewe_ids : {}
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
								if(search1Err) {
									return done(search1Err);
								}

								// This method does not modify any fields, so no need to check expected values.
								if(!newKrewe1) {
									return done(new Error("Krewe was deleted."));
								}

								Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKrewe2) {
										return done(new Error("Krewe was deleted."));
									}

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow an attendee to delete a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/krewes")
						.send({
							krewe_ids : {}
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
								if(search1Err) {
									return done(search1Err);
								}

								// This method does not modify any fields, so no need to check expected values.
								if(!newKrewe1) {
									return done(new Error("Krewe was deleted."));
								}

								Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKrewe2) {
										return done(new Error("Krewe was deleted."));
									}

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a kaptain to delete a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['kaptain'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/krewes")
						.send({
							krewe_ids : {}
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
								if(search1Err) {
									return done(search1Err);
								}

								// This method does not modify any fields, so no need to check expected values.
								if(!newKrewe1) {
									return done(new Error("Krewe was deleted."));
								}

								Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKrewe2) {
										return done(new Error("Krewe was deleted."));
									}

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a recruiterAdmin to delete a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/krewes")
						.send({
							krewe_ids : {}
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
								if(search1Err) {
									return done(search1Err);
								}

								// This method does not modify any fields, so no need to check expected values.
								if(!newKrewe1) {
									return done(new Error("Krewe was deleted."));
								}

								Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKrewe2) {
										return done(new Error("Krewe was deleted."));
									}

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a userAdmin to delete a Krewe.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/krewes")
						.send({
							krewe_ids : {}
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
								if(search1Err) {
									return done(search1Err);
								}

								// This method does not modify any fields, so no need to check expected values.
								if(!newKrewe1) {
									return done(new Error("Krewe was deleted."));
								}

								Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKrewe2) {
										return done(new Error("Krewe was deleted."));
									}

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow guests to delete a Krewe.', function(done) {
		var tempUserAgent = agent.agent();
		tempUserAgent
			.post("http://localhost:3001/remove/krewes")
			.send({
				krewe_ids : {}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User is not logged in.");

				Krewe.findOne({_id : krewe1._id}, function(search1Err, newKrewe1) {
					if(search1Err) {
						return done(search1Err);
					}

					// This method does not modify any fields, so no need to check expected values.
					if(!newKrewe1) {
						return done(new Error("Krewe was deleted."));
					}

					Krewe.findOne({_id : krewe2._id}, function(search2Err, newKrewe2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(!newKrewe2) {
							return done(new Error("Krewe was deleted."));
						}

						done();
					});
				});
			});
	});

	/* removeKaptainPermissions - /remove/kaptain */
	it('should allow an admin to remove several Kaptains.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	[
					kaptain1._id.toString(),
					kaptain2._id.toString()
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("All ex-Kaptains updated successfully.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(0);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should allow a kreweAdmin to remove several Kaptains.', function(done) {
		kreweAdminAgent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	[
					kaptain1._id.toString(),
					kaptain2._id.toString()
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("All ex-Kaptains updated successfully.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(0);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(0);

						done();
					});
				});
			});
	});

	it('should not allow an admin to remove Kaptains when one of the _ids are invalid.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	[
					kaptain1._id.toString(),
					"123456789f"
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

						done();
					});
				});
			});
	});

	it('should return immediately when no Kaptains are specified.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	[]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(200);

				res.body.message.should.equal("No updates.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

						done();
					});
				});
			});
	});

	it('should return an error when user_ids field has an invalid format.', function(done) {
		adminAgent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	{}
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(400);

				res.body.message.should.equal("Required fields not specified.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(!newKaptain2) {
							return done(new Error("An innocent Kaptain was deleted!"));
						}

						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

						done();
					});
				});
			});
	});

	it('should not allow a recruiter to remove Kaptains.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiter'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/kaptain")
						.send({
							event_id: 	event1._id.toString(),
							user_ids: 	[
								kaptain1._id.toString()
							]
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
								if(search1Err) {
									return done(search1Err);
								}

								if(!newKaptain1) {
									return done(new Error("An innocent Kaptain was deleted!"));
								}
								
								_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

								User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKaptain2) {
										return done(new Error("An innocent Kaptain was deleted!"));
									}
									
									_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow an attendee to remove Kaptains.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['attendee'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/kaptain")
						.send({
							event_id: 	event1._id.toString(),
							user_ids: 	[
								kaptain1._id.toString()
							]
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
								if(search1Err) {
									return done(search1Err);
								}

								if(!newKaptain1) {
									return done(new Error("An innocent Kaptain was deleted!"));
								}
								
								_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

								User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKaptain2) {
										return done(new Error("An innocent Kaptain was deleted!"));
									}
									
									_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a Kaptain to remove other Kaptains.', function(done) {
		kaptain1Agent
			.post("http://localhost:3001/remove/kaptain")
			.send({
				event_id: 	event1._id.toString(),
				user_ids: 	[
					kaptain2._id.toString()
				]
			})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(401);

				res.body.message.should.equal("User does not have permission.");

				User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
					if(search1Err) {
						return done(search1Err);
					}

					if(!newKaptain1) {
						return done(new Error("An innocent Kaptain was deleted!"));
					}
					
					_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

					User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
						if(search2Err) {
							return done(search2Err);
						}

						if(!newKaptain2) {
							return done(new Error("An innocent Kaptain was deleted!"));
						}
						
						_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

						done();
					});
				});
			});
	});

	it('should not allow a recruiterAdmin to remove Kaptains.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['recruiterAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/kaptain")
						.send({
							event_id: 	event1._id.toString(),
							user_ids: 	[
								kaptain2._id.toString()
							]
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
								if(search1Err) {
									return done(search1Err);
								}

								if(!newKaptain1) {
									return done(new Error("An innocent Kaptain was deleted!"));
								}
								
								_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

								User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKaptain2) {
										return done(new Error("An innocent Kaptain was deleted!"));
									}
									
									_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a userAdmin to remove Kaptains.', function(done) {
		this.timeout(10000);
		var tempUser = new User({
			fName: 			'Peter',
			lName: 			'Parker',
			displayName: 	'Parker, Peter',
			email: 			'spiders_cen3031.0.boom0625@spamgourmet.com',
			roles: 			['userAdmin'],
			status: 		[
				{
					event_id: 	event2._id,
					attending: 	true,
					recruiter: 	true,
					kaptain: 	false
				}
			],
			password: 		'password',
			login_enabled: 	true
		});

		tempUser.save(function(saveErr) {
			if(saveErr) {
				return done(saveErr);
			}

			var tempUserAgent = agent.agent();
			tempUserAgent
				.post('http://localhost:3001/auth/signin')
				.send({email : tempUser.email, password : 'password'})
				.end(function(loginErr, loginRes) {
					if(loginErr) {
						return done(loginErr);
					}

					if(loginRes.status !== 200) {
						return done(new Error("Temp Recruiter could not login: " + loginRes.body.message));
					}

					tempUserAgent.saveCookies(loginRes);

					tempUserAgent
						.post("http://localhost:3001/remove/kaptain")
						.send({
							event_id: 	event1._id.toString(),
							user_ids: 	[
								kaptain2._id.toString()
							]
						})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(401);

							res.body.message.should.equal("User does not have permission.");

							User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
								if(search1Err) {
									return done(search1Err);
								}

								if(!newKaptain1) {
									return done(new Error("An innocent Kaptain was deleted!"));
								}
								
								_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

								User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
									if(search2Err) {
										return done(search2Err);
									}

									if(!newKaptain2) {
										return done(new Error("An innocent Kaptain was deleted!"));
									}
									
									_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

									done();
								});
							});
						});
				});
		});
	});

	it('should not allow a guest to remove Kaptains.', function(done) {
		var tempUserAgent = agent.agent();
			tempUserAgent
				.post("http://localhost:3001/remove/kaptain")
				.send({
					event_id: 	event1._id.toString(),
					user_ids: 	[
						kaptain2._id.toString()
					]
				})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);

					res.body.message.should.equal("User is not logged in.");

					User.findOne({_id : kaptain1._id}, function(search1Err, newKaptain1) {
						if(search1Err) {
							return done(search1Err);
						}

						if(!newKaptain1) {
							return done(new Error("An innocent Kaptain was deleted!"));
						}
						
						_.intersection(newKaptain1.roles, ["kaptain"]).length.should.equal(1);

						User.findOne({_id : kaptain1._id}, function(search2Err, newKaptain2) {
							if(search2Err) {
								return done(search2Err);
							}

							if(!newKaptain2) {
								return done(new Error("An innocent Kaptain was deleted!"));
							}
							
							_.intersection(newKaptain2.roles, ["kaptain"]).length.should.equal(1);

							done();
						});
					});
				});
	});
	
	afterEach(function(done) {
		this.timeout(10000);
		Krewe.remove(function(kreweErr) {
			if(kreweErr) {
				return done(kreweErr);
			}

			User.remove({roles : {$in : ["recruiter", "attendee", "kaptain", "kreweAdmin", "recruiterAdmin", "userAdmin"]}}, done);
		});
	});

	after(function(done) {
		async.parallel([
			function(next) {
				User.remove(next);
			},
			function(next) {
				Krewe.remove(next);
			},
			function(next) {
				Event.remove(next);
			}
		], done);
	});
});