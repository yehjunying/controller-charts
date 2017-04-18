;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.ESSearch = factory()
}(this, (function () {
    'use strict';

    return function (client) {
        if (typeof client !== 'object' || typeof client.search !== 'function' || typeof client.scroll !== 'function') {
            throw new TypeError('Parameter miss or invalid, required an instance of elasticsearch client');
        }

        function arrayLast(array) {
            var length = array == null ? 0 : array.length;
            return length ? array[length - 1] : undefined;
        }

        function deepCopy(original) {
            return JSON.parse(JSON.stringify(original));
        }

        function _search(o, cb) {
            o = o || {};
            o.size = o.size || 100;
            o.maxSize = o.maxSize || o.size;
            o.$scope = o.$scope || {
                    climb: 0
                };

            o.$scope.last = false;

            var scrollId = o.scrollId || o.$scope.scrollId,
                maxSize = o.maxSize,
                req = {};

            cb = cb || o.respCb || function () {
                };

            if (scrollId) {
                client.scroll({
                    scrollId: scrollId,
                    scroll: '1m'
                }, scrollCallback);
            } else {
                req = makeSearchParams(o);

                client.search(req, searchCallback);
            }

            function makeSearchParams(o) {
                req = {
                    size: o.size,
                    scroll: '1m',
                    sort: "time:desc"
                };

                if (o.index) {
                    req.index = o.index;
                }

                if (o.type) {
                    req.type = o.type;
                }

                if (o.body) {
                    req.body = o.body;
                }

                return req;
            }

            function searchCallback(error, resp) {
                if (error) {
                    cb.call(o, error, resp);
                    return;
                } else {
                    o.$scope.climb += resp.hits.hits.length;
                    o.$scope.scrollId = resp._scroll_id;

                    o.$scope.hits = deepCopy(resp.hits.hits);

                    if (maxSize && maxSize <= o.$scope.climb || resp.hits.total == o.$scope.climb) {
                        o.$scope.last = true;
                    }

                    cb.call(o, undefined, resp);
                }

                if (maxSize && maxSize <= o.$scope.climb) {
                    return;
                }

                if (resp.hits.total > o.$scope.climb) {
                    _search(o, cb);
                }
            }

            function scrollCallback(error, resp) {
                if (error && error.status === 404) {
                    req = makeSearchParams(o);

                    if (req.body && req.body.query) {
                        if (req.body.query.bool && req.body.query.bool.must) {
                            req.body.query.bool.must.push({
                                range: {
                                    id: {
                                        lt: arrayLast(o.$scope.hits)._id
                                    }
                                }
                            });
                        } else {
                            req.body.query = {
                                bool: {
                                    must: [
                                        {
                                            range: {
                                                id: {
                                                    lt: arrayLast(o.$scope.hits)._id
                                                }
                                            }
                                        },
                                        deepCopy(req.body.query)
                                    ]
                                }
                            }
                        }
                    } else {
                        req.body = {};
                        req.body.query = {
                            bool: {
                                must: [
                                    {
                                        range: {
                                            id: {
                                                lt: arrayLast(o.$scope.hits)._id
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }

                    client.search(req, searchCallback);
                    return;
                } else {
                    o.$scope.climb += resp.hits.hits.length;
                    o.$scope.scrollId = resp._scroll_id;

                    o.$scope.hits = deepCopy(resp.hits.hits);

                    if (maxSize && maxSize <= o.$scope.climb || resp.hits.hits.length === 0) {
                        o.$scope.last = true;
                    }

                    cb.call(o, undefined, resp);
                }

                if (maxSize && maxSize <= o.$scope.climb) {
                    return;
                }

                if (!o.$scope.last) {
                    _search(o, cb);
                }
            }
        }

        return _search;
    }

})));

angular.module('myServices.user', [])
// .service('client', function (esFactory) {
//     return esFactory({
//         host: 'localhost:9200',
//         apiVersion: '2.3',
//         log: 'trace'
//     });
// })
    .service('UserService', function () {
        return {
            getUsers: function () {
                return [];
            }
        }
    });
