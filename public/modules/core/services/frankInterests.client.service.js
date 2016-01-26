'use strict';

/**
* Provides a dictionary of frank's interests as keys and the location
* where the images for a given interest can be found.
*/
angular.module('core').service('frankInterests', [
	function() {
		this.interests = {
			"Arts" : "img/interests/arts.png",
			"Child Development" : "img/interests/child_development.png",
			"Conservation" : "img/interests/conservation.png",
			"Corporate Social Responsibility" : "img/interests/corporate_social_responsibility.png",
			"Corrections" : "img/interests/corrections.png",
			"Culture" : "img/interests/culture.png",
			"Education" : "img/interests/education.png",
			"Entertainment" : "img/interests/entertainment.png",
			"Environment" : "img/interests/environment.png",
			"Food & Health" : "img/interests/food_&_health.png",
			"frank" : "img/interests/frank.png",
			"Gender Equality" : "img/interests/gender_equality.png",
			"Health" : "img/interests/health.png",
			"Human Rights" : "img/interests/human_rights.png",
			"Income Disparity" : "img/interests/income_disparity.png",
			"Inspiration" : "img/interests/inspiration.png",
			"International Development" : "img/interests/international_development.png",
			"Media" : "img/interests/media.png",
			"Mental Health" : "img/interests/mental_health.png",
			"Music" : "img/interests/music.png",
			"Politics" : "img/interests/politics.png",
			"Poverty" : "img/interests/poverty.png",
			"Religion" : "img/interests/religion.png",
			"Science" : "img/interests/science.png",
			"Social Media" : "img/interests/social_media.png",
			"Solutions Journalism" : "img/interests/solutions_journalism.png",
			"Special Needs" : "img/interests/special_needs.png",
			"Technology" : "img/interests/technology.png",
			"Tobacco" : "img/interests/tobacco.png",
			"Travel" : "img/interests/travel.png",
			"Violence Prevention" : "img/interests/violence_prevention.png",
			"Water" : "img/interests/water.png"
		};
	}
]);