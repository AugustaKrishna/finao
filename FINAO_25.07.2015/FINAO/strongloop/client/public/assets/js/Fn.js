/**
 * Created by smaddali on 7/9/15.
 */
angular.module('Fn', [
    'Fn.templates',
    'Common',
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'duParallax',
    'ngCookies',
    'jmdobry.angular-cache',
    'videosharing-embed',
    'angulartics',
    'angulartics.debug',
    'angulartics.google.analytics',
    'config'
]).config(function ($locationProvider, $anchorScrollProvider, $analyticsProvider, configuration, googleAnalyticsProvider) {
    $locationProvider.html5Mode(true);
    $anchorScrollProvider.disableAutoScrolling();
    googleAnalyticsProvider.init(configuration.gaAccount);
    $analyticsProvider.firstPageview(true);
    $analyticsProvider.withBase(true);
})
    .run(['$templateCache', function($templateCache) {
        $templateCache.put("template/carousel/carousel.html", $templateCache.get("fn/partials/directives/bootstrap/carousel.html"));
    }]);
;
angular.module('Fn')
    .provider('groupRouter', function () {

        this.$get = function() {
            return {
                getstateProvider: function() {
                    return this.stateProvider;
                }
            };
        };

        this.addGroupRoutes = function($stateProvider) {
            this.stateProvider = $stateProvider
                .state('fn.group', {
                    abstract: true,
                    url: 'group/:groupSlug',
                    resolve: {
                        group: function (me, $stateParams, $state, GroupService) {
                            if (me.error) {
                                $state.go('landing.page');
                            }
                            return GroupService.getGroup({ slug: $stateParams.groupSlug }, me).then(function(response){
                                return response;
                            });
                        },
                        members: function (me, group, $state, GroupService) {
                            return GroupService.getGroupMembers(group, me).then(function(response){
                                if (response.error) {
                                    $state.go('landing.page');
                                } else {
                                    return response;
                                }
                            });
                        }
                    },
                    views: {
                        'fn-page': {
                            controller: 'FnGroupCtrl',
                            templateUrl: 'fn/partials/profile/group/index.html'
                        }
                    }
                })
                .state('fn.group.finaos', {
                    url: '/finaos',
                    resolve: {
                        finaos: function (group, FinaoService) {
                            return FinaoService.getGroupFinaos(group, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFinaoCtrl',
                            templateUrl: 'fn/partials/profile/group/finaos.html'
                        }
                    }
                })
                .state('fn.group.finao', {
                    url: '/finaos/:finaoSlug',
                    resolve: {
                        finaos: function (group, $stateParams, FinaoService) {
                            return FinaoService.getGroupFinaos(group, $stateParams.finaoSlug, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFinaoCtrl',
                            templateUrl: 'fn/partials/profile/group/finaos.html'
                        }
                    }
                })
                .state('fn.group.create-finao', {
                    url: '/create-finao',
                    resolve: {
                        group: function (group) {
                            if(!group.hasOwnProperty('finaos')) {
                                group.finaos = [];
                            }
                            return group;
                        },
                        finaos: function() {
                            return false;
                        },
                        tiles: function (group, TileService) {
                            return TileService.getGroupTilesAvailable(group, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditFinaoCtrl',
                            templateUrl: 'fn/partials/profile/finaos/create-edit.html'
                        }
                    }
                })
                .state('fn.group.edit-finao', {
                    url: '/edit-finao/:finaoSlug',
                    resolve: {
                        me: function (me) {
                            if(!me.hasOwnProperty('finaos')) {
                                me.finaos = [];
                            }
                            return me;
                        },
                        finaos: function (group, FinaoService) {
                            return FinaoService.getGroupFinaos(group, false);
                        },
                        tiles: function (group, TileService) {
                            return TileService.getGroupTilesAvailable(group, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditFinaoCtrl',
                            templateUrl: 'fn/partials/profile/finaos/create-edit.html'
                        }
                    }
                })
                .state('fn.group.members', {
                    url: '/members',
                    views: {
                        'fn-profile-content': {
                            controller: 'FnGroupMembersCtrl',
                            templateUrl: 'fn/partials/profile/group/members.html'
                        }
                    }
                })
                .state('fn.group.tiles', {
                    abstract: true,
                    resolve: {
                        tiles: function (group, TileService) {
                            return TileService.getGroupTiles(group);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnGroupTilesCtrl',
                            templateUrl: 'fn/partials/profile/tiles.html'
                        }
                    }
                })
                .state('fn.group.tiles.all', {
                    url: '/tiles',
                    views: {
                        'fn-tile': {
                            templateUrl: 'fn/partials/profile/group/tiles-all.html'
                        }
                    }
                })
                .state('fn.group.tiles.detail', {
                    url: '/tiles/:tileSlug',
                    views: {
                        'fn-tile': {
                            controller: 'fnTileDetailCtrl',
                            templateUrl: 'fn/partials/profile/group/tiles-detail.html'
                        }
                    }
                })
                .state('fn.group.posts', {
                    url: '/posts',
                    resolve: {
                        posts: function ($state, group, me, FinaoService) {
                            if (!angular.isObject(group.members[me.profile.customer_id])) {
                                $state.go('landing.page');
                                return false;
                            }
                            return FinaoService.getGroupPosts(group, false, false, true, 10);
                        },
                        finao: function() { return false; }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                })
                .state('fn.group.posts-by-finao', {
                    url: '/posts/finao/:finaoId/:finaoSlug',
                    resolve: {
                        posts: function (group, $stateParams, FinaoService) {
                            var finao = { finao_id: $stateParams.finaoId, slug: $stateParams.finaoSlug };
                            return FinaoService.getGroupPosts(group, finao, false, true, 10);
                        },
                        finao: function(group, $stateParams, FinaoService) {
                            if ($stateParams.finaoId !== undefined) {
                                var finao = { finao_id: $stateParams.finaoId, slug: $stateParams.finaoSlug };
                                return FinaoService.getGroupFinaos(group, false, finao).then(function(response) {
                                    return response[0];
                                });
                            }

                            return false;
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                })
                .state('fn.group.post', {
                    url: '/posts/:postId/:postSlug',
                    resolve: {
                        posts: function (group, $stateParams, FinaoService) {
                            var post = {post_id: $stateParams.postId, slug: $stateParams.postSlug };
                            return FinaoService.getGroupPosts(group, false, post, true, 10);
                        },
                        finao: function() { return false; }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                });
        };
    });;angular.module('Fn')
    .provider('profileRouter', function () {

        this.$get = function() {
            return {
                getStateProvider: function() {
                    return this.stateProvider;
                }
            };
        };

        this.addProfileRoutes = function($stateProvider) {
            this.stateProvider = $stateProvider
                .state('fn.profile', {
                    abstract: true,
                    url: 'profile',
                    views: {
                        'fn-page': {
                            controller: 'FnEditUserProfileCtrl',
                            templateUrl: 'fn/partials/profile/edit/index.html'
                        }
                    },
                    resolve: {
                        me: function($state, me) {
                            if(me.error) {
                                $state.go('landing.page');
                            }
                        }
                    }
                })
                .state('fn.profile.edit', {
                    url: '/edit',
                    views: {
                        'fn-profile-content': {
                            templateUrl: 'fn/partials/profile/edit/user.html'
                        }
                    }
                })
                .state('fn.profile.tagnotes', {
                    url: '/tagnotes',
                    views: {
                        'fn-profile-content': {
                            templateUrl: 'fn/partials/profile/edit/tagnotes.html'
                        }
                    }
                })
                .state('fn.profile.messages', {
                    url: '/messages',
                    views: {
                        'fn-profile-content': {
                            controller: 'CommonMessageCtrl',
                            templateUrl: 'fn/partials/profile/edit/messages.html'
                        }
                    }
                })
                .state('fn.profile.message', {
                    url: '/messages/:messageId',
                    views: {
                        'fn-profile-content': {
                            controller: 'CommonMessageCtrl',
                            templateUrl: 'fn/partials/profile/edit/messages.html'
                        }
                    }
                })
                .state('fn.profile.notifications', {
                    url: '/notifications',
                    views: {
                        'fn-profile-content': {
                            controller: 'CommonNotificationCtrl',
                            templateUrl: 'fn/partials/profile/edit/notifications.html'
                        }
                    }
                })
                .state('fn.group-profile', {
                    abstract: true,
                    url: 'group-profile/:groupSlug',
                    views: {
                        'fn-page': {
                            controller: 'FnEditGroupProfileCtrl',
                            templateUrl: 'fn/partials/profile/edit/index.html'
                        }
                    },
                    resolve: {
                        group: function (me, $stateParams, $state, GroupService) {
                            if (me.error) {
                                $state.go('landing.page');
                            }
                            return GroupService.getGroup({ slug: $stateParams.groupSlug }, me).then(function(response){
                                return response;
                            });
                        }
                    }
                })
                .state('fn.group-profile.edit', {
                    url: '/edit',
                    views: {
                        'fn-profile-content': {
                            templateUrl: 'fn/partials/profile/edit/group.html'
                        }
                    }
                });
        };
    });;
angular.module('Fn')
    .provider('streamRouter', function () {

        this.$get = function() {
            return {
                getstateProvider: function() {
                    return this.stateProvider;
                }
            };
        };

        this.addStreamRoutes = function($stateProvider) {
            this.stateProvider = $stateProvider.state('fn.stream', {
                url: 'stream',
                resolve: {
                    stream: function($state, me, UserService) {
                        if (me.error) {
                            $state.go('landing.page');
                        }
                        return UserService.getStream(me, 10);
                    }
                },
                views: {
                    'fn-page': {
                        controller: 'FnStreamCtrl',
                        templateUrl: 'fn/partials/stream/index.html'
                    }
                },
            });
        };
    });;
angular.module('Fn')
    .provider('userRouter', function () {

        this.$get = function() {
            return {
                getstateProvider: function() {
                    return this.stateProvider;
                }
            };
        };

        this.addUserRoutes = function($stateProvider) {
            this.stateProvider = $stateProvider
                .state('fn.user', {
                    abstract: true,
                    url: ':username',
                    resolve: {
                        profile: function (me, $stateParams, $state, UserService) {
                            return UserService.getUserData({username: $stateParams.username}).then(function(response){
                                if (response.error) {
                                    $state.go('landing.page');
                                } else {
                                    return response;
                                }
                            });
                        }
                    },
                    views: {
                        'fn-page': {
                            controller: 'FnUserCtrl',
                            templateUrl: 'fn/partials/profile/user/index.html'
                        }
                    }
                })
                .state('fn.user.finaos', {
                    url: '/finaos',
                    resolve: {
                        finaos: function (profile, FinaoService) {
                            return FinaoService.getFinaos({ profile: profile }, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFinaoCtrl',
                            templateUrl: 'fn/partials/profile/user/finaos.html'
                        }
                    }
                })
                .state('fn.user.create-finao', {
                    url: '/create-finao',
                    resolve: {
                        me: function (me) {
                            if(!me.hasOwnProperty('finaos')) {
                                me.finaos = [];
                            }
                            return me;
                        },
                        group: function() {
                            return false;
                        },
                        finaos: function() {
                            return false;
                        },
                        tiles: function (me, TileService) {
                            return TileService.getTilesAvailable(me, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditFinaoCtrl',
                            templateUrl: 'fn/partials/profile/finaos/create-edit.html'
                        }
                    }
                })
                .state('fn.user.edit-finao', {
                    url: '/edit-finao/:finaoSlug',
                    resolve: {
                        me: function (me) {
                            if(!me.hasOwnProperty('finaos')) {
                                me.finaos = [];
                            }
                            return me;
                        },
                        group: function() {
                            return false;
                        },
                        finaos: function (me, FinaoService) {
                            return FinaoService.getFinaos(me, false);
                        },
                        tiles: function (me, TileService) {
                            return TileService.getTilesAvailable(me, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditFinaoCtrl',
                            templateUrl: 'fn/partials/profile/finaos/create-edit.html'
                        }
                    }
                })
                .state('fn.user.finao', {
                    url: '/finaos/:finaoSlug',
                    resolve: {
                        finaos: function (profile, $stateParams, FinaoService) {
                            return FinaoService.getFinaos({ profile: profile }, $stateParams.finaoSlug, false);
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFinaoCtrl',
                            templateUrl: 'fn/partials/profile/user/finaos.html'
                        }
                    }
                })
                .state('fn.user.tiles', {
                    abstract: true,
                    resolve: {
                        tiles: function (profile, TileService) {
                            return TileService.getTiles({ profile: profile });
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnTilesCtrl',
                            templateUrl: 'fn/partials/profile/tiles.html'
                        }
                    }
                })
                .state('fn.user.tiles.all', {
                    url: '/tiles',
                    views: {
                        'fn-tile': {
                            templateUrl: 'fn/partials/profile/user/tiles-all.html'
                        }
                    }
                })
                .state('fn.user.tiles.detail', {
                    url: '/tiles/:tileSlug',
                    views: {
                        'fn-tile': {
                            controller: 'fnTileDetailCtrl',
                            templateUrl: 'fn/partials/profile/user/tiles-detail.html'
                        }
                    }
                })
                .state('fn.user.posts', {
                    url: '/posts',
                    resolve: {
                        posts: function (profile, FinaoService) {
                            return FinaoService.getPosts({ profile: profile }, false, false, true, 10);
                        },
                        finao: function() { return false; }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                })
                .state('fn.user.posts-by-finao', {
                    url: '/posts/finao/:finaoId/:finaoSlug',
                    resolve: {
                        posts: function (profile, $stateParams, FinaoService) {
                            var finao = { finao_id: $stateParams.finaoId, slug: $stateParams.finaoSlug };
                            return FinaoService.getPosts({ profile: profile }, finao, false, true, 10);
                        },
                        finao: function(profile, $stateParams, FinaoService) {
                            if ($stateParams.finaoId !== undefined) {
                                var finao = { finao_id: $stateParams.finaoId, slug: $stateParams.finaoSlug };
                                return FinaoService.getFinaos({ profile: profile }, false, finao).then(function(response) {
                                    return response[0];
                                });
                            }

                            return false;
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                })
                .state('fn.user.post', {
                    url: '/posts/:postId/:postSlug',
                    resolve: {
                        posts: function (profile, $stateParams, FinaoService) {
                            var post = {post_id: $stateParams.postId, slug: $stateParams.postSlug };
                            return FinaoService.getPosts({ profile: profile }, false, post, true, 10);
                        },
                        finao: function() { return false; }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnPostsCtrl',
                            templateUrl: 'fn/partials/profile/posts.html'
                        }
                    }
                })
                .state('fn.user.inspired', {
                    url: '/inspired',
                    resolve: {
                        userInspired: function(FollowingInspiredService, profile) {
                            return FollowingInspiredService.getUserFollowingInspired({ profile: profile }, 'inspired');
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnInspiredCtrl',
                            templateUrl: 'fn/partials/profile/user/inspired.html'
                        }
                    }
                })
                .state('fn.user.following', {
                    url: '/following',
                    resolve: {
                        userFollowing: function(FollowingInspiredService, profile) {
                            return FollowingInspiredService.getUserFollowingInspired({ profile: profile }, 'following');
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFollowingCtrl',
                            templateUrl: 'fn/partials/profile/user/following.html'
                        }
                    }
                })
                .state('fn.user.followers', {
                    url: '/followers',
                    resolve: {
                        userFollowers: function(FollowingInspiredService, profile) {
                            return FollowingInspiredService.getUserFollowingInspired({ profile: profile }, 'followers');
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnFollowersCtrl',
                            templateUrl: 'fn/partials/profile/followers.html'
                        }
                    }
                })
                .state('fn.user.groups', {
                    url: '/groups',
                    views: {
                        'fn-profile-content': {
                            controller: 'FnGroupsCtrl',
                            templateUrl: 'fn/partials/profile/user/groups.html'
                        }
                    }
                })
                .state('fn.user.create-group', {
                    url: '/create-group',
                    resolve: {
                        me: function(profile) {
                            return { profile: profile };
                        },
                        group: function() {
                            return false;
                        }
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditGroupCtrl',
                            templateUrl: 'fn/partials/profile/user/create-edit-group.html'
                        }
                    }
                })
                .state('fn.user.edit-group', {
                    url: '/edit-group/:groupSlug',
                    resolve: {
                        me: function(profile) {
                            return { profile: profile };
                        },
                        group: function (profile, $stateParams, $state, GroupService) {
                            if (profile.error) {
                                $state.go('landing.page');
                            }
                            return GroupService.getGroup({ slug: $stateParams.groupSlug }, { profile: profile }).then(function(groupProfile){
                                return groupProfile;
                            });
                        },
                    },
                    views: {
                        'fn-profile-content': {
                            controller: 'FnCreateEditGroupCtrl',
                            templateUrl: 'fn/partials/profile/user/create-edit-group.html'
                        }
                    }
                });
        };
    });;angular.module('Fn')
    .controller('EmailValidationController', function ($scope, $location, EmailValidation) {
        $scope.user = {
            token: $location.search().token,
            email: '',
            pass: ''
        };
        $scope.verified = undefined;
        $scope.sent = undefined;

        this.reset = function () { $scope.verified = undefined; };

        this.verifyToken = function (user) {
            EmailValidation.verifyToken(user.token, user.email, user.pass)
                .success(function (data) {
                    $scope.verified = true;
                    $scope.username = data.data[0].username;
                })
                .error(function (data) {
                    $scope.verified = false;
                    $scope.errorMessages = data.errors;
                });
        };

        this.sendEmail = function (user) {
            EmailValidation.sendEmail(user)
                .success(function () { $scope.sent = true; })
                .error(function (data) {
                    $scope.sent = false;
                    $scope.errorMessages = data.errors;
                });
        };
    });
;angular.module('Fn')
    .controller('FnFlowCtrl', function ($scope) {
        $scope.flowOffset = function(elementPosition) {
            var factor = -0.8;
            var pos = elementPosition.elemY*factor;
            return {
                backgroundPosition: "0px " + pos + "px"
            };
        };
    });;angular.module('Fn')
    .controller('FnLandingCtrl', function ($scope, $window, ModalService, UserService, LandingService, me) {
        $scope.me = me;
        $scope.predicate = "sortTime";

        $scope.mockData = {
            finaos: LandingService.finaos,
            posts: LandingService.posts
        };

        $scope.statuses = [
            "behind",
            "on track",
            "ahead"
        ];

        $scope.bodyClass = 'landing';

        $scope.me.openSignup = function () {
            ModalService.openSignUp($scope.me).result.then(function (me) {
                UserService.me = me;
            });
        };

        $scope.explore = function () {
            ModalService.openVideo('kbkUjQp-P8s');
        };

        $scope.backgroundPosition = function(elementPosition) {
            var factor = 0.1;
            var pos = (elementPosition.elemY * factor) - 20;
            return {
                backgroundPosition: '0 ' + pos + 'px',
            };
        };

        $scope.scrollHugger = function(elementPosition) {
            var headerHeight = angular.element('header.navbar').height();

            var styleDefault = { position: 'static', width: 'auto', top: 0, opacity: 1 };
            var styleFixed = { position: 'fixed', top: headerHeight + 'px', width: '100%', opacity: 0.9 };

            if (angular.element(window).scrollTop() < angular.element('#profile').offset().top) {
                return styleDefault;
            }

            if (elementPosition.elemY <= headerHeight) {
                return styleFixed;
            }

            return styleDefault;
        };

        $scope.scrollCounter = function(elementPosition) {

            var styleDefault = { left: '-100%' };
            var styleSlide = { left: '0' };

            if (elementPosition.elemY >= 600) {
                return styleDefault;
            } else {
                return styleSlide;
            }

            return styleDefault;
        };

    });
;angular.module('Fn')
    .controller('FnSignupCtrl', function ($scope, $modalInstance, UserService) {
        $scope.showSignUp = true;
        $scope.me = {ref: 'finao_web'};
        $scope.error = false;
        $scope.showSuccess = false;
        $scope.format = 'dd/MM/yyyy';
        $scope.minDate = moment().subtract('years', 14).toDate();

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.me.signUp = function() {
            UserService.signUp($scope.me).then( function(response) {
                $scope.error = response.error;
                $scope.showSuccess = true;
                UserService.me = response.data.data;
            }, function(response) {
                $scope.error = response.data.error;
                $scope.errors = response.data.errors;
            });
        };
    });;angular.module('Fn')
    .controller('FnSinglePageSignupCtrl', function ($scope, $sce, $compile, $templateCache, ref, orgs, UserService) {
        $scope.showSignUp = true;

        var refferer = ref ? ref : 'finao_web';

        $scope.me = {
            ref: refferer,
            org_id: '',
            location_id: ''
        };

        $scope.slides = [
            {
                copy: 'I will set <small>goals</small>',
                image: '/skin/frontend/social/default/images/finao-athletics-baller.png'
            },
            {
                copy: 'I will <small>track</small> my progress',
                image: '/skin/frontend/social/default/images/finao-athletics-sprinter.png'
            },
            {
                copy: 'I will support my <small>team</small>',
                image: '/skin/frontend/social/default/images/finao-athletics-soccer.png'
            },
            {
                copy: 'I will be a <small>champion</small>',
                image: '/skin/frontend/social/default/images/finao-athletics-runner.png'
            }
        ];

        $scope.getCopy = function(index) {
            var template = $scope.slides[index].copy;
            return $sce.trustAsHtml(template);
        };

        $scope.error = false;
        $scope.showSuccess = false;
        $scope.format = 'dd/MM/yyyy';
        $scope.minDate = moment().subtract('years', 14).toDate();
        $scope.orgs = orgs;

        function suggestOrgs(term) {
            $scope.userSignupForm.$setValidity('required', false, 'location_id');
            $scope.userSignupForm.$setValidity('required', false, 'org_id');
            $scope.userSignupForm.$setValidity('required', false, 'autocomplete');

            var q = term.toLowerCase().trim();
            var results = [];

            angular.forEach($scope.orgs, function(org) {
                if (org.location_name.toLowerCase().indexOf(q) > -1 && results.length < 15) {
                    results.push({
                        value: org.location_name + ', ' + org.org_state,
                        org: org,
                        label: $sce.trustAsHtml('<span>' + org.location_name + ', <small>' + org.org_state + '<small></span>')
                    });
                }
            });

            return results;
        }

        function addSelectedOrg(selected) {
            $scope.me.org_id = selected.org.org_id;
            $scope.me.location_id = selected.org.location_id;
            $scope.userSignupForm.$setValidity('required', true, 'location_id');
            $scope.userSignupForm.$setValidity('required', true, 'org_id');
            $scope.userSignupForm.$setValidity('required', true, 'autocomplete');
        }

        function markInvalid(selected) {
            $scope.me.org_id = selected.org.org_id;
            $scope.me.location_id = selected.org.location_id;
        }

        $scope.suggestOrgs = {
            suggest: suggestOrgs,
            on_select: addSelectedOrg,
            on_error: markInvalid
        };

        $scope.me.signUp = function() {
            UserService.signUp($scope.me).then( function(response) {
                $scope.error = response.error;
                $scope.showSuccess = true;
                UserService.me = response.data.data;
            }, function(response) {
                $scope.error = response.data.error;
                $scope.errors = response.data.errors;
            });
        };

        $scope.changeSlide = function(index) {
            $scope.slides[index].active = true;
        };
    });;angular.module('Fn')
    .controller('FnCtrl', function ($scope, $state, ModalService, me, following, inspired) {

        $scope.me = me;
        $scope.me.following = following;
        $scope.me.inspired = inspired;
        $scope.state = $state;

        $scope.cacheBuster = new Date().getTime();

        $scope.statuses = [
            "behind",
            "on track",
            "ahead"
        ];

    });;angular.module('Fn')
    .controller('FnCreateEditFinaoCtrl', function ($scope, $state, string, me, group, finaos, tiles, FinaoService) {
        var verb, finao = false;

        if (group && !group.profile.can_create_finaos) {
            $state.go('fn.group.finaos', { slug: group.profile.slug });
        }

        var step1 = "Pick a Tile.";
        var step2 = "Name your FINAO. ";
        var step1tipMessage = "A Tile is an area of your life that you want to improve or enrich.";
        var step2tipMessage = "A FINAO is a particular goal that you want to achieve in a Tile.";
        var step3tipMessage = "Do you want to paint a masterpiece? Run a marathon? Cure HIV? Failure is not an option!";

        $scope.me = me;
        $scope.tiles = tiles;
        $scope.group = group;

        angular.forEach(finaos, function(finaoItem) {
            if(finaoItem.slug === $state.params.finaoSlug) {
                finao = finaoItem;
            }
        });

        if(finao) {
            verb = 'put';
            finao.oldSlug = finao.slug;
            $scope.finao = finao;
            $scope.title = "Edit your FINAO";
            $scope.titleMessage = step2;
            $scope.tipMessage = step2tipMessage;
        } else {
            verb = 'post';
            $scope.finao = {
                status: 'on track',
                private: 0,
                deleted: 0
            };
            $scope.title = "Create a FINAO";
        }

        $scope.selectTile = function(tile) {
            $scope.finao.tile_id = tile.tile_id;
            $scope.titleMessage = step2;
            $scope.tipMessage = step2tipMessage;
        };

        $scope.tileActive = function(tile) {
            if($scope.finao.tile_id !== undefined) {
                return tile.tile_id === $scope.finao.tile_id;
            }
            return true;
        };

        $scope.clearTile = function() {
            $scope.finao.tile_id = undefined;
            $scope.titleMessage = step1;
            $scope.tipMessage = step1tipMessage;
        };

        function saveEditDeleteUserFinao() {
            $scope.processing = true;
            if ($scope.group) {
                $scope.saveEditDeleteGroupFinao();
            } else {
                FinaoService.saveEditDeleteUserFinao($scope.me, $scope.finao, verb).then( function(){
                    $scope.processing = false;
                    $state.go('fn.user.finaos', { username: me.profile.username });
                }, function(response) {
                    $scope.processing = false;
                    $scope.error = true;
                    $scope.errors = response.data.data.errors;
                });
            }
        }

        function saveEditDeleteGroupFinao() {
            $scope.processing = true;
            FinaoService.saveEditDeleteGroupFinao($scope.group, $scope.finao, verb).then( function(){
                $scope.processing = false;
                $state.go('fn.group.finaos', { slug: $scope.group.profile.slug });
            }, function(response) {
                $scope.processing = false;
                $scope.error = true;
                $scope.errors = response.data.data.errors;
            });
        }

        $scope.saveEditDeleteFinao = group ? saveEditDeleteGroupFinao : saveEditDeleteUserFinao;

        $scope.$watch('finao.title', function(val) {
            var slug;
            $scope.finao.description = '';
            if (val !== undefined && !finao) {
                $scope.tipMessage = step3tipMessage;
                slug = string($scope.finao.title).slugify().s;
                if (slug.length > 40) {
                    slug = slug.slice(0, 40);
                }
                $scope.finao.slug = slug;
            }
        });
    });;angular.module('Fn')
    .controller('FnCreateEditGroupCtrl', function ($scope, $state, string, GroupService, UserService, ModalService, me, group) {
        var verb;
        $scope.isEdit = false;

        if(group) {
            verb = 'put';
            $scope.group = group;
            $scope.group.oldSlug = group.profile.slug;
            $scope.title = "Edit Group";
            $scope.isEdit = true;
        } else {
            verb = 'post';
            $scope.group = {
                profile: {
                    private: 0,
                    archived: 0,
                    deleted: 0
                }
            };
            $scope.title = "Create a Group";
        }

        $scope.saveGroup = function() {
            $scope.processing = true;
            GroupService.saveGroup(me, $scope.group.profile, verb).then( function(group) {
                $scope.processing = false;
                if (!group.error) {
                    $scope.me.groups[group.profile.group_id] = group.profile;
                    $state.go('fn.group.finaos', { groupSlug: group.profile.slug });
                } else {
                    $scope.errors = group.errors;
                }
            });
        };

        $scope.uploadPhoto = function(type, blob) {
            $scope.loading = true;
            GroupService.uploadPhoto(type, blob).then( function(response){
                $scope.loading = false;
                var img = type === 'profile' ? 'profile' : 'profile_timeline';
                $scope.group.profile[img + '_image_url'] = response[img + '_image_url'] + '&updateTime=' + Date.now();
            }, function(response) {
                $scope.loading = false;
                $scope.error = true;
                $scope.errors = response.data.errors;
            });
        };

        $scope.showResizer = function(image, type) {
            if (image !== undefined) {
                if (image.size > 2000000) {
                    var message = "This image is too large, please select an image that is less that 2 megabytes";
                    ModalService.openMessage([message], true);
                    return;
                }
                var aspectRatios = { profile: 1, timeline: 4 };
                ModalService.openImageResizer(image, type, aspectRatios[type]).result.then(function (blob) {
                    $scope.uploadPhoto(type, blob);
                });
            }
            return;
        };

        $scope.$watch('group.profile.name', function(val) {
            var slug;
            if (val !== undefined) {
                slug = string($scope.group.profile.name).slugify().s;
                if (slug.length > 40) {
                    slug = slug.slice(0, 40);
                }
                $scope.group.profile.slug = slug;
            }
        });
    });;angular.module('Fn')
    .controller('FnCreatePostCtrl', function ($scope, $state, string, me, group, finao, finaos, $modalInstance, FinaoService, YoutubeService, ImageService) {
        $scope.me = me;
        $scope.group = group;
        $scope.finaos = finaos;
        $scope.post = {
            hasVideo: false,
            manifest: [],
            body: 'asdasd',
            media: [{},{},{}]
        };

        if(finao) {
            $scope.post.finao = finao;
            $scope.post.finao_id = finao.finao_id;
        }

        $scope.statuses = [
            "behind",
            "on track",
            "ahead"
        ];

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.close = function(returnEntity) {
            $modalInstance.close(returnEntity.finaos);
        };

        $scope.pickFinao = function(finao) {
            $scope.post.finao = finao;
            $scope.post.finao_id = finao.finao_id;
        };

        $scope.editFinao = function(prop, value) {
            $scope.post.finao[prop] = value;
        };

        $scope.getVideo = function(item, $index) {
            item.mediaLoading = true;
            $scope.mediaLoading = true;
            $scope.post.media[$index].videoErrors = false;
            YoutubeService.getVideoInfo(item).then(function(response) {
                $scope.post.media[$index].details = response.data;
                item.mediaLoading = false;
                $scope.mediaLoading = false;
            }, function(errors) {
                item.mediaLoading = false;
                $scope.mediaLoading = false;
                this.item = { type: 'video' };
                $scope.post.media[$index].videoErrors = errors;
            }.bind(this));
        };

        $scope.addMedia = function(item, type, index) {
            item.type = type;
            if(type === 'photo') {
                if (item.file.size < 2000000) {
                    $scope.errors = false;
                    ImageService.loadAsDataUrl($scope, item, '.itemContent img', index);
                } else {
                    delete item.type;
                    $scope.errors = ["Your image is too large, please select one smaller than 2MB."];
                    $scope.$apply();
                }
            }
        };

        $scope.removeItem = function($index) {
            $scope.post.media[$index] = {};
        };

        $scope.createPost = function() {
            var func = $scope.me ? 'createPost' : 'createGroupPost';
            $scope.loading = true;
            $scope.post.status = $scope.post.finao.status;
            FinaoService[func]($scope.me, $scope.group, $scope.post).then( function(){
                $scope.loading = false;
                if ($scope.me) {
                    $state.go('fn.user.posts', { username: me.profile.username }, { reload: true });
                    $scope.close($scope.me);
                } else if ($scope.group) {
                    $state.go('fn.group.posts', { username: group.profile.slug }, { reload: true });
                    $scope.close($scope.group);
                }
            }, function(response) {
                $scope.loading = false;
                $scope.error = true;
                $scope.errors = response.data.errors;
            });
        };

        $scope.$watch('post.title', function(val) {
            var slug;
            if (val !== undefined) {
                $scope.post.slug = string($scope.post.title).slugify().s;
                slug = string($scope.post.title).slugify().s;
                if (slug.length > 40) {
                    slug = slug.slice(0, 40);
                }
                $scope.post.slug = slug;
            }
        });
    });;angular.module('Fn')
    .controller('FnFinaoCtrl', function ($scope, $state, UserService, ModalService, finaos) {
        $scope.finaos = finaos;
        $scope.predicate = "-sortTime";

        $scope.userCanEdit = function(me, group, finao) {
            if (!me.loggedIn) {
                return false;
            }
            if (!group) {
                return me.profile.customer_id === finao.customer_id;
            } else {
                return group.profile.is_editable;
            }
        };

        $scope.userCanCreateFinao = function(me, group, user) {
            if (!me.loggedIn) {
                return false;
            }
            if (!group) {
                return me.profile.customer_id === user.profile.entity_id;
            } else {
                return group.profile.can_create_finaos;
            }
        };

        $scope.userCanPost = function(me, group, user) {
            if (!me.loggedIn) {
                return false;
            }
            if (!group) {
                return me.profile.customer_id === user.profile.entity_id;
            } else {
                return group.profile.can_post;
            }
        };
    });;angular.module('Fn')
    .controller('FnFollowersCtrl', function ($scope, $state, userFollowers) {
        $scope.userFollowers = userFollowers;
    });;angular.module('Fn')
    .controller('FnPostMediaJumboCtrl', function ($scope, $modalInstance, item) {
        $scope.item = item;
        $scope.jumbo = true;

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };
    });;angular.module('Fn')
    .controller('FnPostsCtrl', function ($scope, FinaoService, ModalService, posts, finao) {
        $scope.posts = posts;
        $scope.predicate = "-sortTime";
        $scope.processing = false;
        $scope.finao = finao;

        $scope.loadMorePosts = function() {
            $scope.processing = true;
            FinaoService.getPosts($scope.user, finao, false, false, 10).then(function(posts) {
                $scope.processing = false;
                $scope.posts = posts;

                $scope.$broadcast('postsLoaded');
            });
        };

        $scope.removePost = function (postDeleted) {
            angular.forEach($scope.posts, function(post, key) {
                if(post.post_id === postDeleted.post_id) {
                    $scope.posts.splice(key, 1);
                }
            });
            $scope.$broadcast('postsLoaded');
        };
    });
;angular.module('Fn')
    .controller('FnTilesCtrl', function ($scope, $state, tiles) {
        $scope.user.tiles = tiles;
    });;angular.module('Fn')
    .controller('fnTileDetailCtrl', function ($scope, $state, tiles) {
        angular.forEach(tiles, function(tile) {
            if(tile.slug === $state.params.tileSlug) {
                $scope.tile = tile;
            }
        });
    });;angular.module('Fn')
    .controller('FnEditGroupProfileCtrl', function ($scope, $state, string, me, GroupService, group, ModalService) {
        $scope.state = $state;
        $scope.group = group;

        $scope.menu = [
            {
                name:"Edit Profile",
                link: "fn.group-profile.edit"
            }
        ];

        $scope.uploadPhoto = function(type, blob) {
            $scope.loading = true;
            GroupService.uploadPhoto(type, blob).then( function(response){
                $scope.loading = false;
                var img = type === 'profile' ? 'profile' : 'profile_timeline';
                group.profile[img + '_image_url'] = response[img + '_image_url'] + '&updateTime=' + Date.now();
            }, function(response) {
                $scope.loading = false;
                $scope.error = true;
                $scope.errors = response.data.errors;
            });
        };

        $scope.editGroupSummary = function() {
            $scope.loading = true;
            GroupService.editGroupSummary().then( function(){
                $scope.loading = false;
                $scope.saved = true;
            }.bind(this), function() {
                $scope.loading = false;
                $scope.saved = false;
            });
        };

        $scope.showResizer = function(image, type) {
            if (image !== undefined) {
                if (image.size > 2000000) {
                    var message = "This image is too large, please select an image that is less that 2 megabytes";
                    ModalService.openMessage([message], true);
                    return;
                }
                var aspectRatios = { profile: 1, timeline: 4 };
                ModalService.openImageResizer(image, type, aspectRatios[type]).result.then(function (blob) {
                    $scope.uploadPhoto(type, blob);
                });
            }
            return;
        };

        $scope.$watch('finao.title', function(val) {
            var slug;
            if (val !== undefined) {
                slug = string($scope.finao.title).slugify().s + '-' + $scope.me.profile.username;
                if (slug.length > 40) {
                    slug = slug.slice(0, 40);
                }
                $scope.finao.slug = slug;
            }
        });
    });
;angular.module('Fn')
    .controller('FnGroupMembersCtrl', function ($scope, $filter, GroupService) {

        $scope.editMember = function(user, newStatus, newRole) {
            GroupService.editMember($scope.group, user, newStatus, newRole).then( function(members) {
                $scope.group.members = members;
            });
        };
    });;angular.module('Fn')
    .controller('FnGroupTilesCtrl', function ($scope, $state, tiles) {
        $scope.group.tiles = tiles;
    });;angular.module('Fn')
    .controller('FnGroupCtrl', function ($scope, $state, UserService, ModalService, GroupService, group, members) {
        $scope.group = group;
        $scope.group.members = members;

        $scope.menu = [
            {
                name:"FINAOs",
                link: "fn.group.finaos",
                match: "fn.group.finao",
                count: $scope.group.profile.finaos,
                show: true
            },
            {
                name:"Tiles",
                link: "fn.group.tiles.all",
                match: "fn.group.tiles",
                count: $scope.group.profile.tiles,
                show: true
            },
            {
                name:"Members",
                link: "fn.group.members",
                count: Object.keys($scope.group.members).length,
                show: true
            },
            {
                name:"Posts",
                link: "fn.group.posts",
                match: "fn.group.post",
                count: $scope.group.profile.posts,
                show: angular.isObject(group.members[$scope.me.profile.customer_id])
            }
        ];

        if(!$scope.loggedIn) {
            $scope.me.openSignup = function() {
                ModalService.openSignUp($scope.me).result.then(function (me) {
                    UserService.me = me;
                });
            };
        }

        $scope.isMember = function() {
            return $scope.group.members[$scope.me.profile.entity_id] && $scope.group.members[$scope.me.profile.entity_id].status === 'active';
        };

        $scope.isPending = function() {
            return $scope.group.members[$scope.me.profile.entity_id] && $scope.group.members[$scope.me.profile.entity_id].status === 'pending';
        };

        $scope.isAdmin = function() {
            if ($scope.isMember()) {
                var member = $scope.group.members[$scope.me.profile.entity_id];
                return member.role === 'admin' || member.role === 'owner';
            }

            return false;
        };

        $scope.isOwner = function() {
            if ($scope.isMember()) {
                var member = $scope.group.members[$scope.me.profile.entity_id];
                return member.role === 'owner';
            }

            return false;
        };

        $scope.addMember = function() {
            GroupService.addMember($scope.me, $scope.group).then(function (members) {
                $scope.group.members = members;
                ModalService.openMessage(['You have requested access to ' + $scope.group.profile.name + '. You will be notified when an Admin has accepted your request'], false);
            });
        };

        $scope.openCreatePost = function() {
            ModalService.openCreatePost(false, $scope.group, false);
        };

        $scope.removeMember = function() {
            var member = $scope.group.members[$scope.me.profile.entity_id];
            var message = ['Are you sure that you would like to be removed from ' + $scope.group.profile.name + '?'];
            ModalService.openMessage(message, true).result.then(function () {
                GroupService.editMember($scope.group, member, 'deleted', member.role).then(function (members) {
                    $scope.group.members = members;
                    $state.go('fn.user.finaos', { username: $scope.me.profile.username }, { reload: true });
                });
            }.bind(this));
        };
    });;angular.module('Fn')
    .controller('FnEditUserProfileCtrl', function ($scope, $state, string, me, UserService, ModalService) {
        $scope.state = $state;

        $scope.menu = [
            {
                name:"Edit Profile",
                link: "fn.profile.edit"
            },
            // {
            //     name:"Tagnotes",
            //     link: "fn.profile.tagnotes"
            // },
//            {
//                name:"Messages",
//                link: "fn.profile.messages"
//            },
            {
                name:"Notifications",
                link: "fn.profile.notifications"
            },
            // {
            //     name:"Privacy",
            //     link: "fn.profile.privacy"
            // },
            // {
            //     name:"FINAO Shop",
            //     external: true,
            //     link: "/"
            // }
        ];

        $scope.uploadPhoto = function(type, blob) {
            $scope.loading = true;
            UserService.uploadPhoto(type, blob).then( function(response){
                $scope.loading = false;
                var img = type === 'profile' ? 'profile' : 'profile_timeline';
                me.profile[img + '_image_url'] = response[img + '_image_url'];
            }, function(response) {
                $scope.loading = false;
                $scope.error = true;
                $scope.errors = response.data.errors;
            });
        };

        $scope.editMyProfile = function() {
            $scope.loading = true;
            UserService.editMyProfile().then( function(){
                $scope.loading = false;
                $scope.saved = true;
            }.bind(this), function() {
                $scope.loading = false;
                $scope.saved = false;
            });
        };

        $scope.saveTagnote = function(tagnote) {
            $scope.loading = true;
            UserService.saveTagnote(tagnote).then( function(){
                $scope.loading = false;
                tagnote.saved = true;
            }.bind(this), function() {
                $scope.loading = false;
                tagnote.saved = false;
            });
        };

        $scope.showResizer = function(image, type) {
            if (image !== undefined) {
                if (image.size > 2000000) {
                    var message = "This image is too large, please select an image that is less that 2 megabytes";
                    ModalService.openMessage([message], true);
                    return;
                }
                var aspectRatios = { profile: 1, timeline: 4 };
                ModalService.openImageResizer(image, type, aspectRatios[type]).result.then(function (blob) {
                    $scope.uploadPhoto(type, blob);
                });
            }
            return;
        };

        $scope.$watch('finao.title', function(val) {
            var slug;
            if (val !== undefined) {
                slug = string($scope.finao.title).slugify().s + '-' + $scope.me.profile.username;
                if (slug.length > 40) {
                    slug = slug.slice(0, 40);
                }
                $scope.finao.slug = slug;
            }
        });
    });
;angular.module('Fn')
    .controller('FnFollowingCtrl', function ($scope, $state, userFollowing) {
        $scope.userFollowing = userFollowing;
    });;angular.module('Fn')
    .controller('FnForgotPasswordCtrl', function ($scope, UserService, $modalInstance) {
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.requestPassword = function(me) {
            UserService.requestPassword(me).then( function () {
                $scope.showSuccess = true;
            });
        };
    });;angular.module('Fn')
    .controller('FnGroupsCtrl', function ($scope, $state, groups) {
        $scope.groups = groups;
    });;angular.module('Fn')
    .controller('FnInspiredCtrl', function ($scope, $state, userInspired) {

        var flatInspired = {};

        angular.forEach(userInspired, function(user) {
            angular.forEach(user.posts, function(post) {
                flatInspired[post.post_id] = post;
            });
        });

        $scope.inspired = flatInspired;

        $scope.hasInspired = Boolean(Object.keys($scope.inspired).length);

        $scope.postsInspired = true;

        $scope.changePostInspired = function(postInspired) {
            if($scope.me.profile.username === $scope.user.profile.username) {
                if(!postInspired.isInspired()) {
                    delete $scope.inspired[postInspired.post_id];
                }
                updateInspired();
            }
        };

        function updateInspired () {
            if(!Object.keys(userInspired).length) {
                $scope.hasInspired = false;
            }

            $scope.$broadcast('postsLoaded');
        }

        $scope.removePost = function (postDeleted) {
            delete $scope.inspired[postDeleted.post_id];
            $scope.$broadcast('postsLoaded');
        };

    });;angular.module('Fn')
    .controller('FnStreamCtrl', function ($scope, $state, UserService, FinaoService, ModalService, me, stream) {
        $scope.stream = stream;
        $scope.me = UserService.me;

        $scope.processing = false;

        $scope.menu = [
            {
                name:"FINAOs",
                link: "fn.user.finaos",
                count: $scope.me.profile.finaos,
                show: true
            },
            {
                name:"Tiles",
                link: "fn.user.tiles.all",
                count: $scope.me.profile.tiles,
                show: true
            },
            {
                name:"Posts",
                link: "fn.user.posts",
                count: $scope.me.profile.posts,
                show: true
            },
            {
                name:"Inspired",
                link: "fn.user.inspired",
                count: $scope.me.profile.inspired,
                show: true
            },
            {
                name:"Following",
                link: "fn.user.following",
                count: $scope.me.profile.following,
                show: true
            },
            {
                name:"Followers",
                link: "fn.user.followers",
                count: $scope.me.profile.followers,
                show: true
            },
            {
                name:"Groups",
                link: "fn.user.groups",
                match: "fn.user.edit-group",
                count: Object.keys($scope.me.groups).length,
                show: true
            }

        ];

        $scope.$watch('me.profile.inspired', function() {
            $scope.menu[3].count = $scope.me.profile.inspired;
        });

        $scope.loadMorePosts = function() {
            $scope.processing = true;
            UserService.getStream($scope.me, 10).then(function(stream) {
                $scope.processing = false;
                $scope.stream = stream;
                $scope.$broadcast('postsLoaded');
            });
        };

        $scope.removePost = function (postDeleted) {
            angular.forEach($scope.stream.posts, function(post, key) {
                if(post.post_id === postDeleted.post_id) {
                    $scope.stream.posts.splice(key, 1);
                }
            });
            $scope.$broadcast('postsLoaded');
        };
    });
;angular.module('Fn')
    .controller('FnUserCtrl', function ($scope, $state, parallaxHelper, FinaoService, UserService, TileService, ModalService, profile) {
        $scope.user = { profile: profile };
        $scope.entity = $scope.user;

        $scope.finScapeOffset = parallaxHelper.createAnimator(-0.3, 453, -553, 153);

        $scope.user.isMe = $scope.me.loggedIn && $scope.me.profile.entity_id === $scope.user.profile.entity_id;

        $scope.menu = [
            {
                name:"FINAOs",
                link: "fn.user.finaos",
                match: "fn.user.finao",
                count: $scope.user.profile.finaos,
                show: true
            },
            {
                name:"Tiles",
                link: "fn.user.tiles.all",
                match: "fn.user.tiles",
                count: $scope.user.profile.tiles,
                show: true
            },
            {
                name:"Posts",
                link: "fn.user.posts",
                match: "fn.user.post",
                match2: "fn.user.posts-by-finao",
                count: $scope.user.profile.posts,
                show: true
            },
            {
                name:"Inspired",
                link: "fn.user.inspired",
                match: "fn.user.inspired",
                count: $scope.user.profile.inspired,
                show: true
            },
            {
                name:"Following",
                link: "fn.user.following",
                match: "fn.user.following",
                count: $scope.user.profile.following,
                show: true
            },
            {
                name:"Followers",
                link: "fn.user.followers",
                match: "fn.user.followers",
                count: $scope.user.profile.followers,
                show: $scope.user.isMe
            }
        ];

        if ($scope.user.isMe) {

            var groupMenu = {
                name:"Groups",
                link: "fn.user.groups",
                match: "fn.user.edit-group",
                count: Object.keys($scope.me.groups).length,
                show: $scope.user.isMe
            };

            $scope.menu.push(groupMenu);
        }

        $scope.$watch('user.profile.inspired', function() {
            $scope.menu[3].count = $scope.user.profile.inspired;
        });

        if (!$scope.loggedIn) {
            $scope.me.openSignup = function() {
                ModalService.openSignUp($scope.me).result.then(function (me) {
                    UserService.me = me;
                });
            };
        }

        $scope.openCreatePost = function() {
            ModalService.openCreatePost($scope.me, false, false);
        };

    });;angular.module("Fn").directive('disableNgAnimate', ['$animate', function($animate) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            $animate.enabled(false, element);
        }
    };
}]);;angular.module("Fn")
    .directive('dateValidator', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ctrl) {
                var minDate = moment(scope.minDate);

                ctrl.$parsers.unshift(function(value) {
                    var valid = moment(minDate) >= moment(value, "DD/MM/YYYY");
                    ctrl.$setValidity('dateValidator', valid);
                    ctrl.$setValidity('required', valid);
                    ctrl.$setValidity('dateDisabled', valid);
                    return value;
                });

                ctrl.$formatters.unshift(function(value) {
                    var valid = moment(minDate) >= moment(value);
                    ctrl.$setValidity('dateValidator', valid);
                    ctrl.$setValidity('required', valid);
                    ctrl.$setValidity('dateDisabled', valid);
                    return value;
                });
            }
        };
    });;angular.module("Fn")
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.model);
                var modelSetter = model.assign;
                var input = element.find('input');
                var button = element.find('.photoUpload');
                var callback = $parse(attrs.callback);
                var type = attrs.type;
                var index = attrs.index;

                function click() { input.trigger('click'); }
                function change(){
                    scope.$apply(function(){
                        modelSetter(scope, input[0].files[0]);
                    });

                    if(callback) {
                        callback(scope, {item: scope.item, type: type, index: index});
                    }
                }

                button.bind('click', click);
                input.bind('change', change);
                scope.$on('$destroy', function () {
                    button.off('click', click);
                    input.off('change', change);
                });
            }
        };
    }]);
;angular.module("Fn").directive('finaoPostList', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var getter = $parse(attrs.finaoPostList);
            function shufflePosts() {
                var posts = getter(scope);
                var oddEven = 0;
                scope.columnOne = [];
                scope.columnTwo = [];
                angular.forEach(posts, function(post) {
                    if(oddEven % 2 === 0) {
                        scope.columnOne.push(post);
                    } else {
                        scope.columnTwo.push(post);
                    }
                    oddEven++;
                });
            }

            shufflePosts();

            scope.$on('postsLoaded', shufflePosts);
        }
    };
});;angular.module("Fn").directive('finaoPostMedia', function($animate, $sce, $window, ImageService, ModalService) {
    return {
        restrict: 'EA',
        templateUrl: 'fn/partials/directives/finao-post-media.html',
        link: function(scope, element) {

            if(scope.item.type === 'photo') {
                if (typeof scope.item.path === undefined) {
                    element.remove();
                    return false;
                }
            }

            if((scope.item.type === 'video') && (scope.item.details)) {
                scope.item.embed = $sce.trustAsHtml(scope.item.details.html);
            }

            scope.openJumbo = function() {
                ModalService.openPostMediaJumbo(scope.item);
            };
        }
    };
});

;angular.module("Fn").directive('finaoPost', function($state, $animate, $timeout, FollowingInspiredService, FinaoService, ModalService) {
    return {
        restrict: 'EA',
        scope: {
            post: '=finaoPost',
            me: '=me',
            changePostUserInspired: '&changePostInspired',
            onDeleted: '&'
        },
        templateUrl: 'fn/partials/directives/finao-post.html',
        link: function(scope) {
            scope.animate = false;
            scope.animateGlobal = true;

            scope.postOptions = {
                postOptionsOpen: false
            };

            scope.$watch('animateGlobal', function(val){
                $animate.enabled(val);
            });

            scope.isMe = scope.me.loggedIn && scope.post.user.username === scope.me.profile.username;
            function changeFollowFinao(verb, post) {
                var finao = {
                    finao_id: post.finao_id,
                    slug: post.finao_slug,
                };
                if(!scope.processing){
                    scope.processing = true;
                    FollowingInspiredService.changeFollowFinao(finao, scope.post.user, scope.me, verb).then(function() {
                        scope.processing = false;
                    }, function(response) {
                        scope.processing = false;
                        ModalService.openMessage(response.data.errors, false);
                    });
                }
            }

            scope.unfollowFinao = changeFollowFinao.bind(null, 'delete');
            scope.followFinao = changeFollowFinao.bind(null, 'put');


            function isFollowing(type, post) {
                var follower = scope.me.following;
                var following = scope.post.user.username;
                return (follower.hasOwnProperty(following) && !!follower[following][type][post[type]]);
            }

            scope.followingFinao = isFollowing.bind(null, 'finao_id');
            scope.followingTile = isFollowing.bind(null, 'tile_id');

            scope.changePostInspired = function() {
                var verb = this.post.isInspired() ? 'delete' : 'post';

                if(!scope.processing){
                    scope.processing = true;
                    FollowingInspiredService.changePostInspired(scope.me, this.post, scope.post.user, verb).then(function(response) {
                        scope.me.inspired = response;
                        scope.processing = false;
                        scope.changePostUserInspired({postInspired: this.post});
                    }.bind(this), function(response) {
                        scope.processing = false;
                        ModalService.openMessage(response.data.errors, false);
                    });
                }

            };

            scope.deletePost = function (postDeleted) {
                ModalService.openMessage(['Are you sure you want to delete this post?'], true).result.then(function () {
                    if (postDeleted.group_id) {
                        FinaoService.deleteGroupPost(scope.post.group, postDeleted).then(function () {
                            scope.onDeleted({ postDeleted: postDeleted });
                        });
                    } else {
                        FinaoService.deletePost(scope.post.user, postDeleted).then(function () {
                            scope.onDeleted({postDeleted: postDeleted});
                        });
                    }
                });
            };

            scope.flagPost = function (post) {
                if (post.group_id) {
                    FinaoService.flagGroupPost(scope.me, post).then(function () {
                        scope.onDeleted({postDeleted: post});
                    }.bind(this));
                } else {
                    FinaoService.flagPost(scope.me, post).then(function () {
                        scope.onDeleted({postDeleted: post});
                    }.bind(this));
                }
            };

            scope.post.isInspired = function() {
                if (scope.me.inspired) {
                    var inspired = scope.me.inspired;
                    var inspirer = scope.post.user.username;
                    return (inspired.hasOwnProperty(inspirer) && !!inspired[inspirer].posts[scope.post.post_id]);
                } else {
                    return false;
                }
            };
        }
    };
});
;angular.module("Fn").directive('finaoTile', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/finao-tile.html',
        link: function(scope, element, attr) {
            element.addClass('fn-icon-' + attr.slug);
            scope.title = attr.title;
        }
    };
});;angular.module("Fn").directive('finao', function (FinaoService, FollowingInspiredService, ModalService) {
    return {
        restrict: 'A',
        templateUrl: 'fn/partials/directives/finao.html',
        scope: {
            finao: '=finao',
            me: '=me',
            tile: '=fnTile',
            user: '=user',
            canEdit: '&'
        },
        link: function(scope) {
            if(scope.finao.searched === true) {
                scope.finao.highlighted = true;
            }

            scope.deleteFinao = function(finaoDeleted) {
                var message = "Are you sure you want to delete this FINAO?";
                ModalService.openMessage([message], true).result.then(function () {
                    finaoDeleted.deleted = true;
                    FinaoService.saveEditDeleteUserFinao(scope.me, finaoDeleted, 'delete');
                }.bind(this));
            };

            scope.changeFollowFinao = function(finao) {
                var verb;
                var follower = scope.me;
                var following = scope.user.profile.username;

                if(follower.following.hasOwnProperty(following) && follower.following[following].finao_id[finao.finao_id]) {
                    verb = 'delete';
                } else {
                    verb = 'put';
                }

                if(!scope.processing){
                    scope.processing = true;
                    FollowingInspiredService.changeFollowFinao(finao, scope.user, scope.me, verb).then(function(response) {
                        scope.processing = false;
                        scope.me.following = response.data.data;
                    }, function(response) {
                        scope.processing = false;
                        ModalService.openMessage(response.data.errors, false);
                    });
                }
            };

            scope.openCreatePost = function() {
                ModalService.openCreatePost(scope.me, false, scope.finao);
            };
        }
    };
});

;angular.module("Fn").directive('groupFinao', function (FinaoService, FollowingInspiredService, ModalService) {
    return {
        restrict: 'A',
        templateUrl: 'fn/partials/directives/group-finao.html',
        scope: {
            finao: '=groupFinao',
            me: '=me',
            tile: '=fnTile',
            group: '=group',
            canEdit: '&',
            canPost: '&'
        },
        link: function(scope) {
            if(scope.finao.searched === true) {
                scope.finao.highlighted = true;
            }

            scope.deleteFinao = function(finaoDeleted) {
                var message = "Are you sure you want to delete this FINAO?";
                ModalService.openMessage([message], true).result.then(function () {
                    finaoDeleted.deleted = true;
                    FinaoService.saveEditDeleteGroupFinao(scope.group, finaoDeleted, 'delete');
                }.bind(this));
            };

            scope.changeFollowFinao = function(finao) {
                var verb;
                var follower = scope.me;
                var following = scope.user.profile.username;

                if(follower.following.hasOwnProperty(following) && follower.following[following].finao_id[finao.finao_id]) {
                    verb = 'delete';
                } else {
                    verb = 'put';
                }

                if(!scope.processing){
                    scope.processing = true;
                    FollowingInspiredService.changeFollowFinao(finao, scope.group, scope.me, verb).then(function(response) {
                        scope.processing = false;
                        scope.me.following = response.data.data;
                    }, function(response) {
                        scope.processing = false;
                        ModalService.openMessage(response.data.errors, false);
                    });
                }
            };

            scope.openCreatePost = function() {
                ModalService.openCreatePost(false, scope.group, scope.finao);
            };
        }
    };
});

;angular.module("Fn").directive('groupMember', function () {

    var link = function link(scope) {

        scope.acceptMember = function() {
            scope.user.newStatus = 'active';
            scope.editMember();
        };

        scope.deleteUser = function() {
            scope.user.newStatus = 'deleted';
            scope.editMember();
        };

        scope.makeAdmin = function() {
            scope.user.newRole = 'admin';
            scope.editMember();
        };

        scope.removeAdmin = function() {
            scope.user.newRole = 'member';
            scope.editMember();
        };

        scope.isAdmin = function() {
            return scope.user.role === 'admin' || scope.user.role === 'owner';
        };

        scope.isOwner = function() {
            return scope.user.role === 'owner';
        };
    };

    return {
        restrict: 'A',
        templateUrl: 'fn/partials/directives/group-member.html',
        scope: {
            user: '=groupMember',
            group: '=group',
            editMember: '&',
            canEditMembers: '&'
        },
        link: link
    };
});;angular.module("Fn").directive('groupProfile', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/group-profile.html',
    };
});

;angular.module("Fn").directive('landingImage', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/landing-image.html',
        scope: {
            data: '&'
        },
        link: function(scope, element, attr) {
            scope.data.image = attr.image;
            scope.data.username = attr.username;
            scope.data.quote = attr.quote;
        }
    };
});

;angular.module("Fn")
    .directive('ngFormMatch', function($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ctrl) {
                var watch = attr.ngModel.split('_reenter')[0];
                var reenter = attr.ngModel;

                ctrl.$parsers.unshift(function(value) {
                    var getter = $parse(watch);
                    var valid = (getter(scope) === value);
                    ctrl.$setValidity('ngFormMatch', valid);
                    ctrl.$setValidity('required', valid);
                    return valid ? value : undefined;
                });

                ctrl.$formatters.unshift(function(value) {
                    var getter = $parse(watch);
                    if (getter(scope) !== undefined) {
                        var valid = (getter(scope) === value);
                        ctrl.$setValidity('ngFormMatch', valid);
                        ctrl.$setValidity('required', valid);
                    }
                    return value;
                });

                scope.$watch(watch, function(value) {
                    var getter = $parse(reenter);
                    var valid = (value === getter(scope));
                    ctrl.$setValidity('ngFormMatch', valid);
                    ctrl.$setValidity('required', valid);
                });
            }
        };
    });
;angular.module('Fn').directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
        link: function(scope, elem, attrs) {
            var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
            $window = angular.element($window);
            scrollDistance = 0;
            if (attrs.infiniteScrollDistance !== null) {
                scope.$watch(attrs.infiniteScrollDistance, function(value) {
                    scrollDistance = parseInt(value, 10);
                    return scrollDistance;
                });
            }

            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.infiniteScrollDisabled !== null) {
                scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }

            handler = function() {
                var elementBottom, remaining, shouldScroll, windowBottom;
                windowBottom = $window.height() + $window.scrollTop();
                elementBottom = elem.offset().top + elem.height();
                remaining = elementBottom - windowBottom;
                shouldScroll = remaining <= $window.height() * scrollDistance;
                if (shouldScroll && scrollEnabled) {
                    if ($rootScope.$$phase) {
                        return scope.$eval(attrs.infiniteScroll);
                    } else {
                        return scope.$apply(attrs.infiniteScroll);
                    }
                } else if (shouldScroll) {
                    checkWhenEnabled = true;
                    return checkWhenEnabled;
                }
            };

            $window.on('scroll', handler);
            scope.$on('$destroy', function() {
                return $window.off('scroll', handler);
            });

            return $timeout(function() {
                if (attrs.infiniteScrollImmediateCheck) {
                    if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                        return handler();
                    }
                } else {
                    return handler();
                }
            }, 0);
        }
    };
}]);
;angular.module("Common").directive('notificationFull', ['$compile', '$templateCache', "$parse", function($compile, $templateCache, $parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var notificationGetter = $parse(attrs.notificationFull);
            var notification = notificationGetter(scope);
            var template = $templateCache.get('fn/partials/directives/notifications/' + notification.type + '.html');
            element.html($compile(template)(scope));
        }
    };
}]);;angular.module("Fn").directive('postFinao', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/post-finao.html',
        link: function(scope, element, attr) {
            element.addClass('fn-icon-' + attr.slug);
            scope.title = attr.title;
        }
    };
});;angular.module("Fn").directive('profileMenu', function ($state) {
    return {
        restrict: 'A',
        templateUrl: 'fn/partials/directives/profile-menu.html',
        scope: {
            entity: '=entity',
            menu: '=menu'
        },
        link: function(scope) {
            scope.state = $state;
        }
    };
});;angular.module("Fn").directive('resizer', function ($parse, $window) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'fn/partials/directives/resizer.html',
        link: function (scope, element, attrs) {
            scope.hideCanvas = true;
            scope.hideImage = false;
            scope.cropAvailable = false;
            scope.cropped = false;
            scope.selected = false;

            var canvas = element.find('canvas');
            var ctx = canvas[0].getContext('2d');

            var origImage = $('.imgCropPreview');
            var origImageSize = {};
            var image;
            var file;
            var jcrop;

            var getter = $parse(attrs.src);
            var saver = $parse(attrs.onSave);

            var img = {};
            var crop = {};
            var aspect = parseFloat($parse(attrs.aspectRatio)(scope));

            scope.save = function () {
                var dataUrl = canvas[0].toDataURL('image/jpeg', 1);
                var blob = dataURLToBlob(dataUrl);
                saver(scope, {image: blob });
            };

            scope.undo = function () {
                scope.hideCanvas = true;
                scope.hideImage = false;
                scope.cropped = false;
            };

            scope.crop = function() {
                scope.hideCanvas = false;
                scope.cropped = true;
            };

            function render() {
                var ratio = {
                    width: img.w / $('.imgCropPreview').width(),
                    height: img.h / $('.imgCropPreview').height()
                };

                var endCrop = {
                    x: crop.x * ratio.width,
                    y: crop.y * ratio.height,
                    w: crop.w * ratio.width,
                    h: crop.h * ratio.height,
                };

                canvas[0].width = endCrop.h * aspect;
                canvas[0].height = endCrop.h;
                ctx.drawImage(image, endCrop.x, endCrop.y, endCrop.w, endCrop.h, 0, 0, endCrop.w, endCrop.h);
            }

            function renderJcrop() {
                image = file;
                origImage.attr({src: file.src, style: ''});

                origImage.Jcrop({
                    aspectRatio: aspect,
                    onChange: saveCoords,
                    onSelect: activateCrop
                }, function(){
                    jcrop = this;

                    if (origImageSize.w === undefined) {
                        origImageSize.w = origImage.width();
                        origImageSize.h = origImage.height();
                    } else {
                        origImage.css({width: origImageSize.w, height: origImageSize.h });
                    }
                });


            }

            scope.$watch(attrs.src, function (newValue) {
                if(newValue === undefined) { return; }

                var reader = new FileReader();
                reader.onload = function (e) {
                    file = new Image();

                    file.onload = function () {
                        renderJcrop();
                    };
                    file.src = e.target.result;
                };
                reader.readAsDataURL(getter(scope));
            });

            scope.$watch('cropped', function (cropped) {
                if(cropped) {
                    createCanvas();
                    jcrop.destroy();
                    scope.hideImage = true;
                } else if(file !== undefined) {
                    renderJcrop();
                }
            });

            function saveCoords(c) {
                scope.cropAvailable = true;
                crop = c;
            }

            function activateCrop() {
                scope.selected = true;
            }

            function createCanvas() {
                img.w = file.width;
                img.h = file.height;
                $window.requestAnimationFrame(render);
            }

            function dataURLToBlob(dataURL) {
                var BASE64_MARKER = ';base64,';
                var parts, contentType, raw, uInt8Array, rawLength;

                if (dataURL.indexOf(BASE64_MARKER) === -1) {
                    parts = dataURL.split(',');
                    contentType = parts[0].split(':')[1];
                    raw = decodeURIComponent(parts[1]);

                    return new Blob([raw], {type: contentType});
                }

                parts = dataURL.split(BASE64_MARKER);
                contentType = parts[0].split(':')[1];
                raw = window.atob(parts[1]);
                rawLength = raw.length;

                uInt8Array = new Uint8Array(rawLength);

                for (var i = 0; i < rawLength; ++i) {
                    uInt8Array[i] = raw.charCodeAt(i);
                }

                return new Blob([uInt8Array], {type: contentType});
            }
        }
    };
});
;angular.module("Fn").directive('scrollFixed', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var offset = Number(attr.offset) + angular.element('.navbar').outerHeight();
            var siblingClass = attr.siblingClass;
            var fixedClass = attr.fixedClass;
            var orgWidth = element.outerWidth();
            var stay = false;

            $(window).bind('scroll', function() {
                if (($(window).scrollTop() > element.offset().top - offset) && !stay) {
                    stay = true;
                    element.addClass(fixedClass);
                    element.css({'top': offset, 'width': orgWidth});
                    element.next().addClass(siblingClass);
                } else if (($(window).scrollTop() < element.next().offset().top - offset) && stay){
                    stay = false;
                    element.removeClass(fixedClass);
                    element.css('top', 0);
                    element.next().removeClass(siblingClass);
                }
            }.bind(this));
        }
    };
});

;angular.module("Fn").directive('tileCreateFinao', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/tile-create-finao.html',
        link: function(scope, element, attr) {
            element.addClass('fn-icon-' + attr.slug);
            scope.title = attr.title;
        }
    };
});

;angular.module("Fn").directive('userProfile', function () {
    return {
        restrict: 'E',
        templateUrl: 'fn/partials/directives/user-profile.html',
    };
});

;angular.module('Fn')
    .directive('vimeoVideo', function () {
        return {
            restrict: 'E',
            template: '<iframe ng-src="{{videoUrl}}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>',
            scope: {
                videoId: '@'
            },
            controller: function ($scope, $sce) {
                $scope.videoUrl = $sce.trustAsResourceUrl("//player.vimeo.com/video/" + $scope.videoId + "?title=0&amp;byline=0&amp;portrait=0");
            }
        };
    });;angular.module("Fn").filter('fnCacheBuster', function () {
    return function(val) {
        val = val + '?time=' + Date.now();
        return val;
    };
});;angular.module("Fn").config( function ($provide) {
    $provide.decorator('numberFilter', function($delegate) {
        return function(val, fractionSize) {
            return $delegate(val || 0, fractionSize);
        };
    });
});;angular.module("Fn").filter('fnDefault', function () {
    return function(val, def) {
        val = (val === undefined || val === null || val === '') ? def : val;
        return val;
    };
});;angular.module("Fn").filter('fnMaxLength', function () {
    return function(val, max) {
        if (val.length > max) {
            val = val.slice(0, max) + '...';
        }
        return val;
    };
});;angular.module("Fn").filter('fnUserSearch', function () {
    return function(users, search) {
        if (search === undefined || search === '') {
            return users;
        } else {
            search = search.toLowerCase();
        }

        var searchAble = ['first_name', 'last_name', 'role', 'status', 'username'];
        var searchResult = {};

        angular.forEach(users, function(user) {
            angular.forEach(searchAble, function(key) {
                if (user[key] && user[key].toLowerCase().indexOf(search) > -1) {
                    searchResult[user.customer_id] = user;
                }
            });
        });

        return searchResult;
    };
});;angular.module("Fn").filter('fnUserSort', function () {
    return function(input, attribute, reverse) {
        if (!angular.isObject(input)) { return input; }

        var array = [];

        for(var objectKey in input) {
            if (input.hasOwnProperty(objectKey)) {
                array.push(input[objectKey]);
            }
        }

        array.sort(function(a, b){
            if (reverse) {
                if(a[attribute] > b[attribute]) { return -1; }
                if(a[attribute] < b[attribute]) { return 1; }
            } else {
                if(a[attribute] < b[attribute]) { return -1; }
                if(a[attribute] > b[attribute]) { return 1; }
            }
            return 0;
        });

        return array;
    };
});;angular.module('Fn')
    .config(function($urlRouterProvider, $stateProvider, $uiViewScrollProvider, userRouterProvider, groupRouterProvider, streamRouterProvider, profileRouterProvider) {
        $urlRouterProvider.otherwise('/landing');
        $uiViewScrollProvider.useAnchorScroll();
        $stateProvider
            .state('fn', {
                url: '/',
                resolve: {
                    me: function(UserService) {
                        return UserService.getMe().then( function() {
                            return UserService.me;
                        });
                    },
                    following: function(FollowingInspiredService, me) {
                        if(me.loggedIn) {
                            return FollowingInspiredService.getFollowingInspired(me, 'following').then( function(response) {
                                if (response.error) {
                                    return {};
                                } else {
                                    return response;
                                }
                            });
                        }
                        return {};
                    },
                    inspired: function(FollowingInspiredService, me) {
                        if(me.loggedIn) {
                            return FollowingInspiredService.getFollowingInspired(me, 'inspired').then( function(response) {
                                if (response.error) {
                                    return {};
                                } else {
                                    return response;
                                }
                            });
                        }
                        return {};
                    },
                    groups: function(GroupService, me) {
                        if(me.loggedIn) {
                            return GroupService.getUserGroups(me).then( function(response) {
                                if (response.error) {
                                    return {};
                                } else {
                                    return response;
                                }
                            });
                        }
                        return {};
                    }
                },
                views: {
                    'fn-main': {
                        controller: 'FnCtrl',
                        templateUrl: 'fn/partials/index.html'
                    },
                }
            })
            .state('landing', {
                abstract: true,
                resolve: {
                    me: function(UserService) {
                        return UserService.getMe().then( function() {
                            if (UserService.me.error) {
                                return {};
                            } else {
                                return UserService.me;
                            }
                        });
                    }
                },
                views: {
                    'fn-main': {
                        controller: 'FnLandingCtrl',
                        templateUrl: 'fn/partials/index.html'
                    },
                },
            })
            .state('landing.page', {
                url: '/landing',
                views: {
                    'fn-page': {
                        templateUrl: 'fn/partials/landing/index.html'
                    }
                },
                onEnter: function($state, $location, me) {
                    if (me.loggedIn) {
                        $state.go('fn.stream');
                    }
                }
            })
            .state('fn.email', {
                url: 'validate-email/',
                views: {
                    'fn-page': {
                        controller: 'EmailValidationController as emailCtrl',
                        templateUrl: 'fn/partials/email-validation/index.html'
                    }
                }
            })
            .state('fn.athletics-signup', {
                url: 'athletics',
                resolve: {
                    ref: function() {
                        return 'athletics';
                    },
                    orgs: function(OrgService) {
                        return OrgService.getOrgs();
                    }
                },
                views: {
                    'fn-page': {
                        controller: 'FnSinglePageSignupCtrl',
                        templateUrl: 'fn/partials/signup/athletics.html'
                    }
                }
            })
            .state('fn.signup', {
                url: 'signup',
                resolve: {
                    ref: function() {
                        return false;
                    },
                    orgs: function() {
                        return null;
                    }
                },
                views: {
                    'fn-page': {
                        controller: 'FnSinglePageSignupCtrl',
                        templateUrl: 'fn/partials/signup/single_page.html'
                    }
                }
            })
            .state('fn.signup-with-ref', {
                url: 'signup/:ref',
                resolve: {
                    ref: function($stateParams) {
                        return $stateParams.ref;
                    },
                    orgs: function() {
                        return null;
                    }
                },
                views: {
                    'fn-page': {
                        controller: 'FnSinglePageSignupCtrl',
                        templateUrl: 'fn/partials/signup/single_page.html'
                    }
                }
            })
            .state('fn.marker', {
                url: 'marker',
                views: {
                    'fn-page': {
                        templateUrl: 'fn/partials/marker/index.html'
                    }
                },
            });
        userRouterProvider.addUserRoutes($stateProvider);
        groupRouterProvider.addGroupRoutes($stateProvider);
        streamRouterProvider.addStreamRoutes($stateProvider);
        profileRouterProvider.addProfileRoutes($stateProvider);
    });
;angular.module('Fn').factory('raf', function ($window) {
    var isRequestingFrame = false;
    var fnQueue = [];
    return {
        queue: function (fn) {
            fnQueue.push(fn);
            if(!isRequestingFrame) {
                $window.requestAnimationFrame(function () {
                    isRequestingFrame = true;
                    fnQueue.forEach(function (f) { f(); });
                    isRequestingFrame = false;
                });
            }
        }
    };
});
;angular.module('Fn')
    .service('EmailValidation', function ($http) {
        this.verifyToken = function (token, email, pass) {
            return $http.put('/restful/validate', { token: token, email: email, password: pass });
        };

        this.sendEmail = function(email) {
            return $http.post('/restful/validate', { email: email, token: '', password: '' });
        };
    });
;angular.module('Fn')
    .factory('FollowingInspiredService', function ($http, UserService, FinaoService) {
        var baseFinaoPath = '/restful/';
        return {
            getFollowingInspired: function(me, endpoint) {
                var apiPath = baseFinaoPath + 'customer/' + me.profile.username + '/' + endpoint;
                return this.makeRequest(apiPath, 'get', me).then( function(response) {
                    UserService.me[endpoint] = response.data.data;
                    return UserService.me[endpoint];
                }.bind(this), function(response) {
                    return response.data;
                }.bind(this));
            },
            getUserFollowingInspired: function(user, endpoint) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/' + endpoint;
                return this.makeRequest(apiPath, 'get', user).then( function(response) {
                    UserService.me[endpoint] = response.data.data;
                    this[endpoint] = UserService.me[endpoint];
                    if(endpoint === 'inspired') {
                        angular.forEach(this['inspired'], function(user) {
                            angular.forEach(user.posts, function(post) {
                                FinaoService.prettifyPostData(post);
                            });
                        }.bind(this));
                    }
                    return this[endpoint];
                }.bind(this), function(response) {
                    return response.data;
                }.bind(this));
            },
            changeFollowFinao: function(finao, owner, me, verb) {
                var apiPath = baseFinaoPath + 'customer/' + me.profile.username + '/FollowFinao/';
                if(verb === 'delete') {
                    apiPath = apiPath + finao.finao_id + '/' + finao.slug;
                }
                var data = { "username": owner.profile.username,"finao_id": finao.finao_id, "slug": finao.slug };
                return this.makeRequest(apiPath, verb, data).then(function(response){
                    UserService.me.profile.inspired = response.data.count;
                    return response;
                });
            },
            changePostInspired: function(user, post, owner, verb) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/inspired/';
                if(verb === 'delete') {
                    apiPath = apiPath + post.post_id + '/' + post.slug;
                }
                var data = { "post_username": owner.username,"post_id": post.post_id, "post_slug": post.slug };
                return this.makeRequest(apiPath, verb, data).then(function(response) {
                    if(user.isMe) {
                        UserService.user.profile.inspired = response.data.count;
                    }
                    UserService.me.profile.inspired = response.data.count;
                    return response.data.data;
                }, function(response) {
                    return response;
                });
            },
            makeRequest: function(path, verb, data, options) {
                return $http[verb](path, data, options);
            }
        };
    });;angular.module('Fn')
    .factory('ImageService', function () {
        return {
            loadAsDataUrl: function(scope, item, element, index) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    item.details = {
                        thumbnail_url: e.target.result
                    };
                    scope.$apply();
                    element = $(element)[index];
                    item.details.styleOffset = this.calculateOffset(element.width, element.height);
                    scope.$apply();
                }.bind(this);
                reader.readAsDataURL(item.file);
            },
            calculateOffset: function(width, height) {
                if (height >= width) {
                    return false;
                }

                var style = {};

                style['top'] = (((width - height) / width) * 50) + '%';

                return style;
            }
        };
    });;angular.module('Fn')
    .factory('YoutubeService', function ($http, $q, ImageService) {
        var apiPath = '/restful/youtubeproxy/';
        return {
            getVideoInfo: function(item) {
                if(this.validateLink(item.videoUrl)) {
                    return $http.get(apiPath + encodeURIComponent(item.videoUrl)).then(function(response) {
                        response.data.styleOffset = ImageService.calculateOffset(response.data.thumbnail_width, response.data.thumbnail_height);
                        return response;
                    });
                } else {
                    var def = $q.defer();
                    def.reject(['This is not a valid YouTube link (https://www.youtube.com/watch?v=75swtdm6zbQ)']);
                    return def.promise;
                }
            },
            validateLink: function(videoUrl) {
                var youtubeValidator = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([^\&]+))(?:\S+)?$/;
                return youtubeValidator.test(videoUrl);
            }
        };
    });

