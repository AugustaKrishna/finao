angular.module('Common', ['Common.templates', 'jmdobry.angular-cache', 'ngCookies', 'config', 'ui.bootstrap', 'MassAutoComplete', 'djds4rce.angular-socialshare'])
    .config(function ($provide) {
        $provide.decorator('$exceptionHandler', function () {
            return function (e, cause) {
                if(cause) { console.info(cause); }
                console.error(e);
                console.error(e.stack);
            };
        });
    })
    .run(function ($state, $rootScope, $FB) {
        $rootScope.$state = $state;
        $FB.init('1422645421369254');
    });
;angular.module('Common')
    .controller('CommonErrorMessageCtrl', function ($scope, $modalInstance, messages, acknowledge) {
        $scope.messages = messages;
        $scope.hasAcknowledge = acknowledge;
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
        $scope.acknowledge = function() {
            $modalInstance.close();
        };
    });
;angular.module('Common')
    .controller('FnHeaderCtrl', function ($scope, $state, ModalService, UserService, SearchService) {
        $scope.error = false;
        $scope.me.getMessages = true;
        $scope.me.getNotifications = true;
        $scope.isSocial = $state.includes('fn') || $state.includes('profile');

        if($scope.me.loggedIn) {
            $scope.me.homeState = 'fn.user.finaos';
        } else {
            $scope.me.homeState = 'landing.page';
        }

        $scope.$watch(function() {
            return $state.params.username;
        }, function() {
            if($scope.me.profile) {
                $scope.yourProfile = $state.params.username === $scope.me.profile.username;
            }
        });

        $scope.openCreatePost = function () {
            if($scope.me.profile.finaos > 0) {
                ModalService.openCreatePost($scope.me, false, false).result.then(function (post) {
                    $scope.finaos = post;
                });
            } else {
                $state.go('fn.user.create-finao');
            }
        };

        $scope.login = function(me) {
            UserService.login(me)
                .then(UserService.getMe.bind(UserService))
                .then(function() {
                    $scope.error = false;
                    window.location = '/social/' + me.profile.username + '/finaos';
                }, function(response) {
                    ModalService.openMessage(response.data.errors, false).result.then(function () {
                        angular.element("#email").focus();
                    });
                });
        };

        $scope.logout = function(me) {
            UserService.logout(me).then( function() {
                $scope.me = UserService.me = {};
                window.location = '/social/landing/';
            });
        };

        $scope.openForgotPassword = function() {
            ModalService.openForgotPassword($scope.me).result.then(function (me) {
                UserService.me = me;
            });
        };

        $scope.getResults = function(searchTerm) {
            if(searchTerm.length > 3) {
                SearchService.search(searchTerm).then(function (response) {
                    var resp = response.data.hits;
                    if (resp.total > 0) {
                        var results = [];
                        angular.forEach(resp.hits, function(result){
                            results.push({data: result._source, type: result._type});
                        });
                        $scope.results = results;
                    } else {
                        $scope.results = false;
                    }
                });
            } else {
                $scope.results = false;
            }
        };

        $scope.clearSearch = function() {
            delete $scope.results;
        };
    });
;angular.module('Common')
    .controller('CommonMessageCtrl', function ($scope, $state, $timeout, MessageService, ModalService) {
        $scope.status = {};
        $scope.messagesLimit = 6;
        $scope.status.messagesOpen = false;

        if($scope.me.getMessages) {
            $scope.me.getMessages = false;
            MessageService.getMessages().then( function(response) {
                if (response.error) {
                    ModalService.openMessage(response.data.errors, false).result.then(function () {
                        return false;
                    });
                } else if(response.length > 0) {
                    $scope.me.messages = response;
                    $scope.me.messageCount = MessageService.count;
                    if($state.includes('fn.profile.message')) {
                        angular.forEach($scope.me.messages, function(message) {
                            if(String(message.message_id) === $state.params.messageId) {
                                message.searched = true;
                            }
                        });
                    }
                } else {
                    $scope.me.messages = [{title: "You don't have any messages.", archiveable: 0}];
                }
            });
        }


        $scope.messagesOpen = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.messagesOpen = !$scope.status.messagesOpen;
        };

        $scope.archiveMessage = function(archivedMessage) {
            angular.forEach($scope.me.messages, function(message, key) {
                if(message.message_id === archivedMessage.message_id){
                    $scope.me.messages.splice(key, 1);
                }
            });
            MessageService.archiveMessage(archivedMessage);
        };

    });;angular.module('Common')
    .controller('CommonNotificationCtrl', function ($scope, $state, $timeout, NotificationService, ModalService) {
        $scope.notificationsLimit = 3;

        if($scope.me.getNotifications) {
            $scope.me.getNotifications = false;
            NotificationService.getNotifications().then( function(response) {
                if (response.error) {
                    ModalService.openMessage(response.data.errors, false).result.then(function () {
                        return false;
                    });
                } else if(response.length > 0) {
                    $scope.me.notifications = response;
                    $scope.me.notificationCount = NotificationService.count;
                    if($state.includes('fn.profile.message')) {
                        angular.forEach($scope.me.notifications, function(notification) {
                            if(String(notification.notification_id) === $state.params.notificationId) {
                                notification.searched = true;
                            }
                        });
                    }
                } else {
                    $scope.me.notifications = [{title: "You don't have any notifications.", archiveable: 0}];
                }
            });
        }

        $scope.deleteNotification = function(deletedNotification) {
            NotificationService.deleteNotification(deletedNotification).then( function() {
                if (deletedNotification) {
                    deletedNotification.deleted = true;
                    $scope.me.notificationCount--;
                } else {
                    angular.forEach($scope.me.notifications, function(notification) {
                        notification.deleted = true;
                    });
                    $scope.me.notificationCount = 0;
                }
            }, function() {
                var message = ["We were unable to delete this notification"];
                ModalService.openMessage(message, false).result.then(function () {
                    return false;
                });
            });
        };

    });;angular.module('Common')
    .controller('FnSearchCtrl', function ($scope, $element, $state, $timeout, configuration, SearchService) {
        var ctrl = this;
        ctrl.configuration = configuration;
        $scope.search = {};
        $scope.search.term = '';
        ctrl.timer = false;

        ctrl.getResults = function getResults(e) {
            var searchTerm = angular.element(e.currentTarget).val();
            var requestFn = ctrl.makeSearchRequest.bind(null, searchTerm);

            if (ctrl.timer) {
                $timeout.cancel(ctrl.timer);
            }

            ctrl.timer = $timeout(requestFn, 300);

            return ctrl.timer;
        };

        ctrl.makeSearchRequest = function makeSearchRequest(searchTerm) {
            if (searchTerm.length < 3) {
                return;
            }
            $scope.search.term = searchTerm;

            return SearchService.search(searchTerm).then(function (response) {
                ctrl.resp = response.data.hits;
                if (ctrl.resp.total > 0) {
                    var results = [];
                    angular.forEach(ctrl.resp.hits, function(result){
                        switch(result._type) {
                            case 'group_finaos':
                                result.sref = 'fn.group.finao';
                                result.srefParams = { groupSlug: result._source.group_slug, finaoSlug: result._source.slug, finaoId: result._source.finao_id };
                                result.pointer = result._source.title;
                                break;
                            case 'finaos':
                                result.sref = 'fn.user.finao';
                                result.srefParams = { username: result._source.username, finaoSlug: result._source.slug };
                                result.pointer = result._source.title;
                                break;
                            case 'users':
                                result.sref = 'fn.user.finaos';
                                result.srefParams = { username: result._source.username };
                                result.pointer = result._source.username;
                                result._source.profile_image_url = 'http://' + ctrl.configuration.s3.s3bucket + '.' +
                                    ctrl.configuration.s3.s3endpoint + '/profile/' + result._source.username;
                                break;
                            case 'groups':
                                result.sref = 'fn.group.finaos';
                                result.srefParams = { groupSlug: result._source.slug };
                                result.pointer = result._source.name;
                                result._source.profile_image_url = 'http://' + ctrl.configuration.s3.s3bucket + '.' +
                                    ctrl.configuration.s3.s3endpoint + '/group_profile/' + result._source.group_id + '_' + result._source.slug;
                                break;
                            case 'posts':
                                result.sref = 'fn.user.post';
                                result.srefParams = { username: result._source.username, postId: result._source.post_id, postSlug: result._source.slug };
                                result.pointer = result._source.title;
                                result._source.profile_image_url = 'http://' + ctrl.configuration.s3.s3bucket + '.' +
                                    ctrl.configuration.s3.s3endpoint + '/profile/' + result._source.username;
                                break;
                            case 'group_posts':
                                result.sref = 'fn.group.post';
                                result.srefParams = { groupSlug: result._source.group_slug, postId: result._source.post_id, postSlug: result._source.slug };
                                result.pointer = result._source.title;
                                result._source.profile_image_url = 'http://' + ctrl.configuration.s3.s3bucket + '.' +
                                    ctrl.configuration.s3.s3endpoint + '/group_profile/' + result._source.group_id + '_' + result._source.slug;
                                break;
                        }
                        results.push({
                            data: result._source,
                            type: result._type,
                            pointer: result.pointer,
                            sref: result.sref,
                            srefParams: result.srefParams,
                            score: result._score
                        });
                    });
                    $scope.results = results.sort(ctrl.sortResults);
                    $scope.active = $scope.results[0];
                    $scope.active.active = true;
                    return true;
                } else {
                    $scope.results = false;
                }
            });
        };

        $scope.clearSearch = function clearSearch() {
            delete $scope.search.term;
            $scope.clearResults();
        };

        $scope.clearResults = function clearResults() {
            delete $scope.results;
        };

        this.selectArrowResult = function selectArrowResult(direction) {
            if($scope.results){
                var i, result, newResult;
                for(i = 0; i < $scope.results.length; i++) {
                    result = $scope.results[i];
                    if(result.hasOwnProperty('active') && result.active === true) {
                        result.active = false;
                        if(i === ($scope.results.length - 1) && direction === 1){
                            newResult = $scope.results[0];
                        } else if(i === 0 && direction === -1) {
                            newResult = $scope.results[$scope.results.length - 1];
                        } else {
                            newResult = $scope.results[i + direction];
                        }
                        ctrl.makeActive(newResult);
                        return;
                    }
                    result.active = false;
                }
                ctrl.makeActive($scope.results[0]);
            }
        };

        this.selecHoverResult = function(result) {
            angular.forEach($scope.results, function(value) {
                value.active = false;
            });
            ctrl.makeActive(result);
        };

        this.makeActive = function(result) {
            result.active = true;
            $scope.search.term = result.pointer;
            $scope.active = result;
        };

        this.submitSearch = function() {
            $scope.clearSearch();
            $state.go($scope.active.sref, $scope.active.srefParams);
        };

        this.sortResults = function(a, b) {
            return b.score - a.score;
        };

        $scope.getPasteResults = ctrl.getResults;
    });
;angular.module("Common").directive('auth', function () {
    return {
        restrict: 'E',
        templateUrl: 'common/partials/directives/auth.html'
    };
});
;angular.module("Common").directive('footer', function () {
    return {
        restrict: 'E',
        templateUrl: 'common/partials/footer.html'
    };
});
;angular.module("Common").directive('header', function () {
    return {
        restrict: 'E',
        templateUrl: 'common/partials/header.html',
        link: function(scope) {
            scope.handleEnter = function(e, formValid) {
                if (formValid && e.which === 13) {
                    scope.login(scope.me);
                }
            };
        }
    };
});
;angular.module("Common").directive('fnMessages', function () {
    return {
        restrict: 'E',
        controller: 'CommonMessageCtrl',
        templateUrl: 'common/partials/directives/messages.html'
    };
});
;angular.module("Common").directive('notification', ['$compile', '$templateCache', "$parse", function($compile, $templateCache, $parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var notificationGetter = $parse(attrs.notification);
            var notification = notificationGetter(scope);
            var template = $templateCache.get('common/partials/directives/notifications/' + notification.type + '.html');
            element.html($compile(template)(scope));
        }
    };
}]);;angular.module("Common").directive('fnNotifications', function () {
    return {
        restrict: 'E',
        controller: 'CommonNotificationCtrl',
        templateUrl: 'common/partials/directives/notifications/index.html'
    };
});
;angular.module("Common").directive('redditShare', function ($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var baseUrl = 'https://www.reddit.com/submit?url=',
                width = 900,
                height  = 820,
                left = ($(window).width()  - width)  / 2,
                top = ($(window).height() - height) / 2,
                url = baseUrl + attr.url + '&title=' + attr.title,
                opts = 'status=1' +
                    ',width='  + width  +
                    ',height=' + height +
                    ',top='    + top    +
                    ',left='   + left;
            element.click(function(e) {
                $window.open(url, '_blank', opts);
                e.preventDefault();
            });
        }
    };
});
;angular.module("Common").directive('searchResult', ['$compile', '$templateCache', "$parse", function($compile, $templateCache, $parse) {
    return {
        restrict: 'A',
        require: '^fnSearch',
        link: function(scope, element, attrs) {
            var resultGetter = $parse(attrs.result);
            var result = resultGetter(scope);
            var template = $templateCache.get('common/partials/directives/search/' + result.type + '.html');
            element.html($compile(template)(scope));
        }
    };
}]);;angular.module("Common").directive('fnSearch', function() {
    return {
        restrict: 'E',
        controller: 'FnSearchCtrl',
        templateUrl: 'common/partials/directives/search/index.html',
        link: function(scope, element, attrs, FnSearchCtrl) {
            var direct = this;
            scope.selectKeydown = function(e) {
                switch(e.which) {
                    case 8:
                        break;
                    case 32:
                        break;
                    case 40:
                        direct.callArrowResult(e);
                        break;
                    case 38:
                        direct.callArrowResult(e);
                        break;
                    case 27:
                        scope.clearSearch();
                        break;
                    case 13:
                        FnSearchCtrl.getResults(e).then( function() {
                            FnSearchCtrl.submitSearch();
                        });
                        break;
                    default:
                        scope.clearResults();
                        FnSearchCtrl.getResults(e);
                        break;
                }
            };

            scope.selectHover = function(e, result) {
                FnSearchCtrl.selecHoverResult(result);
            };

            this.callArrowResult = function callArrowResult(e) {
                var direction = e.which === 38 ? -1 : 1;
                FnSearchCtrl.selectArrowResult(direction);
            };
        }
    };
});;angular.module("Common").directive('fnSettings', function () {
    return {
        restrict: 'E',
        templateUrl: 'common/partials/directives/settings.html'
    };
});
;angular.module("Common").directive('twitterShare', function ($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var baseUrl = 'https://twitter.com/intent/tweet?url=',
                width = 800,
                height  = 600,
                left = ($(window).width()  - width)  / 2,
                top = ($(window).height() - height) / 2,
                url = baseUrl + attr.url + '&text=' + attr.text,
                opts = 'status=1' +
                    ',width='  + width  +
                    ',height=' + height +
                    ',top='    + top    +
                    ',left='   + left;
            element.click(function(e) {
                $window.open(url, '_blank', opts);
                e.preventDefault();
            });
        }
    };
});
;angular.module('Common')
    .factory('FinaoService', function ($http, $q, moment) {
        var baseFinaoPath = '/restful/';
        return {
            finaos: [],
            posts: [],
            postCount: 0,
            lastPost: undefined,
            saveEditDeleteUserFinao: function(user, finao, verb) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/finao/';
                if(verb === 'put'|| verb === 'delete') {
                    apiPath = apiPath +  finao.finao_id + '/' + finao.slug;
                }
                return this.makeRequest(apiPath, verb, finao);
            },
            saveEditDeleteGroupFinao: function(group, finao, verb) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-finao/';
                if(verb === 'put' || verb === 'delete') {
                    apiPath = apiPath +  finao.finao_id + '/' + finao.slug;
                }
                return this.makeRequest(apiPath, verb, finao);
            },
            getFinaos: function(user, slug, finao) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/finao';
                if (finao) {
                    apiPath += '/' + finao.finao_id + '/' + finao.slug;
                }
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.finaos = response.data.data;
                    this.prettifyFinaoData(this.finaos, slug);
                    return this.finaos;
                }.bind(this));
            },
            getGroupFinaos: function(group, slug, finao) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-finao';
                if (finao) {
                    apiPath += '/' + finao.finao_id + '/' + finao.slug;
                }
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.finaos = response.data.data;
                    this.prettifyFinaoData(this.finaos, slug);
                    return this.finaos;
                }.bind(this));
            },
            createPost: function(user, group, post) {
                angular.forEach(post.media, function(value) {
                    if(value.type === 'video') {
                        post.manifest.push({type: 'video', details: value.details});
                    } else if (value.type === 'photo') {
                        post.hasImages = true;
                        post.manifest.push({type: 'photo', name: value.file.name});
                    }
                });
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/post';
                return this.makeRequest(apiPath, 'post', post).then( function(response) {
                    if(post.hasImages) {
                        post.post_id = response.data.data[0].post_id;
                        return this.uploadPhotos(post);
                    } else {
                        return post;
                    }
                }.bind(this));
            },
            createGroupPost: function(user, group, post) {
                angular.forEach(post.media, function(value) {
                    if(value.type === 'video') {
                        post.manifest.push({type: 'video', details: value.details});
                    } else if (value.type === 'photo') {
                        post.hasImages = true;
                        post.manifest.push({type: 'photo', name: value.file.name});
                    }
                });
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-post';
                return this.makeRequest(apiPath, 'post', post).then(function(response) {
                    if(post.hasImages) {
                        post.post_id = response.data.data[0].post_id;
                        return this.uploadGroupPhotos(post);
                    } else {
                        return post;
                    }
                }.bind(this));
            },
            deletePost: function (user, post) {
                var apiPath = baseFinaoPath + 'customer/me/post/' + post.post_id + '/' + post.slug;
                return this.makeRequest(apiPath, 'delete');
            },
            deleteGroupPost: function (group, post) {
                var apiPath = baseFinaoPath + 'group/' + group.slug + '/group-post/' + post.post_id + '/' + post.slug;
                return this.makeRequest(apiPath, 'delete');
            },
            flagPost: function (me, post) {
                var apiPath = baseFinaoPath + 'customer/' + me.profile.username + '/flag-post';
                return this.makeRequest(apiPath, 'put', {
                    username: post.user.username,
                    post_id: post.post_id,
                    slug: post.slug,
                    reason_code: '10'
                });
            },
            flagGroupPost: function (me, post) {
                var apiPath = baseFinaoPath + 'group/' + post.group.slug + '/group-flag-post';
                return this.makeRequest(apiPath, 'put', {
                    post_id: post.post_id,
                    reason_code: '10'
                });
            },
            getPosts: function(user, finao, post, reset, limit) {
                if(reset) {
                    this.clearService();
                }
                if(this.postCount === 0 || (this.postCount > this.posts.length)) {
                    var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/post' + this.postOptions(limit, post, finao, this.lastPost);
                    return this.makeRequest(apiPath, 'get', null).then( function(response){
                        this.postCount = parseInt(response.data.count);
                        this.posts = this.postCount > 0 ? this.posts.concat(response.data.data) : false;
                        this.lastPost = response.data.data[response.data.data.length - 1];
                        angular.forEach(this.posts, function(post) {
                            this.prettifyPostData(post);
                        }.bind(this));
                        return this.posts;
                    }.bind(this));
                } else {
                    var q = $q.defer();
                    q.resolve();
                    return q.promise.then(function() {
                        return this.posts;
                    }.bind(this));
                }
            },
            getGroupPosts: function(group, finao, post, reset, limit) {
                if(reset) {
                    this.clearService();
                }
                if(this.postCount === 0 || (this.postCount > this.posts.length)) {
                    var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-post' + this.postOptions(limit, post, finao, this.lastPost);
                    return this.makeRequest(apiPath, 'get', null).then( function(response){
                        this.postCount = parseInt(response.data.count);
                        this.posts = this.postCount > 0 ? this.posts.concat(response.data.data) : false;
                        this.lastPost = response.data.data[response.data.data.length - 1];
                        angular.forEach(this.posts, function(post) {
                            this.prettifyPostData(post);
                        }.bind(this));
                        return this.posts;
                    }.bind(this));
                } else {
                    var q = $q.defer();
                    q.resolve();
                    return q.promise.then(function() {
                        return this.posts;
                    }.bind(this));
                }
            },
            postOptions: function(limit, post, finao, lastPost) {
                var url = '';
                if(!post) {
                    if (finao) {
                        url += '-filter/finao/' + finao.finao_id + '/' + finao.slug + '/' + limit;
                    } else {
                        url += '/limit' + '/' + limit;
                    }
                    if (lastPost !== undefined) {
                        url += '/' + lastPost.post_id + '/' + lastPost.slug;
                    }

                    return url;
                }
                return '/' + post.post_id + '/' + post.slug;
            },
            uploadPhotos: function(post){
                var fd = new FormData();
                angular.forEach(Array.prototype.slice.call(post.media), function(value, key) {
                    if(value.type === 'photo') {
                        var file_name = "file-" + key;
                        fd.append(file_name, value.file, value.file.name);
                    }
                });
                var apiPath = '/restful/upload/post/' + post.post_id + '/' + post.slug;
                return this.makeRequest(apiPath, 'post', fd, { transformRequest: angular.identity, headers: {'Content-Type': undefined} });
            },
            uploadGroupPhotos: function(post){
                var fd = new FormData();
                angular.forEach(Array.prototype.slice.call(post.media), function(value, key) {
                    if(value.type === 'photo') {
                        var file_name = "file-" + key;
                        fd.append(file_name, value.file, value.file.name);
                    }
                });
                var apiPath = '/restful/upload/group/post/' + post.post_id + '/' + post.slug;
                return this.makeRequest(apiPath, 'post', fd, { transformRequest: angular.identity, headers: {'Content-Type': undefined} });
            },
            prettifyPostData: function(post) {
                post.user = { username : post.username, profile_image_url:post.profile_image_url, isMe: false };
                post.group = { name: post.group_name, slug: post.group_slug };
                post.sortTime = Date.parse(post.updated_at.replace(/-/g, '/'));

                var utc = moment(post.updated_at).utc().format();
                post.timeUpdated = moment.utc(post.updated_at).zone(utc).fromNow();
                post.manifest = angular.fromJson(post.manifest);
                post.hasMedia = post.manifest.length > 0 && post.manifest[0].name !== '';
                post.url = window.location.origin + '/social/' + post.user.username + '/posts/' + post.post_id + '/' + post.slug;
            },
            prettifyFinaoData: function(finaos, slug) {
                angular.forEach(finaos, function(value) {
                    value.searched = slug === value.slug ? true : false;
                    value.sortTime = slug === value.slug ? new Date().getTime() : Date.parse(value.updated_at.replace(/-/g, '/'));
                    var utc = moment(value.updated_at).utc().format();
                    value.timeUpdated = moment.utc(value.updated_at).zone(utc).fromNow();
                    value.tile = {
                        title: value.tile_title,
                        slug: value.tile_slug
                    };
                    delete(value.tile_title);
                    delete(value.tile_slug);
                });
            },
            clearService: function() {
                this.finaos = [];
                this.posts = [];
                this.postCount = 0;
                delete this['lastPost'];
            },
            makeRequest: function(path, verb, data, options) {
                return $http[verb](path, data, options);
            }
        };
    });
;angular.module('Common')
    .provider('googleAnalytics', function () {
        this.init = function (key) {
            window._gaq = window._gaq || [];
            window._gaq.push(['_setAccount', key]);
        };
        this.$get = function () {};
    });
;angular.module('Common')
    .factory('GroupService', function ($http, $q, UserService) {
        var baseFinaoPath = '/restful/';
        return {
            group: { members: {} },
            saveGroup: function(me, group, verb) {
                var apiPath;
                if(verb === 'put' || verb === 'delete') {
                    apiPath = baseFinaoPath + 'group/' + group.slug;
                } else {
                    apiPath = baseFinaoPath + 'customer/' + me.profile.username + '/group/';
                }
                return this.makeRequest(apiPath, verb, group).then ( function(response) {
                    this.group = { profile: response.data.data[0], members: {} };
                    return this.group;
                }.bind(this), function(response) {
                    return response.data;
                });
            },
            getUserGroups: function(me) {
                var apiPath = baseFinaoPath + 'customer/' + me.profile.username + '/groups-all';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                        UserService.me.groups = {};
                        angular.forEach(response.data.data, function(group) {
                            UserService.me.groups[group.group_id] = group;
                        });
                        return UserService.me.groups;
                    }.bind(this),
                    function(response) {
                        return response.data;
                    }
                );
            },
            getGroup: function(group) {
                this.resetGroup();
                var apiPath = baseFinaoPath + 'group/' + group.slug;
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.group.profile = response.data.data[0];
                    return this.group;
                }.bind(this));
            },
            getGroupMembers: function(group) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-customer/';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.setMembers(response.data.data);
                    return this.group.members;
                }.bind(this));
            },
            addMember: function(user, group) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-customer/' + user.profile.customer_id + '/' + user.profile.username;
                var data = {
                    role: 'member',
                    status: 'pending'
                };
                return this.makeRequest(apiPath, 'put', data).then( function(response){
                    this.setMembers(response.data.data);
                    return this.group.members;
                }.bind(this));
            },
            editMember: function(group, user, status, role) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-customer/' + user.customer_id + '/' + user.username;
                var data = {
                    role: role !== undefined ? role : user.role,
                    status: status !== undefined ? status : user.status
                };
                return this.makeRequest(apiPath, 'put', data).then( function(response){
                    this.setMembers(response.data.data);
                    return this.group.members;
                }.bind(this));
            },
            editGroupSummary: function() {
                var apiPath = baseFinaoPath + 'group/' + this.group.profile.slug + '/group-summary';
                var putData = { bio: this.group.profile.bio };
                return this.makeRequest(apiPath, 'put', putData ).then( function(response) {
                    this.group.profile = angular.extend(this.group.profile, response.data.data[0]);
                    return this.group.profile;
                }.bind(this));
            },
            uploadPhoto: function(type, file){
                var fd = new FormData();
                fd.append('file', file);
                var apiPath = '/restful/upload/group/' + type + '/' + this.group.profile.group_id + '/' + this.group.profile.slug;
                return this.makeRequest(apiPath, 'post', fd, { transformRequest: angular.identity, headers: {'Content-Type': undefined} }).then( function(response) {
                    this.group.profile = angular.extend(this.group.profile, response.data.data[0]);
                    return this.group.profile;
                }.bind(this));
            },
            setMembers: function(members) {
                this.group.members = {};
                angular.forEach(members, function(member) {
                    this.group.members[member.customer_id] = member;
                }.bind(this));
            },
            resetGroup: function() {
                this.group = { members: {}, profile: {} };
            },
            makeRequest: function(path, verb, data, options) {
                return $http[verb](path, data, options);
            }
        };
    });
;angular.module('Common')
    .factory('LandingService', function () {
        return {
            posts: [
                {
                    "post_id":793,
                    "customer_id":22,
                    "title":"Lawn concerts are so amazing. Loved the brillant musical talents of NONONO and Foster the People.",
                    "slug":"sent-off-my-ancestry-dna-test-today-supe",
                    "body":"asdasd",
                    "manifest":[
                        {
                            "type":"photo",
                            "path":"/skin/frontend/social/default/images/landing/post_image_concert.png",
                            "width":700,
                            "height":700
                        }
                    ],
                    "status":"behind",
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-10-20 17:39:27",
                    "created_at":"2014-10-20 17:39:23",
                    "entity_id":22,
                    "username":"AliAndersen",
                    "first_name":"Ali",
                    "last_name":"Andersen",
                    "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141020173927",
                    "profile_timeline_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/timeline/AliAndersen?ts=20141020173927",
                    "finao_id":148,
                    "tile_id":12,
                    "tile_title":"Just Being Me",
                    "tile_slug":"just-being-me",
                    "finao_title":"I will keep track of all the meaningful moments of 2014.",
                    "finao_slug":"I_will_keep_track_of_all_the_meaningful_moments_of_2014_",
                    "user":{
                        "username":"AliAndersen",
                        "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141020173927",
                        "isMe":false
                    },
                    "sortTime":1,
                    "timeUpdated":"1 month ago",
                    "hasMedia":true
                },
                {
                    "post_id":788,
                    "customer_id":22,
                    "title":"Just picked out my dress. It's perfect! I'm so excited, it's insane!",
                    "slug":"homemade-pork-tamales-are-a-lot-of-work",
                    "body":"asdasd",
                    "manifest":[
                        {
                            "type":"photo",
                            "path":"/skin/frontend/social/default/images/landing/post_image_bride.png",
                            "width":700,
                            "height":700
                        }
                    ],
                    "status":"on track",
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-10-19 22:02:28",
                    "created_at":"2014-10-19 22:02:15",
                    "entity_id":22,
                    "username":"AliAndersen",
                    "first_name":"Ali",
                    "last_name":"Andersen",
                    "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141019220228",
                    "profile_timeline_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/timeline/AliAndersen?ts=20141019220228",
                    "finao_id":148,
                    "tile_id":12,
                    "tile_title":"Just Being Me",
                    "tile_slug":"just-being-me",
                    "finao_title":"I will keep track of all the meaningful moments of 2014.",
                    "finao_slug":"I_will_keep_track_of_all_the_meaningful_moments_of_2014_",
                    "user":{
                        "username":"AliAndersen",
                        "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141019220228",
                        "isMe":false
                    },
                    "sortTime":2,
                    "timeUpdated":"3 weeks ago",
                    "hasMedia":true
                },
                {
                    "post_id":788,
                    "customer_id":22,
                    "title":"Got married in one of the most beautiful cities in the world... can't wait to go back! <3 #Vegas",
                    "slug":"homemade-pork-tamales-are-a-lot-of-work",
                    "body":"asdasd",
                    "manifest":[
                        {
                            "type":"photo",
                            "path":"/skin/frontend/social/default/images/landing/post_image_wedding.png",
                            "width":700,
                            "height":700
                        }
                    ],
                    "status":"ahead",
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-10-19 22:02:28",
                    "created_at":"2014-10-19 22:02:15",
                    "entity_id":22,
                    "username":"AliAndersen",
                    "first_name":"Ali",
                    "last_name":"Andersen",
                    "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141019220228",
                    "profile_timeline_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/timeline/AliAndersen?ts=20141019220228",
                    "finao_id":148,
                    "tile_id":12,
                    "tile_title":"Just Being Me",
                    "tile_slug":"just-being-me",
                    "finao_title":"I will keep track of all the meaningful moments of 2014.",
                    "finao_slug":"I_will_keep_track_of_all_the_meaningful_moments_of_2014_",
                    "user":{
                        "username":"AliAndersen",
                        "profile_image_url":"http://finaonation.s3-website-us-west-1.amazonaws.com/profile/AliAndersen?ts=20141019220228",
                        "isMe":false
                    },
                    "sortTime":3,
                    "timeUpdated":"1 day ago",
                    "hasMedia":true
                }
            ],
            finaos: [
                {
                    "finao_id":295,
                    "customer_id":22,
                    "title":"I will cook more at home.",
                    "description":"",
                    "slug":"I_will_cook_more_at_home_",
                    "status":"ahead",
                    "private":0,
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-10-03 16:48:04",
                    "created_at":"2014-10-03 16:48:04",
                    "tile_id":6,
                    "searched":false,
                    "sortTime":1412380084000,
                    "disabled": true,
                    "timeUpdated":"19 days ago",
                    "tile":{
                        "title":"Cooking",
                        "slug":"cooking"
                    }
                },
                {
                    "finao_id":159,
                    "customer_id":22,
                    "title":"I will make an effort to exercise more.",
                    "description":"",
                    "slug":"I_will_make_an_effort_to_exercise_more_",
                    "status":"behind",
                    "private":0,
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-09-09 19:21:45",
                    "created_at":"2014-09-09 19:21:45",
                    "tile_id":11,
                    "searched":false,
                    "sortTime":1410315705000,
                    "disabled": true,
                    "timeUpdated":"a month ago",
                    "tile":{
                        "title":"Health &amp; Fitness",
                        "slug":"health-fitness"
                    }
                },
                {
                    "finao_id":148,
                    "customer_id":22,
                    "title":"I will keep track of all the meaningful moments of 2014.",
                    "description":"",
                    "slug":"I_will_keep_track_of_all_the_meaningful_moments_of_2014_",
                    "status":"on track",
                    "private":0,
                    "deleted":0,
                    "flagged":0,
                    "updated_at":"2014-09-05 19:52:46",
                    "created_at":"2014-09-05 19:52:46",
                    "tile_id":12,
                    "searched":false,
                    "sortTime":1409971966000,
                    "disabled": true,
                    "timeUpdated":"2 months ago",
                    "tile":{
                        "title":"Just Being Me",
                        "slug":"just-being-me"
                    }
                }
            ]
        };
    });;angular.module('Common')
    .factory('MessageService', function ($http, moment) {
        var baseFinaoPath = '/restful/';
        return {
            messages: [],
            getMessages: function() {
                var apiPath = baseFinaoPath + 'customer/me/messages';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.messages = response.data.data;
                    this.count = response.data.count < 99 ? response.data.count : '99+';
                    angular.forEach(this.messages, function(message) {
                        this.prettifyMessageData(message);
                    }.bind(this));
                    return this.messages;
                }.bind(this));
            },
            archiveMessage: function(message) {
                var apiPath = baseFinaoPath + 'customer/me/messages/' + message.message_id + '/' + message.message_slug;
                return this.makeRequest(apiPath, 'put', {archived: 1});
            },
            prettifyMessageData: function(message) {
                message.timeUpdated = moment(message.created_at).fromNow();
            },
            makeRequest: function(path, verb, data) {
                return $http[verb](path, data);
            },
        };
    });
;angular.module('Common')
    .factory('ModalService', function ($modal, FinaoService) {
        return {
            openMessage: function(data, acknowledge) {
                return $modal.open({
                    templateUrl: 'fn/partials/message/index.html',
                    controller: 'CommonErrorMessageCtrl',
                    windowClass: 'messageModalOpen',
                    resolve: {
                        messages: function () {
                            return data;
                        },
                        acknowledge: function() {
                            return acknowledge === undefined ? true : acknowledge;
                        }
                    }
                });
            },
            openSignUp: function(me) {
                return $modal.open({
                    templateUrl: 'fn/partials/signup/index.html',
                    controller: 'FnSignupCtrl',
                    windowClass: 'signUpModalOpen',
                    resolve: {
                        me: function () {
                            return me;
                        }
                    }
                });
            },
            openVideo: function (video, size) {
                size = size || {};
                angular.extend(size, {width: '100%', height: '100%'});
                return $modal.open({
                    template: '<iframe src="//www.youtube.com/embed/' + video + '" controls="0" showinfo="0" frameborder="0" allowfullscreen="" autohide="2"  width="' + size.width + '" height="' + size.height + '" />',
                    windowClass: 'videoModalOpen'
                });
            },
            openForgotPassword: function() {
                return $modal.open({
                    templateUrl: 'fn/partials/landing/forgotpassword.html',
                    controller: 'FnForgotPasswordCtrl',
                    windowClass: 'forgotPasswordModalOpen'
                });
            },
            openCreatePost: function(me, group, finao) {
                return $modal.open({
                    templateUrl: 'fn/partials/profile/posts/create.html',
                    controller: 'FnCreatePostCtrl',
                    windowClass: 'createModalOpen',
                    resolve: {
                        me: function () {
                            if(me && !me.hasOwnProperty('posts')) {
                                me.posts = [];
                            }
                            return me;
                        },
                        group: function () {
                            if(group && !group.hasOwnProperty('posts')) {
                                group.posts = [];
                            }
                            return group;
                        },
                        finao: function() {
                            return finao;
                        },
                        finaos: function() {
                            if (me) {
                                return FinaoService.getFinaos(me, false);
                            } else if (group) {
                                return FinaoService.getGroupFinaos(group, false);
                            }
                        }
                    }
                });
            },
            openImageResizer: function(imagePath, imageType, aspectRatio) {
                return $modal.open({
                    templateUrl: 'fn/partials/profile/edit/image-crop.html',
                    windowClass: 'resizeModalOpen',
                    controller: function ($scope, imagePath, imageType, aspectRatio, $modalInstance) {
                        $scope.imagePath = imagePath;
                        $scope.imageType = imageType;
                        $scope.aspectRatio = aspectRatio;
                        $scope.close = $modalInstance.close;
                        $scope.cancel = $modalInstance.dismiss;
                    },
                    resolve: {
                        imagePath: function () { return imagePath; },
                        imageType: function () { return imageType; },
                        aspectRatio: function () { return aspectRatio; }
                    }
                });
            },
            openPostMediaJumbo: function(item) {
                return $modal.open({
                    templateUrl: 'fn/partials/directives/finao-post-media.html',
                    controller: 'FnPostMediaJumboCtrl',
                    windowClass: 'postMediaJumboModalOpen',
                    resolve: {
                        item: function() {
                            return item;
                        }
                    }
                });
            }
        };
    });
;angular.module('Common')
    .factory('moment', function ($window) {
        return $window.moment;
    });
;angular.module('Common')
    .factory('NotificationService', function ($http, moment) {
        var baseFinaoPath = '/restful/';
        return {
            notifications: [],
            getNotifications: function() {
                var apiPath = baseFinaoPath + 'customer/me/notifications';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.notifications = response.data.data;
                    this.count = response.data.count < 99 ? response.data.count : '99+';
                    angular.forEach(this.notifications, function(notification) {
                        this.prettifynotificationData(notification);
                    }.bind(this));
                    return this.notifications;
                }.bind(this));
            },
            deleteNotification: function(notification) {
                var apiPath = baseFinaoPath + 'customer/me/notifications/';
                if (notification) {
                    apiPath += notification.notification_id;
                }
                return this.makeRequest(apiPath, 'delete');
            },
            prettifynotificationData: function(notification) {
                var time, utc;

                // make this more accurate later when we can add additional date types in the response
                // for now just use the notification created date
                //time = notification[notification.type + '_updated_at'];
                time = notification.created_at;

                utc = moment(notification.created_at).utc().format();
                notification.timeUpdated = moment.utc(time).zone(utc).fromNow();
            },
            makeRequest: function(path, verb, data) {
                return $http[verb](path, data);
            },
        };
    });
;angular.module('Common')
    .factory('OrgService', function ($http) {
        var baseFinaoPath = '/restful/organization';
        return {
            orgs: {},
            getOrgs: function() {
                var apiPath = baseFinaoPath;
                return this.makeRequest(apiPath, 'get').then( function(response) {
                    this.orgs = response.data.data;
                    return this.orgs;
                }.bind(this));
            },
            makeRequest: function(path, verb, data, options) {
                return $http[verb](path, data, options);
            }
        };
    });
;angular.module('Common')
    .factory('SearchService', function ($http, $window) {
        var domain = $window.location.hostname.replace('www', '');
        var baseSearchPath = $window.location.protocol + '//es.' + domain + '/finao/_search?q=_all:';

        return {
            search: function(term) {
                var path = baseSearchPath + term;
                return this.makeRequest(path, 'get');
            },
            makeRequest: function(path, verb) {
                return $http[verb](path);
            },
        };
    });
;angular.module('Common')
    .factory('string', function ($window) {
        return $window.S;
    });
;angular.module('Common')
    .factory('TileService', function ($http) {
        var baseFinaoPath = '/restful/';
        var tileMap = {};
        return {
            tiles: [],
            getTiles: function(user) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/tiles-all';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.tiles = response.data.data;
                    return this.tiles;
                }.bind(this));
            },
            getTilesAvailable: function(user) {
                var apiPath = baseFinaoPath + 'customer/' + user.profile.username + '/tiles-available';
                return this.makeRequest(apiPath, 'get', null).then( function(response) {
                    return response.data.data;
                });
            },
            getGroupTiles: function(group) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-tiles-all/';
                return this.makeRequest(apiPath, 'get', null).then( function(response){
                    this.tiles = response.data.data;
                    return this.tiles;
                }.bind(this));
            },
            getGroupTilesAvailable: function(group) {
                var apiPath = baseFinaoPath + 'group/' + group.profile.slug + '/group-tiles-available/';
                return this.makeRequest(apiPath, 'get', null).then( function(response) {
                    return response.data.data;
                });
            },
            makeRequest: function(path, verb, data) {
                return $http[verb](path, data);
            },
            assembleRows: function (tiles, slice) {
                var rowNum = 0;
                var tileRows = [];
                tiles.sort(function(a, b) {
                    return a.tile_id - b.tile_id;
                });
                while (tiles.length) {
                    tileRows[rowNum] = tiles.splice(0, slice);
                    rowNum++;
                }
                return tileRows;
            },
            clearService: function() {
                this.titles = {};
                tileMap = {};
            }
        };
    });
;angular.module('Common')
    .factory('UserService', function ($http, $q, $cookies, $angularCacheFactory, FinaoService, TileService) {
        var userMap = {};
        return {
            user: {},
            me: {},
            stream: { posts:[], tiles:[], finaos:[], count: 0 },
            signUp: function(user) {
                var apiPath = '/restful/signup';
                return this.makeRequest(apiPath, 'post', user);
            },
            login: function(me) {
                this.me = me;
                var apiPath = '/restful/login';
                return this.makeRequest(apiPath, 'post', this.me);
            },
            getMe: function() {
                var apiPath = '/restful/';
                return this.makeRequest(apiPath, 'get', this.me).then( function(response) {
                    this.me.profile = response.data.data[0];
                    this.me.loggedIn = true;
                    // return this.getTagnotes().then(function(response) {
                    //     this.me.tagnotes = response;
                    // }.bind(this));
                    return this.me;
                }.bind(this), function(response) {
                    this.me = response.data;
                    this.loggedIn = false;
                    return this.me;
                }.bind(this));
            },
            getStream: function(me, limit) {
                if(this.stream.count === 0 || (this.stream.count > this.stream.posts.length)) {
                    var apiPath = '/restful/customer/' + me.profile.username + '/stream/' + this.streamOptions(limit, this.stream.lastPost);
                    return this.makeRequest(apiPath, 'get', me).then( function(response) {
                        if (Number(response.data.count) > 0) {
                            this.stream.posts = this.stream.posts.concat(response.data.data);
                            this.stream.lastPost = response.data.data[response.data.data.length - 1];
                            this.stream.tiles = this.stream.tiles.concat(response.data.tiles);
                            this.stream.finaos = this.stream.finaos.concat(response.data.finaos);
                            angular.forEach(this.stream.posts, function(post) {
                                FinaoService.prettifyPostData(post);
                            }.bind(this));
                        } else {
                            this.stream.empty = true;
                        }
                        this.stream.count = parseInt(response.data.count);
                        return this.stream;
                    }.bind(this));
                } else {
                    var q = $q.defer();
                    q.resolve();
                    return q.promise.then(function() {
                        return this.stream;
                    }.bind(this));
                }
            },
            streamOptions: function(limit, lastPost) {
                var url = 'limit' + '/' + limit;
                if (lastPost !== undefined) {
                    url = url + '/' + lastPost.post_id + '/' + lastPost.slug;
                }
                return url;
            },
            editMyProfile: function() {
                var apiPath = '/restful/customer/' + this.me.profile.username + '/summary';
                var putData = {bio:this.me.profile.bio, first_name:this.me.profile.first_name, last_name:this.me.profile.last_name};
                return this.makeRequest(apiPath, 'put', putData ).then( function(response) {
                    this.me.profile = response.data.data[0];
                    return this.me.profile;
                }.bind(this));
            },
            getTagnotes: function() {
                var apiPath = '/restful/customer/' + this.me.profile.username + '/tagnote';
                return this.makeRequest(apiPath, 'get', this.me).then( function(response) {
                    return response.data.data;
                }.bind(this));
            },
            saveTagnote: function(tagnote) {
                var apiPath = '/restful/customer/' + this.me.profile.username + '/tagnote/' + tagnote.tagnote_id + '/abc';
                var putData = {tagnote:tagnote.finao};
                return this.makeRequest(apiPath, 'put', putData).then( function(response) {
                    return response.data.data;
                }.bind(this));
            },
            uploadPhoto: function(type, file){
                var fd = new FormData();
                fd.append('file', file);
                var apiPath = '/restful/upload/' + type;
                return this.makeRequest(apiPath, 'post', fd, { transformRequest: angular.identity, headers: {'Content-Type': undefined} }).then( function(response) {
                    this.me.profile = response.data.data[0];
                    return this.me.profile;
                }.bind(this));
            },
            getUserData: function(user) {
                var apiPath;
                if (this.me.loggedIn && user.username === this.me.profile.username) {
                    return this.getMe().then(function (me) {
                        me.isMe = true;
                        this.user.profile = me.profile;
                        return me.profile;
                    }.bind(this));
                } else {
                    this.user.isMe = false;
                    apiPath = '/restful/customer/' + user.username;
                }
                return this.makeRequest(apiPath, 'get', user).then( function(response){
                    this.user.profile = response.data.data[0];
                    return this.user.profile;
                }.bind(this), function(response) {
                    return response.data;
                }.bind(this));
            },
            logout: function(user) {
                user.loggedIn = false;
                userMap = {};
                this.me = {};
                this.user = {};
                FinaoService.clearService();
                TileService.clearService();
                var apiPath = '/customer/account/logout';
                return this.makeRequest(apiPath, 'post', user);
            },
            requestPassword: function(me) {
                var apiPath = '/restful/password';
                return this.makeRequest(apiPath, 'post', me).then( function(response) {
                    return response.data.data;
                }.bind(this));
            },
            makeRequest: function(path, verb, data, options) {
                return $http[verb](path, data, options);
            }
        };
    });
