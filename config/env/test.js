'use strict';

module.exports = {
	db: 'mongodb://localhost/frank-recruiter-system-test',
	db_options: {
		username : process.env.MONGO_USER || "",
		pwd : process.env.MONGO_PWD || ""
	},
	port: 3001,
	forks: process.env.FRANK_PROCESSES || 1,
	app: {
		title: 'frank Recruiter System - Test Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
	recaptcha: {
		public_key: process.env.G_RECAPTCHA_PUBLIC_KEY || 'G_RECAPTCHA_PUBLIC_KEY',
		private_key: process.env.G_RECAPTCHA_PRIVATE_KEY || 'G_RECAPTCHA_PRIVATE_KEY'
	},
	programmer: {
		email: process.env.PROGRAMMER_EMAIL || 'PROGRAMMER_EMAIL'
	},
	zapier_api: process.env.FRANK_ZAP_API_KEY || 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe',
	Admin_API_Key: process.env.FRANK_ADMIN_API_KEY || 'frank_admin_api_key'
};