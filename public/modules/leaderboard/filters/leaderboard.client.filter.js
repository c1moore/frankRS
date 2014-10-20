angular.module("leaderboard").filter("offset", function(){
	return function(data, start) {
		start = parseInt(start, 10);
		return data.slice(start);
	};
});