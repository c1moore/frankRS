'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/frank-recruiter-system',
	db_options: {
		username : process.env.MONGO_USER || "",
		pwd : process.env.MONGO_PWD || ""
	},
	forks: process.env.FRANK_PROCESSES || 1,
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/ng-table/ng-table.min.css',
				'public/lib/font-awesome/css/font-awesome.min.css',
				'public/lib/angular-multi-select/angular-multi-select.css',
				'public/lib/angular-dialog-service/dist/dialogs.min.css',
				'public/lib/octicons/octicons/octicons.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js', 
				'public/lib/angular-cookies/angular-cookies.min.js', 
				'public/lib/angular-animate/angular-animate.min.js', 
				'public/lib/angular-touch/angular-touch.min.js', 
				'public/lib/angular-sanitize/angular-sanitize.min.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-recaptcha/release/angular-recaptcha.min.js',
				'public/lib/ng-table/ng-table.min.js',
				'public/lib/lodash/dist/lodash.min.js',
				'public/lib/jquery-ui/jquery-ui.min.js',
				'public/lib/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js',
				'public/lib/textAngular/dist/textAngular-sanitize.min.js',
				'public/lib/textAngular/dist/textAngular.min.js',
				'public/lib/textAngular/src/textAngularSetup.js',
				'public/lib/ng-flow/dist/ng-flow.min.js',
				'public/lib/ng-flow/dist/ng-flow-standalone.min.js',
				'public/lib/angular-input-date/src/angular-input-date.js',
				'public/lib/angular-multi-select/angular-multi-select.js',
				'public/lib/angular-dialog-service/example/js/dialogs.min.js',
				'public/lib/spin.js/spin.js',
				'public/lib/spin.js/jquery.spin.js',
				'public/lib/angular-spinner/angular-spinner.min.js',
				'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js',
				'public/lib/angular-local-storage/dist/angular-local-storage.min.js',
				'public/lib/async/dist/async.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
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
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD',
				api_user: process.env.MAILER_API_USER || 'MAILER_API_USER',
				api_key: process.env.MAILER_API_KEY || 'MAILER_API_KEY'
			}
		}
	},
	recaptcha: {
		public_key: process.env.G_RECAPTCHA_PUBLIC_KEY || 'G_RECAPTCHA_PUBLIC_KEY',
		private_key: process.env.G_RECAPTCHA_PRIVATE_KEY || 'G_RECAPTCHA_PRIVATE_KEY'
	},
	programmer: {
		email: process.env.FRANK_PROGRAMMER_EMAIL || 'PROGRAMMER_EMAIL'
	},
	zapier_api: process.env.FRANK_ZAP_API_KEY || 'frank_zap_api_key',
	Admin_API_Key: process.env.FRANK_ADMIN_API_KEY || 'frank_admin_api_key'
};
