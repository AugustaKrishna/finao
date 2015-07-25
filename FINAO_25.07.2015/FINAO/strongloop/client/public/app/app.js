angular.module('FINAOWeb', ['angular-storage', 'ui.router', 'weblogng', 'ngImgCrop'])
    .constant('FINAO_ENDPOINT_URI', 'http://localhost:2999/api/')
    .constant('ENDPOINT_URI', 'http://localhost:2999/api/')
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('registration', {
                url: '/registration',
                templateUrl: 'app/views/registration.html',
                controller: 'RegistrationCtrl',
                controllerAs: 'registration'
            })
            .state('tiles', {
                url: '/tiles',
                templateUrl: 'app/views/tiles.html',
                controller: 'TilesCtrl',
                controllerAs: 'tiles'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/views/login.tmpl.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'app/views/dashboard.tmpl.html',
                controller: 'DashboardCtrl',
                controllerAs: 'dashboard'
            })
            .state('editprofile', {
                url: '/editprofile',
                templateUrl: 'app/views/editprofile.html',
                controller: 'editprofileCtrl',
                controllerAs: 'editprofile'
            })
            .state('notifications', {
                url: '/notifications',
                templateUrl: 'app/views/notifications.tmpl.html',
                controller: 'notificationsCtrl',
                controllerAs: 'notifications'
            })
            .state('finaos', {
                url: '/finaos',
                templateUrl: 'app/views/Profile_public_finaos.html',
                controller: 'finaoCtrl'
            })
             .state('createfinaos', {
                 url: '/createfinaos/:id',
                 templateUrl: 'app/views/createfinao.html',
                 controller: 'finaoCtrl'
             })
        .state('finaosdrilldown', {
            url: '/finaosdrilldown/:fid',
            templateUrl: 'app/views/finaosdrilldown.html',
            controller: 'finaoCtrl'
        }).state('HomeFeed', {
            url: '/HomeFeed',
            templateUrl: 'app/views/HomeFeed.html',
            controller: 'HomefeedCtrl',
            controllerAs: 'HomeFeed'
        });

     //   $urlRouterProvider.otherwise('/dashboard');
        $httpProvider.interceptors.push('APIInterceptor');
    })
    .directive('bsTooltip', function () {  // Developer by Krishna kumar - For tool tip
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    // on mouseenter
                    $(element).tooltip('show');
                }, function () {
                    // on mouseleave
                    $(element).tooltip('hide');
                });
            }
        };
    })
    .service('APIInterceptor', function ($rootScope, UserService) {
        var service = this;

        service.request = function (config) {
            var currentUser = UserService.getCurrentUser(),
                access_token = currentUser ? currentUser.access_token : null;

            if (access_token) {
                config.headers.authorization = access_token;
            }
            return config;
        };

        service.responseError = function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return response;
        };
    })
    .service('UserService', function (store) {
        var service = this,
            currentUser = null;

        service.setCurrentUser = function (user) {
            currentUser = user;
            store.set('user', user);
            return currentUser;
        };

        service.getCurrentUser = function () {
            if (!currentUser) {
                currentUser = store.get('user');
            }
            return currentUser;
        };
    })
    .service('TilesService', function ($http, FINAO_ENDPOINT_URI) {
        var service = this,
            path = 'tiles/';

        function getUrl() {
            return FINAO_ENDPOINT_URI + path;
        }

        function getLogUrl(action) {
            return getUrl() + action;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

    })
    .service('LoginService', function ($http, ENDPOINT_URI) {
        var service = this,
            path = 'Users/';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getLogUrl(action) {
            return getUrl() + action;
        }

        service.login = function (credentials) {
            return $http.post(getLogUrl('login'), credentials);
        };

        service.logout = function () {
            return $http.post(getLogUrl('logout'));
        };

        service.register = function (user) {
            return $http.post(getUrl(), user);
        };
    })
    .service('ItemsModel', function ($http, ENDPOINT_URI) {
        var service = this,
            path = 'items/';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };
    })
    .service('TilesModel', function ($http, FINAO_ENDPOINT_URI) {
        var service = this,
            path = 'tiles/';

        function getUrl() {
            return FINAO_ENDPOINT_URI + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };
    })
    .service('RegistrationService', function ($http, FINAO_ENDPOINT_URI) {
        var service = this,
            path = 'registration/';

        function getUrl() {
            return FINAO_ENDPOINT_URI + path;
        }

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

    })

    .service('FinaOUsers', function ($http, FINAO_ENDPOINT_URI) {
        var service = this,
            path = 'finaousers/';


        function getUrl() {
            return FINAO_ENDPOINT_URI + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };

    })

    .controller('RegistrationCtrl', ['$scope', 'RegistrationService', function ($scope, RegistrationService) {
        var registrationController = this;

        function saveRegistration() {
            RegistrationService.create()
                .then(function (result) {
                });
        }
        function createRegistration(registrationForm) {
            ItemsModel.create(registrationForm)
                .then(function (result) {
                    initCreateForm();
                });
        }

        function initCreateForm() {
        }

        initCreateForm();
        saveRegistration();
    }])


    .controller('TilesCtrl', ['$scope', 'TilesModel', function ($scope, TilesModel) {
        var tilesBoard = this;

        function getTiles() {
            TilesModel.all()
                .then(function (result) {
                    tilesBoard.tiles = result.data;
                    $scope.tilesScope = tilesBoard.tiles;
                });
        }

        function initCreateForm() {
            tilesBoard.newTile = { name: '', description: '' };
        }

        tilesBoard.tiles = [];

        initCreateForm();
        getTiles();
    }])

    .controller('LoginCtrl', function ($rootScope, $state, LoginService, UserService) {
        /* Written by Nikhita */
        var login = this;

        function signIn(user) {
            LoginService.login(user)
                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        user.access_token = response.data.id;
                        user.userId = response.userId;
                        UserService.setCurrentUser(user);
                        $rootScope.$broadcast('authorized');
                        $state.go('dashboard');
                    } else {
                        alert("we got an error" + response.statusText);
                    }

                });

        }

        function register(user) {
            LoginService.register(user)
                .then(function (response) {
                    LoginService.login(user);
                });
        }

        function submit(user) {
            login.newUser ? register(user) : signIn(user);
        }

        login.newUser = false;
        login.submit = submit;
    })
    .controller('MainCtrl', function ($rootScope, $state, LoginService, UserService) {
        var main = this;

        function logout() {
            LoginService.logout()
                .then(function (response) {
                    main.currentUser = UserService.setCurrentUser(null);
                    $state.go('login');
                }, function (error) {
                    console.log(error);
                });
        }

        $rootScope.$on('authorized', function () {
            main.currentUser = UserService.getCurrentUser();
            //main.userInfo = 
        });

        $rootScope.$on('unauthorized', function () {
            main.currentUser = UserService.setCurrentUser(null);
            $state.go('login');
        });

        main.logout = logout;
        main.currentUser = UserService.getCurrentUser();
    })
    .controller('DashboardCtrl', function (ItemsModel) {
        var dashboard = this;

        function getItems() {
            ItemsModel.all()
                .then(function (result) {
                    dashboard.items = result.data;
                });
        }

        function createItem(item) {
            ItemsModel.create(item)
                .then(function (result) {
                    initCreateForm();
                    getItems();
                });
        }

        function updateItem(item) {
            ItemsModel.update(item.id, item)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
        }


        function deleteItem(itemId) {
            ItemsModel.destroy(itemId)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
        }

        function initCreateForm() {
            dashboard.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            dashboard.editedItem = angular.copy(item);
            dashboard.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return dashboard.editedItem !== null && dashboard.editedItem.id === itemId;
        }

        function cancelEditing() {
            dashboard.editedItem = null;
            dashboard.isEditing = false;
        }

        dashboard.items = [];
        dashboard.editedItem = null;
        dashboard.isEditing = false;
        dashboard.getItems = getItems;
        dashboard.createItem = createItem;
        dashboard.updateItem = updateItem;
        dashboard.deleteItem = deleteItem;
        dashboard.setEditedItem = setEditedItem;
        dashboard.isCurrentItem = isCurrentItem;
        dashboard.cancelEditing = cancelEditing;

        initCreateForm();
        getItems();
    })

  .constant('weblogngConfig', {
      apiKey: '48548598-f079-4c57-bb39-d9ca8344abd7',
      options: {
          publishNavigationTimingMetrics: true,
          publishUserActive: true,
          application: 'simple-rest-website'
      }
  })

    .controller('editprofileCtrl', ['$scope', 'FinaOUsers', 'UserService', function ($scope, FinaOUsers, UserService) {
        $scope.activeClass = 1;
        $scope.profile_image = "http://finaonation.s3-website-us-west-1.amazonaws.com/profile/no-image.png";
        $scope.banner_image = "http://finaonation.s3-website-us-west-1.amazonaws.com/timeline/no-image-banner.jpg";
        $scope.profile_image_file;
        $scope.banner_image_file;
        $scope.userInfo = UserService.getCurrentUser();
        FinaOUsers.fetch($scope.userInfo.access_token);
        console.log($scope.userInfo);
        /*
      //$scope.formData = {"firstName" : "", "lastName" : "", "uName" : $scope.userInfo.userName, "Bio" : ""};

     // console.log($scope.formData);
       $scope.showResizer = function(image) {
        $('#profileimage').attr('src',"http://www.gettyimages.co.uk/gi-resources/images/Homepage/Category-Creative/UK/UK_Creative_462809583.jpg");
            // if (image !== undefined) {
            //     if (image.size > 2000000) {
            //         var message = "This image is too large, please select an image that is less that 2 megabytes";
            //         ModalService.openMessage([message], true);
            //         return;
            //     }
            //     var aspectRatios = { profile: 1, timeline: 4 };
            //     ModalService.openImageResizer(image, type, aspectRatios[type]).result.then(function (blob) {
            //         $scope.uploadPhoto(type, blob);
            //     });
            // }
            // return;
        };
        */
        $scope.myImage = '';
        $scope.myCroppedImage = '';

        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);


    }])

    .controller('notificationsCtrl', ['$scope', function ($scope) {
        $scope.activeClass = 1;
    }])
    .controller('finaoCtrl', ['$scope', 'finaoService', '$state', '$location', '$stateParams', function ($scope, finaoService, $state, $location, $stateParams) {
        $scope.userid = 123; //TODO
        $scope.id = "";
        // $scope.createTile = true;

       
        $scope.getall = function () {

            finaoService.all($scope.userid).then(function (succ) {

                $scope.finaoList = succ.data;
                $scope.finaoCount = succ.data.length;
            }, function (err) { })

        };


        $scope.getFinaoCount = function () {
            finaoService.getFinaoCount($scope.userid).then(function (succ) {

                $scope.finaoCount = succ.data;
            }, function (err) { })

        };
        $scope.deleteconfirm = function (id)
        {
            $scope.delId = id;
            $("#deleteconfirmation").modal("show");
        }
        $scope.deleteFinao = function () {
            $("#deleteconfirmation").modal("hide");
            if ($scope.delId != 0) {
                finaoService.delete($scope.delId).then(function (succ) {

                    $("#alertpopup").modal('show');
                    $scope.delId = 0;
                    $scope.getall();
                }, function (err) { })
            }
            

        };

        $scope.getbyId = function (id) {
            finaoService.getbyId(id).then(function (succ) {
                $scope.id = id;
                $scope.finao = succ.data;
                $scope.description = $scope.finao.description;
                $scope.tile = $scope.finao.tile; $scope.tileclass = $scope.finao.tileclass;
                if ($scope.finao.visibility == 'Private')
                { $scope.visibility = true; }
                else {
                    $scope.visibility = false;
                }

            }, function (err) { })
        };
        $scope.create = function () {
            if ($scope.frmCreateFinao.$valid) {
                var visible;
                if ($scope.visibility)
                { visible = 'Private'; }
                else { visible = 'Public'; }
                var model = {
                    status: 'On Track',   // Status on track is default while create a finao
                    visibility: visible,
                    description: $scope.description,
                    tile: $scope.tile,
                    tileclass: $scope.tileclass,
                    userid: $scope.userid
                };
                if ($scope.id == "") {
                    $scope.msg = 'Finao created successfully';
                    finaoService.create(model).then(function (succ) {
                        $("#alertpopup").modal('show');
                        $scope.redirec = '#/finaos'
                       // $state.go('finaos');
                    }, function (err) { });
                }
                else {
                    model.id = $scope.id;
                    $scope.msg = 'Finao updated successfully';
                   
                    finaoService.update(model).then(function (succ) {
                        $("#alertpopup").modal('show');
                        $scope.redirec = '#/finaos'
                      //  $state.go('finaos');
                    }, function (err) { });
                }
            }
            else {
                _.each($scope.frmCreateFinao.$error.required, function (item) {
                    item.$pristine = false;
                });
            }

        }
        $scope.go_finos = function () {
            $("#alertpopup").modal("hide");
            $state.go('finaos');
        }
        $scope.go_create = function () {
            $scope.createtile = true;
            $state.go('createfinaos');
        }


        $scope.tile_click = function (tile, tilecls) {
            $scope.tile = tile;
            $scope.tileclass = tilecls;
            $scope.createTile = false; $scope.createForm = true;
        }
        $scope.change_tile = function () {
            $scope.createTile = true;
            $scope.createForm = false;
        }
        $scope.get_posts = function (fino)
        {
            $state.go("finaosdrilldown", { fid: fino.id });
            

        }


        $scope.getPostbyTile = function (fid)
        {
            finaoService.getPostbyTile(fid, $scope.userid).then(function (succ) {
                $scope.TilePost = succ.data;
            }, function (err) { });
        }

         $scope.formatDate = function (CreatedDate) {
             
            var CurrentDate = new Date();
            var timestamp1 = new Date(CurrentDate).getTime();
            var timestamp2 = new Date(CreatedDate).getTime();
            
            var diff = timestamp1 - timestamp2;
            $scope.dayDifference = Math.ceil(diff / (1000*3600*24));
        }
      
        if ($stateParams.id != "" && !angular.isUndefined($stateParams.id)) {
            var id = $stateParams.id;
            $scope.getbyId(id);

            $scope.createTile = false;
            $scope.createForm = true;

        } else if ($stateParams.fid != "" && !angular.isUndefined($stateParams.fid)) {
            
            $scope.getPostbyTile($stateParams.fid);
        }
        else {
           
            $scope.createTile = true;
        }
        $scope.getall();

        $scope.myInterval = 3000;

    }])
    .service('finaoService', function ($http, FINAO_ENDPOINT_URI) {

        var service = this,
          // path = 'a_userfinaos/findOne?filter=' + '{ "where": { "userid": ' + userId + '} }';
          path = 'a_userfinaos/';
        path1 = 'userposts/';
        function getUrl() {
            return FINAO_ENDPOINT_URI + path;
        }
        function getUrl1() {
            return FINAO_ENDPOINT_URI + path1;
        }
        service.getFinaoCount = function (userid) {
            return $http.get(getUrl() + '?filter={ "where": { "userid":'+userid+'}}');
        };
        service.all = function (userid) {
            return $http.get(getUrl() + '?filter=' + '{ "where": { "userid": ' + userid + '},"order": "id DESC" }');
        };
        service.create = function (model) {
            return $http.post(getUrl(), model);
        };
        service.update = function (model) {
            return $http.put(getUrl(), model);
        };

        service.delete = function (id) {
            return $http.delete(getUrl() + id);
        };

        service.getbyId = function (id) {
            return $http.get(getUrl() +  id);
        };
        service.getPostbyTile = function (id,userid) {
            return $http.get(getUrl1() + '?filter={"where": {"and": [{"FinaoUser.UserId": "' + userid + '"},{"Finaos.finaoid":"'+id+'"}]}}');
        };

    }).controller('HomefeedCtrl', ['$scope', 'HomeFeedService', function ($scope, HomeFeedService) {
        var Homemain = this;

        function getItemss() {
           
            HomeFeedService.all()
        .then(function (result) {
           
            Homemain.items = result.data;
            $scope.HomeList = Homemain.items;
            $scope.formatDate = function (CreatedDate) {
               
                var CurrentDate = new Date();
                var timestamp1 = new Date(CurrentDate).getTime();
                var timestamp2 = new Date(CreatedDate).getTime();

                var diff = timestamp1 - timestamp2;
                $scope.dayDifference = Math.ceil(diff / (1000 * 3600 * 24));

                //alert($scope.dayDifference);
            }
        });
        }
        getItemss();

        //$scope.formatDate = function (date) {
        //    debugger;
        //    var CurrentDate= (new Date(input), 'dd/MM/yyyy');
        //    var dateOut = new Date(date);
        //    var Days = CurrentDate - dateOut;
        //    return Days;
        //};

        $scope.ModelPopUp = function ($scope, $timeout, $dialog) {
            debugger;
            $timeout(function () {
                $dialog.dialog({}).open('HomeFeedFullView.html');
            }, 3000);
        }
    }])
    .service('HomeFeedService', function ($http, FINAO_ENDPOINT_URI) {
        var service = this,
            path = 'userposts/';

        function getUrl() {
            debugger;
            return FINAO_ENDPOINT_URI + path;
        }

        function getUrlFor(itemId) {
            debugger;
            return getUrl(path) + itemId;
        }

        service.all = function () {
            debugger;
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            debugger;
            return $http.get(getUrlFor(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlFor(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlFor(itemId));
        };

    })