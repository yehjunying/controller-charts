;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.Log = factory()
}(this, (function () { 'use strict';

    return function (options) {
        options = options || {};

        var client = options.elasticSearchClient,
            _ = options.lodash;

        function _search(o, cb) {
            o = o || {};
            o.size = o.size || 100;
            o.maxSize = o.maxSize || o.size;
            o.$scope = o.$scope || {
                    climb: 0
                };

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

                    o.$scope.hits = _.cloneDeep(resp.hits.hits);

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
                                        lt: _.last(o.$scope.hits)._id
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
                                                    lt: _.last(o.$scope.hits)._id
                                                }
                                            }
                                        },
                                        _.cloneDeep(req.body.query)
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
                                                lt: _.last(o.$scope.hits)._id
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }

                    // req.body = {
                    //     query: {
                    //         range: {
                    //             id: {
                    //                 lt: _.last(o.$scope.hits)._id
                    //             }
                    //         }
                    //     }
                    // };

                    client.search(req, searchCallback);
                    return;
                } else {
                    o.$scope.climb += resp.hits.hits.length;
                    o.$scope.scrollId = resp._scroll_id;

                    o.$scope.hits = _.cloneDeep(resp.hits.hits);

                    cb.call(o, undefined, resp);
                }

                if (maxSize && maxSize <= o.$scope.climb) {
                    return;
                }

                if (resp.hits.total > o.$scope.climb) {
                    _search(o, cb);
                }
            }
        }

        //return {
        //    get: get
        //}
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
