(function () {
    'use strict';

    var $window, $log, $scope, $loc, /*mast,*/ /*fs,*/ wss, ns;

    var configHistory = {
        'network': [
            {
                'id': '20170501011000000',
                'modified': '2017-05-01 01:10:00.000',
                'modifiedBy': 'mars',
                'description': 'Device had added; Link had added'
            },
            {
                'id': '20170501010000000',
                'modified': '2017-05-01 01:00:00.000',
                'modifiedBy': 'karaf',
                'description': 'Network had modified',

                'active': true
            },
            {
                'id': '20170501005000000',
                'modified': '2017-05-01 00:50:00.000',
                'modifiedBy': 'karaf',
                'description': 'Global had modified; Device had removed; Link had removed; Network had removed'
            },
            {
                'id': '20170501004000000',
                'modified': '2017-05-01 00:40:00.000',
                'modifiedBy': 'mars',
                'description': 'Network had added; Global had modified'
            },
            {
                'id': '20170501003000000',
                'modified': '2017-05-01 00:30:00.000',
                'modifiedBy': 'mars',
                'description': 'Device had added; Link had added'
            },
            {
                'id': '20170501002000000',
                'modified': '2017-05-01 00:20:00.000',
                'modifiedBy': 'who',
                'description': 'Global had modified'
            },
            {
                'id': '20170501001000000',
                'modified': '2017-05-01 00:10:00.000',
                'modifiedBy': 'karaf',
                'description': 'init version'
            }
        ],
        'foo': [
            {
                'id': '20170501000000000',
                'modified': '2017-05-01 00:00:00.000',
                'modifiedBy': 'who',
                'description': 'first version'
            },
            {
                'id': '20170501001000000',
                'modified': '2017-05-01 00:10:00.000',
                'modifiedBy': 'who',
                'description': 'second version'
            },
            {
                'id': '20170501002000000',
                'modified': '2017-05-01 00:10:00.000',
                'modifiedBy': 'who',
                'description': 'third version'
            }
        ]
    };


    angular.module('ovConfigHistory', [])
    .controller('OvConfigHistoryCtrl',
        ['$window', '$log', '$scope', '$location', /*'MastService',*/ /*'FnService',*/ 'WebSocketService', 'NavService',

        function (_$window_, _$log_, _$scope_, _$location_, /*_mast_,*/ /*_fs_,*/ _wss_, _ns_) {

            $window = _$window_;
            $log = _$log_;
            $scope = _$scope_;
            $loc = _$location_;
            //mast = _mast_;
            //fs = _fs_;
            wss = _wss_;
            ns = _ns_;

            var params = $loc.search();

            if (params.hasOwnProperty('from')) {
                $scope.prevPage = params['from'];
            } else {
                // TODO: hide 'Back' button ?
                console.log('hide Back button');
            }

            $scope.backToPreviousPage = function() {
                ns.navTo($scope.prevPage);
            };

            var handlers = {
                configHistoryDataResponse: configHistoryDataResponse,
                configRestoreResponse: configRestoreResponse
            };

            wss.bindHandlers(handlers);

            $scope.configHistory = _.cloneDeep(configHistory['network']);

            wss.sendEvent('configHistoryDataRequest');

            function configHistoryDataResponse(resp) {
                if (resp.status === 200) {
                    // $scope.configHistory = data.history;
                    $scope.configHistory = _.cloneDeep(resp.data.history);

                    $scope.configHistory.forEach(function(el) {
                        if (el.id === resp.data.currentVersionId) {
                            el.active = true;
                        }
                    });
                }

                $scope.$digest();
            }

            // TODO: function not work ?
            $scope.friendlyDateString = function (date) {
                return moment(date).calendar(null, {
                    sameDay: '[Today] A hh:mm:ss',
                    lastDay: '[Yesterday] A hh:mm:ss',
                    lastWeek: 'YYYY/MM/DD A hh:mm:ss',
                    sameElse: 'YYYY/MM/DD A hh:mm:ss'
                });
            };

            $scope.setSearchOptionsAndSearch = function(option) {
                _.extend(option, { from: 'configHistory' } );
                ns.navTo('configHistoryDetail', option);
            };

            $scope.restore = function(id) {
                wss.sendEvent('configRestoreRequest', {id: id});
            };

            function configRestoreResponse(data) {
                if (data.status === 200) {
                    wss.sendEvent('configHistoryDataRequest');
                }
            }

            $scope.$on('$destroy', function () {
                wss.unbindHandlers(handlers);
            });

            $log.log('OvConfigHistoryCtrl has been created');
        }]);
}());
