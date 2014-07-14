angular.module('quickTasks.controllers', ['quickTasks.services'])

.controller('SignInCtrl', function ($rootScope, $scope, API, $window) {
    // if the user is already logged in, take him to his bucketlist
    if ($rootScope.isSessionActive()) {
        $window.location.href = ('#/bucket/profile');
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
            $window.location.href = ('#/bucket/profile');
        }).error(function (error) {
            $rootScope.hide();
            $rootScope.notify("Invalid Username or password");
        });
    };

})

.controller('SignUpCtrl', function ($rootScope, $scope, API, $window) {
    $scope.user = {
        email: "",
        password: "",
        name: ""
    };

    $scope.createUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        var uName = this.user.name;
        if(!email || !password || !uName) {
            $rootScope.notify("Please enter valid data");
            return false;
        }
        $rootScope.show('Please wait.. Registering');
        API.signup({
            email: email,
            password: password,
            name: uName
        }).success(function (data) {
            $rootScope.setToken(email); // create a session kind of thing on the client side
            $rootScope.hide();
            $window.location.href = ('#/provider/profile');
        }).error(function (error) {
            $rootScope.hide();
            if(error.error && error.error.code == 11000)
            {
                $rootScope.notify("A user with this email already exists");
            }
            else
            {
                $rootScope.notify("Oops something went wrong, Please try again!");
            }

        });
    };
})
.controller('searchCustomersCtrl', function ($rootScope, $scope, API, $window) {
    console.log("search customers loading");
    $rootScope.hide();

})
.controller('myListCtrl', function ($rootScope, $scope, API, $timeout, $ionicModal, $window) {
    $rootScope.$on('fetchAll', function(){
            API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
            $rootScope.show("Please wait... Processing");
            $scope.list = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].isCompleted === false) {
                    $scope.list.push(data[i]);
                }
            }
            if($scope.list.length === 0)
            {
                $scope.noData = true;
            }
            else
            {
                $scope.noData = false;
            }

            $ionicModal.fromTemplateUrl('templates/createProfile.html', function (modal) {
                $scope.newTemplate = modal;
            });
            $ionicModal.fromTemplateUrl('templates/updateProfile.html', function (modal) {
                $scope.updateProfileTemplate = modal;
            },
            {
             // Use our scope for the scope of the modal to keep it simple
             scope: $scope
           });

            $scope.createProviderProfile = function () {
                $scope.newTemplate.show();
            };
            $scope.updateProfile = function (id) {
                $scope.updateProfileTemplate.show();
            };
            $rootScope.hide();
        }).error(function (data, status, headers, config) {
            $rootScope.hide();
            $rootScope.notify("Oops something went wrong!! Please try again later");
        });
    });

    $rootScope.$broadcast('fetchAll');


    $scope.markCompleted = function (id) {
        $rootScope.show("Please wait... Updating List");
        API.putItem(id, {
            isCompleted: true
        }, $rootScope.getToken())
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
            }).error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
    };



    $scope.deleteItem = function (id) {
        $rootScope.show("Please wait... Deleting from List");
        API.deleteItem(id, $rootScope.getToken())
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
            }).error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
    };

})

.controller('completedCtrl', function ($rootScope,$scope, API, $window) {
        $rootScope.$on('fetchCompleted', function () {
            API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
                $scope.list = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].isCompleted === true) {
                        $scope.list.push(data[i]);
                    }
                }
                if(data.length > 0 & $scope.list.length === 0)
                {
                    $scope.incomplete = true;
                }
                else
                {
                    $scope.incomplete= false;
                }

                if(data.length === 0)
                {
                    $scope.noData = true;
                }
                else
                {
                    $scope.noData = false;
                }
            }).error(function (data, status, headers, config) {
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });

        });

        $rootScope.$broadcast('fetchCompleted');
        $scope.deleteItem = function (id) {
            $rootScope.show("Please wait... Deleting from List");
            API.deleteItem(id, $rootScope.getToken())
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.doRefresh(2);
                }).error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });
        };
    })
.controller('updateProfileCtrl', function ($rootScope, $scope, API, $window) {
        $scope.data = $scope.list[0];


        $scope.close = function () {
            $scope.updateProfileTemplate.hide();
        };


        $scope.update = function (id) {
            var companyName = this.data.companyName,
                description = this.data.description,
                rate = this.data.rate,
                zipcode = this.data.zipcode,
                monHours = this.data.monHours,
                tueHours = this.data.tueHours,
                wedHours = this.data.wedHours,
                thuHours = this.data.thuHours,
                friHours = this.data.friHours,
                satHours = this.data.satHours,
                sunHours = this.data.sunHours;
            if (!companyName) return;

            $scope.updateProfileTemplate.hide();
            $rootScope.show();

            $rootScope.show("Please wait... updating profile");

            API.putItem(id, {
                companyName: companyName,
                description: description,
                rate: rate,
                zipcode: zipcode,
                monHours: monHours,
                tueHours: tueHours,
                wedHours: wedHours,
                thuHours: thuHours,
                friHours: friHours,
                satHours: satHours,
                sunHours: sunHours,
                isCompleted: false,
                user: $rootScope.getToken(),
                updated: Date.now()
            }, $rootScope.getToken())
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.doRefresh(1);
                }).error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });
        };

        $scope.searchCustomers =  function() {

        };
    })
.controller('newCtrl', function ($rootScope, $scope, API, $window) {
        $scope.data = {
            companyName: "",
            description: "",
            rate: "",
            zipcode:"",
            monHours:"",
            tueHours:"",
            wedHours:"",
            thuHours:"",
            friHours:"",
            satHours:"",
        };

        $scope.close = function () {
            $scope.modal.hide();
        };

        $scope.create = function () {
            var companyName = this.data.companyName,
                description = this.data.description,
                rate = this.data.rate,
                zipcode = this.data.zipcode,
                monHours = this.data.monHours,
                tueHours = this.data.tueHours,
                wedHours = this.data.wedHours,
                thuHours = this.data.thuHours,
                friHours = this.data.friHours,
                satHours = this.data.satHours,
                sunHours = this.data.sunHours;
            if (!companyName) return;
            $scope.modal.hide();
            $rootScope.show();

            $rootScope.show("Please wait... Creating new");

            var form = {
                companyName: companyName,
                description: description,
                rate: rate,
                zipcode: zipcode,
                monHours: monHours,
                tueHours: tueHours,
                wedHours: wedHours,
                thuHours: thuHours,
                friHours: friHours,
                satHours: satHours,
                sunHours: sunHours,
                isCompleted: false,
                user: $rootScope.getToken(),
                created: Date.now(),
                updated: Date.now()
            };

            API.saveItem(form, form.user)
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.doRefresh(1);
                })
                .error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });
        };
    });