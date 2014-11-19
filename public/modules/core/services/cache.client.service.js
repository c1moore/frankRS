angular.module('core').factory('myCache', function($cacheFactory) {
 return $cacheFactory('myData');
});