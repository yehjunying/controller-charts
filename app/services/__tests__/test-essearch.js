var chai = require('chai'),
    expect = chai.expect,
    async = require('async'),
    elasticsearch = require('elasticsearch'),
    _ = require('lodash');

require('../../../tests/test-helpers');

var client = new elasticsearch.Client({
    host: 'http://localhost:9200',
    log: 'trace'
});

var ESSearch = require('./../essearch');

var search = ESSearch(new elasticsearch.Client({
    host: 'http://localhost:9200',
    log: 'trace'
}));

describe('search the records from elasticsearch', function () {
    before(function (done) {
        var mapping = {
            id: {type: 'keyword'},
            facility: {type: 'integer'},
            severity: {type: 'integer'},
            tag: {type: 'keyword'},
            time: {type: 'date'},
            localeDateTime: {type: 'text'},
            hostname: {type: 'keyword'},
            address: {type: 'ip'},
            message: {type: 'text'}
        };

        var reqs = [
            {
                params: {
                    index: 'mars',
                    body: {
                        query: {
                            match_all: {}
                        }
                    }
                },
                context: client,
                fn: client.deleteByQuery
            },
            {
                params: {
                    index: 'mars',
                    type: 'test',
                    body: {
                        properties: mapping
                    }
                },
                context: client.indices,
                fn: client.indices.putMapping
            },
            {
                params: {
                    index: 'mars',
                    type: 'foo',
                    body: {
                        properties: mapping
                    }
                },
                context: client.indices,
                fn: client.indices.putMapping
            },
            {
                params: {
                    index: 'mars',
                    type: 'xxx',
                    body: {
                        properties: mapping
                    }
                },
                context: client.indices,
                fn: client.indices.putMapping
            },
            {
                params: {
                    index: 'mars',
                    type: 'xxx',
                    body: {
                        properties: mapping
                    }
                },
                context: client.indices,
                fn: client.indices.putMapping
            },
            {
                params: {
                    index: 'mars',
                    type: 'xxx',
                    id: '1164104823762283',
                    body: {
                        "id": "1164104823762283",
                        "facility": 16,
                        "severity": 6,
                        "tag": "snmp",
                        "time": "2017-03-29T09:11:19.283Z",
                        "localeDateTime": "2017-03-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-down notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'test',
                    id: '1164104823762284',
                    body: {
                        "id": "1164104823762284",
                        "facility": 16,
                        "severity": 6,
                        "tag": "snmp",
                        "time": "2017-03-29T09:11:19.284Z",
                        "localeDateTime": "2017-03-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-down notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'test',
                    id: '1164104823762285',
                    body: {
                        "id": "1164104823762285",
                        "facility": 16,
                        "severity": 6,
                        "tag": "snmp",
                        "time": "2017-03-29T09:11:19.285Z",
                        "localeDateTime": "2017-03-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'test',
                    id: '1164104823762286',
                    body: {
                        "id": "1164104823762286",
                        "facility": 16,
                        "severity": 3,
                        "tag": "snmp",
                        "time": "2017-04-29T09:11:19.286Z",
                        "localeDateTime": "2017-04-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'foo',
                    id: '1164104823762287',
                    body: {
                        "id": "1164104823762287",
                        "facility": 16,
                        "severity": 4,
                        "tag": "snmp",
                        "time": "2017-04-29T09:11:19.287Z",
                        "localeDateTime": "2017-04-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'foo',
                    id: '1164104823762288',
                    body: {
                        "id": "1164104823762288",
                        "facility": 16,
                        "severity": 6,
                        "tag": "abc",
                        "time": "2017-04-29T09:11:19.288Z",
                        "localeDateTime": "2017-04-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'foo',
                    id: '1164104823762289',
                    body: {
                        "id": "1164104823762289",
                        "facility": 16,
                        "severity": 3,
                        "tag": "snmp",
                        "time": "2017-04-29T09:11:20.289Z",
                        "localeDateTime": "2017-04-29 17:11:19",
                        "hostname": "yehjunying-pc",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            },
            {
                params: {
                    index: 'mars',
                    type: 'foo',
                    id: '1164104823762290',
                    body: {
                        "id": "1164104823762290",
                        "facility": 16,
                        "severity": 6,
                        "tag": "snmp",
                        "time": "2017-10-29T09:11:20.290Z",
                        "localeDateTime": "2017-10-29 17:11:19",
                        "hostname": "yehjunying-nb",
                        "address": "127.0.0.1",
                        "message": "VLAN 1 link-up notification\n"
                    }
                },
                context: client,
                fn: client.create
            }
        ];

        async.eachSeries(reqs, function (req, callback) {
            req.fn.call(req.context, req.params, function (err, resp) {
                callback(err);
            });
        }, function (err) {
            done(err);
        });
    });

    it('should get record as syslog format', function (done) {
        var size = 2;

        search({
            size: size
        }, function (err, resp) {
            expect(err).to.be.undefined;
            expect(resp).to.not.be.undefined;
            expect(resp).to.have.deep.property('hits.hits.length').to.equal(size);

            resp.hits.hits.forEach(function (hit) {
                expect(hit).to.have.property('_id');
                expect(hit).to.have.property('_source');

                expect(hit._source).to.have.property('address');
                expect(hit._source).to.have.property('facility');
                expect(hit._source).to.have.property('hostname');
                expect(hit._source).to.have.property('id');
                expect(hit._source).to.have.property('localeDateTime');
                expect(hit._source).to.have.property('message');
                expect(hit._source).to.have.property('severity');
                expect(hit._source).to.have.property('tag');
                expect(hit._source).to.have.property('time');
            });

            done();
        });
    });

    // it('should get most records by the specified size', function (done) {
    //     var maxSize = 6,
    //         records = [],
    //         stop = null;
    //
    //     search({
    //         size: 2,
    //         maxSize: maxSize
    //     }, function (err, resp) {
    //         expect(err).to.be.undefined;
    //         expect(resp).to.not.be.undefined;
    //         // expect(resp).to.have.deep.property('hits.hits.length').to.equal(size);
    //
    //         records = records.concat(resp.hits.hits);
    //
    //         if (maxSize < records.length) {
    //             if (stop) {
    //                 clearTimeout(stop);
    //                 stop = null;
    //                 done(Error('log.get should return most ' + maxSize + ' records'));
    //             }
    //         } else if (maxSize === records.length) {
    //             stop = setTimeout(function () {
    //                 done();
    //             }, 2000);
    //         }
    //     });
    // }).timeout(3000);

    it('should handle scroll timeout case', function (done) {
        var tests = [
                {
                    req: {
                        size: 2,
                        maxSize: 2
                    },
                    resp: [
                        '1164104823762290',
                        '1164104823762289'
                    ]
                },
                {
                    req: {
                        size: 2,
                        maxSize: 2
                    },
                    resp: [
                        '1164104823762288',
                        '1164104823762287'
                    ]
                },
                {
                    req: {
                        size: 2,
                        maxSize: 2
                    },
                    resp: [
                        '1164104823762286',
                        '1164104823762285'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;
                expect(resp).to.have.deep.property('hits.hits.length').to.equal(req.size);

                expect(resp.hits.hits[0]._id).to.equal(test.resp[0]);
                expect(resp.hits.hits[1]._id).to.equal(test.resp[1]);

                client.clearScroll({scrollId: [this.$scope.scrollId]}, function (err, resp) {
                    expect(err).to.be.undefined;

                    callback(null);
                });
            });
        }, function (err) {
            done(err);
        });
    });

    it('should N records per get', function (done) {
        var expect_resp = [
                '1164104823762290',
                '1164104823762289',
                '1164104823762288',
                '1164104823762287',
                '1164104823762286',
                '1164104823762285'
            ],
            req = {
                size: 2,
                maxSize: 2
            };

        async.series([
            function (callback) {
                testLogGet(callback);
            },
            function (callback) {
                testLogGet(callback);
            },
            function (callback) {
                testLogGet(callback);
            }
        ], function (err, result) {
            expect(expect_resp.length).to.equal(0);
            done();
        });

        function testLogGet(callback) {
            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(req.size);

                expect(resp.hits.hits[0]._id).to.equal(expect_resp[0]);
                expect(resp.hits.hits[1]._id).to.equal(expect_resp[1]);

                expect_resp.splice(0, 2);

                callback();
            });
        }
    });

    it('should be able to search by index', function (done) {
        var tests = [
                {
                    req: {
                        index: 'mars',
                        type: 'test',
                        size: 2,
                        maxSize: 2
                    },
                    resp: [
                        '1164104823762286',
                        '1164104823762285'
                    ]
                },
                {
                    req: {
                        index: 'mars',
                        type: 'test',
                        size: 2,
                        maxSize: 2
                    },
                    resp: [
                        '1164104823762284'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(test.resp.length);

                client.clearScroll({
                    scrollId: [this.$scope.scrollId]
                }, function (err, resp) {
                    callback(null);
                });
            });

        }, function (err) {
            done(err);
        });
    });

    // TODO: search by keyword

    it('should be able to search by hostname', function (done) {
        var tests = [
                {
                    req: {
                        index: 'mars',
                        type: 'foo',
                        size: 2,
                        maxSize: 2,
                        body: {
                            query: {
                                term: {
                                    hostname: 'yehjunying-pc'
                                }
                            }
                        }
                    },
                    resp: [
                        '1164104823762289',
                        '1164104823762288'
                    ]
                },
                {
                    req: {},
                    resp: [
                        '1164104823762287'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(test.resp.length);

                _.zip(resp.hits.hits, test.resp).forEach(function (z) {
                    expect(z[0]._id).to.equal(z[1]);
                    expect(z[0]._source.hostname).to.equal('yehjunying-pc');
                });

                client.clearScroll({
                    scrollId: [this.$scope.scrollId]
                }, function (err, resp) {
                    callback(null);
                });
            });

        }, function (err) {
            done(err);
        });
    });

    it('should be able to search by hostname and tag', function (done) {
        var tests = [
                {
                    req: {
                        index: 'mars',
                        type: 'foo',
                        size: 1,
                        maxSize: 1,
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                hostname: 'yehjunying-pc'
                                            }
                                        },
                                        {
                                            term: {
                                                tag: 'snmp'
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    resp: [
                        '1164104823762289'
                    ]
                },
                {
                    req: {},
                    resp: [
                        '1164104823762287'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(test.resp.length);

                _.zip(resp.hits.hits, test.resp).forEach(function (z) {
                    expect(z[0]._id).to.equal(z[1]);
                    expect(z[0]._source.hostname).to.equal('yehjunying-pc');
                });

                client.clearScroll({
                    scrollId: [this.$scope.scrollId]
                }, function (err, resp) {
                    callback(null);
                });
            });

        }, function (err) {
            done(err);
        });
    });

    it('should be able to search by hostname and severity', function (done) {
        var tests = [
                {
                    req: {
                        index: 'mars',
                        type: 'foo',
                        size: 1,
                        maxSize: 1,
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                hostname: 'yehjunying-pc'
                                            }
                                        },
                                        {
                                            range: {
                                                severity: {
                                                    lt: 6
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    resp: [
                        '1164104823762289'
                    ]
                },
                {
                    req: {},
                    resp: [
                        '1164104823762287'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(test.resp.length);

                _.zip(resp.hits.hits, test.resp).forEach(function (z) {
                    expect(z[0]._id).to.equal(z[1]);
                    expect(z[0]._source.hostname).to.equal('yehjunying-pc');
                });

                client.clearScroll({
                    scrollId: [this.$scope.scrollId]
                }, function (err, resp) {
                    callback(null);
                });
            });

        }, function (err) {
            done(err);
        });
    });

    it('should be able to search by hostname and data range', function (done) {
        var tests = [
                {
                    req: {
                        index: 'mars',
                        type: 'foo',
                        size: 1,
                        maxSize: 1,
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                hostname: 'yehjunying-pc'
                                            }
                                        },
                                        {
                                            range: {
                                                time: {
                                                    lt: '2017-03-29T09:11:20.290Z'
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    resp: [
                        '1164104823762289'
                    ]
                },
                {
                    req: {},
                    resp: [
                        '1164104823762288'
                    ]
                },
                {
                    req: {},
                    resp: [
                        '1164104823762287'
                    ]
                }
            ],
            req = {};

        async.eachSeries(tests, function (test, callback) {
            req = Object.assign(req, test.req);

            search(req, function (err, resp) {
                expect(err).to.be.undefined;
                expect(resp).to.not.be.undefined;

                expect(resp).to.have.deep.property('hits.hits.length').to.equal(test.resp.length);

                _.zip(resp.hits.hits, test.resp).forEach(function (z) {
                    expect(z[0]._id).to.equal(z[1]);
                    expect(z[0]._source.hostname).to.equal('yehjunying-pc');
                });

                client.clearScroll({
                    scrollId: [this.$scope.scrollId]
                }, function (err, resp) {
                    callback(null);
                });
            });

        }, function (err) {
            done(err);
        });
    });

    // TODO: pass sort by caller

    // describe('User service by angular', function() {
    //     beforeEach(ngModule('myServices.user'));
    //
    //     it('should return a list of users', inject(function(UserService) {
    //         expect(UserService.getUsers().length).to.equal(0);
    //     }));
    // });

});