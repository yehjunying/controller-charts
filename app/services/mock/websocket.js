(function () {
    'use strict';
    angular.module('mockUtils', [])
        .factory('WebSocketService', ['$http',
            function ($http/*$rootScope*/) {
                var _name = 'WebSocketService',
                    _handlers = {},
                    _respHome = '',
                    _respUrl = respUrl;

                // $rootScope.$on('hello', function () {
                //     var key = arguments[1][0],
                //         data = arguments[1][1];
                //     setTimeout(function() {
                //         console.log('received ' + key + ' data: ' + JSON.stringify(data));
                //     }, 0);
                // });
                function createHandler() {
                    return {}
                }

                function respUrl(key) {
                    var respKey = key.substring(0, key.length - 'Request'.length) + 'Response';
                    return _respHome + '/' + respKey + '.json';
                }

                function callFn(respKey, fn, data) {
                    setTimeout(function () {
                        console.log('call ' + respKey);
                        fn(data);
                    }, 0);
                }

                return {
                    bindHandlers: function (handlers) {
                        angular.forEach(handlers, function (fn, key) {
                            this[key] = this[key] || createHandler();
                            this[key].fn = fn;
                        }, _handlers);
                    },
                    setResponseHomeDir: function (dir) {
                        _respHome = dir;
                    },
                    setResponseUrl: function (fn) {
                        _respUrl = fn;
                    },
                    bindResponseData: function (responses) {
                        angular.forEach(responses, function (data, key) {
                            this[key] = this[key] || createHandler();
                            this[key].data = data;
                        }, _handlers);
                    },
                    sendEvent: function (key, data) {
                        console.log(_name + ': sendEvent: ' + key + ' data: ' + JSON.stringify(data));

                        if (key.endsWith('Request')) {
                            var respKey = key.substring(0, key.length - 'Request'.length) + 'Response';
                            if (_handlers[respKey] && typeof _handlers[respKey].fn === 'function') {

                                var response;

                                if (typeof _handlers[respKey].data === 'undefined') {
                                    response = $http.get( _respUrl(key) );
                                } else if (typeof _handlers[respKey].data === 'function') {
                                    response = _handlers[respKey].data(data);
                                } else {
                                    response = _handlers[respKey].data;
                                }

                                if (response && typeof response['then'] === 'function') {
                                    response.then(function(res) {
                                        callFn(respKey, _handlers[respKey].fn.bind(_handlers[respKey]), {
                                            status: 200,
                                            data: res.data
                                        });
                                    }, function (err) {
                                        callFn(respKey, _handlers[respKey].fn.bind(_handlers[respKey]), {
                                            status: 404
                                        });
                                    });
                                } else {
                                    if (response) {
                                        callFn(respKey, _handlers[respKey].fn.bind(_handlers[respKey]), {
                                            status: 200,
                                            data: response
                                        });
                                    } else {
                                        callFn(respKey, _handlers[respKey].fn.bind(_handlers[respKey]), {
                                            status: 404
                                        });
                                    }
                                }
                            } else {
                                console.log('response handler not found');
                            }
                        } else {
                            console.log('unrecognised key');
                        }
                    }
                };
            }]
        );

}());