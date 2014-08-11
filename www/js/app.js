(function(){
	'use strict';
	var myApp = angular.module('quickTasksApp', [ 'onsen.directives']);
		myApp.factory('API', function ($rootScope, $http, $window) {
			var base = "http://quicktasksapp.herokuapp.com/";
	        $rootScope.show = function (text) {
	            console.log("rootscope show");
	        };

	        $rootScope.hide = function () {
	            console.log("rootscope hide");
	        };

	        $rootScope.logout = function () {
	            $rootScope.setToken("");
	            console.log("logout");
	        };

	        $rootScope.notify =function(text){
	            $rootScope.show(text);
	            $window.setTimeout(function () {
	              $rootScope.hide();
	            }, 1999);
	        };

	        $rootScope.doRefresh = function (tab) {
	            if(tab == 1)
	                $rootScope.$broadcast('fetchAll');
	            else
	                $rootScope.$broadcast('fetchCompleted');

	            $rootScope.$broadcast('scroll.refreshComplete');
	        };

	        $rootScope.setToken = function (token) {
	            return $window.localStorage.token = token;
	        }

	        $rootScope.getToken = function () {
	            return $window.localStorage.token;
	        }

	        $rootScope.isSessionActive = function () {
	            return $window.localStorage.token ? true : false;
	        }
			return {
				signin: function (form) {
					return $http.post(base+'/api/v1/quicktasks/auth/login', form);
				},
				signup: function (form) {
					return $http.post(base+'/api/v1/quicktasks/auth/register', form);
				},
				getAll: function (email) {
					return $http.get(base+'/api/v1/quicktasks/data/list', {
					method: 'GET',
					params: {
						token: email
						}
					});
				},
				getOne: function (id, email) {
					return $http.get(base+'/api/v1/quicktasks/data/item/' + id, {
					method: 'GET',
					params: {
						token: email
						}
					});
				},
				saveItem: function (form, email) {
					return $http.post(base+'/api/v1/quicktasks/data/item', form, {
					method: 'POST',
					params: {
						token: email
						}
					});
				},
				putItem: function (id, form, email) {
					return $http.put(base+'/api/v1/quicktasks/data/item/' + id, form, {
					method: 'PUT',
					params: {
						token: email
						}
					});
				},
				deleteItem: function (id, email) {
					return $http.delete(base+'/api/v1/quicktasks/data/item/' + id, {
					method: 'DELETE',
					params: {
						token: email
						}
					});
				},

				searchProviders: function (params) {
					return $http.get(base+'/api/v1/quicktasks/search/providers', {
					method: 'GET',
					params: {
						term: params.term,
						location: params.location
						}
					});
				},
				searchProvidersByGeo: function (params) {
					return $http.get(base+'/api/v1/quicktasks/search/providers/geo', {
					method: 'GET',
					params: {
						term: params.term,
						ll: params.ll
						}
					});
				},
				searchCustomers: function (params) {
					return $http.get(base+'/api/v1/quicktasks/search/customers', {
					method: 'GET',
					params: {
						term: params.term,
						location: params.location
						}
					});
				}
			};
		});
		/*
		myApp.controller('WelcomePageController', ['$scope', function($scope) {
			var options = $scope.myNavigator.getCurrentPage().options;
		}]);
		*/
		myApp.controller('WelcomeForkController', ['$scope', function($scope) {
			var options = $scope.myNavigator.getCurrentPage().options;
		}]);

		myApp.controller('providerFormController', function ($rootScope, $scope, API, $window) {
		    $rootScope.$on('fetchAll', function(){
		        API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
	                $rootScope.show("Please wait... Processing");

	                $scope.data = data[data.length-1];
	                console.log($scope.data);

	                if($scope.data.length === 0) {
	                    $scope.noData = true;
	                }
	                else {
	                    $scope.noData = false;
	                }

	           		$rootScope.hide();
		        })
		        .error(function (data, status, headers, config) {
		            $rootScope.hide();
		            $rootScope.notify("Oops something went wrong!! Please try again later");
		        });
		    });

		    $rootScope.$broadcast('fetchAll');

			var options = $scope.myNavigator.getCurrentPage().options;

		    $scope.save = function () {
	            var yourName = this.data.yourName,
	                companyName = this.data.companyName,
	                location = this.data.location;
	            if (!companyName) return;


	            var form = {
	                yourName: yourName,
	                companyName: companyName,
	                location: location,
	                user: $rootScope.getToken(),
	                created: Date.now(),
	                updated: Date.now()
	            };

            	API.saveItem(form, form.user)
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    //$rootScope.doRefresh(1);
                    myNavigator.pushPage('serviceProviderProfileView.html', { animation: "lift" })
                })
                .error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });

		    };

		});
		myApp.controller('providerViewController', function ($rootScope, $scope, API, $window) {
		    $rootScope.$on('fetchAll', function(){
		        API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
	                $rootScope.show("Please wait... Processing");

	                $scope.item = data[data.length-1];


	                $scope.list = [];
	                for (var i = 0; i < data.length; i++) {
	                    if (data[i].isCompleted === false) {
	                        $scope.list.push(data[i]);
	                    }
	                }
	                if($scope.list.length === 0) {
	                    $scope.noData = true;
	                }
	                else {
	                    $scope.noData = false;
	                }

	           		$rootScope.hide();
		        })
		        .error(function (data, status, headers, config) {
		            $rootScope.hide();
		            $rootScope.notify("Oops something went wrong!! Please try again later");
		        });
		    });

		    $rootScope.$broadcast('fetchAll');

		});
		myApp.controller('WelcomePageController', function ($rootScope, $scope, API, $window) {
		    // if the user is already logged in, take him to his bucketlist
		    if ($rootScope.isSessionActive()) {
		        myNavigator.pushPage('welcomeFork.html', {hoge: 'hoge'})
		    }

		    $scope.user = {
		        email: "",
		        password: ""
		    };

		    $scope.validateUser = function () {
		        var email = this.user.email;
		        var password = this.user.password;
		        if(!email || !password) {
		            $rootScope.notify("Please enter valid credentials");
		            return false;
		        }
		        $rootScope.show('Please wait.. Authenticating');
		        API.signin({
		            email: email,
		            password: password
		        }).success(function (data) {
		            $rootScope.setToken(email); // create a session kind of thing on the client side
		            $rootScope.hide();
		            myNavigator.pushPage('welcomeFork.html', {hoge: 'hoge'})
		        }).error(function (error) {
		            console.log(error);
		            $rootScope.hide();
		            $rootScope.notify("Invalid Username or password");
		        });
		    };

		});
		myApp.controller('CustomerSearchController', function ($rootScope, $scope, API, $window) {


		});
		myApp.controller('CustomerRequestViewController', function ($rootScope, $scope, API, $window) {


		});


})();
