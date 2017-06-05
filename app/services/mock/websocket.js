(function () {
    'use strict';
    angular.module('mockUtils', [])
        .factory('WebSocketService',
            function (/*$rootScope*/) {
                var _name = 'WebSocketService',
                    _handlers = {};

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

                return {
                    bindHandlers: function (handlers) {
                        angular.forEach(handlers, function (fn, key) {
                            this[key] = this[key] || createHandler();
                            this[key].fn = fn;
                        }, _handlers);
                    },
                    bindResponseData: function (responses) {
                        angular.forEach(responses, function (data, key) {
                            this[key] = this[key] || createHandler();
                            this[key].data = data;
                        }, _handlers);
                    },
                    sendEvent: function (key, data) {
                        console.log(_name + ': sendEvent: ' + key + ' data: ' + JSON.stringify(data));

                        //$rootScope.$emit('hello', [key, data]);

                        if (key.endsWith('Request')) {
                            var respKey = key.substring(0, key.length - 'Request'.length) + 'Response';
                            if (_handlers[respKey] && typeof _handlers[respKey].fn === 'function') {
                                setTimeout(function () {
                                    console.log('call ' + respKey);
                                    var respData;
                                    if (typeof _handlers[respKey].data === 'function') {
                                        respData = {
                                            status: 200,
                                            data: _handlers[respKey].data(data)
                                        };
                                    } else if (typeof _handlers[respKey].data !== 'undefined') {
                                        respData = {
                                            status: 200,
                                            data: _.cloneDeep(_handlers[respKey].data)
                                        };
                                    } else {
                                        respData = {
                                            status: 404
                                        };
                                    }
                                    _handlers[respKey].fn(respData);
                                }, 0);
                            } else {
                                console.log('response handler not found');
                            }
                        } else {
                            console.log('unrecognised key');
                        }
                    }
                };
            }
        );

}());