(function () {
    'use strict';

    var $log, $scope, $timeout, wss;

    var controllerCpuChartData, controllerCpuChartOption,
        controllerMemChartData, controllerMemChartOption,
        controllerEthChartData, controllerEthChartOption,
        top5TrafficCoreBarChartData,     top5TrafficCoreBarChartOption,
        top5TrafficAccessBarChartData,   top5TrafficAccessBarChartOption,
        top5DropCountCoreBarChartData,   top5DropCountCoreBarChartOption,
        top5DropCountAccessBarChartData, top5DropCountAccessBarChartOption;

    function createControllerCharts() {
        controllerCpuChartData = {
            labels: [],
            datasets: [{
                pointRadius: 0,
                backgroundColor: "rgba(30, 191, 174, 0.2)",
                borderColor: "rgba(30, 191, 174, 1)",
                pointBorderColor: "rgba(30, 191, 174, 1)",
                label: 'CPU',
                data: []
            }]
        };

        controllerCpuChartOption = {
            type: 'line',
            data: controllerCpuChartData,
            options: {
                animation : false,
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                    }]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.yLabel;
                        }
                    }
                }
            }
        };

        controllerMemChartData = {
            labels: [],
            datasets: [{
                pointRadius: 0,
                backgroundColor: "rgba(255, 181, 62, 0.2)",
                borderColor: "rgba(255, 181, 62, 1)",
                pointBorderColor: "rgba(255, 181, 62, 1)",
                label: 'Memory',
                data: []
            }]
        };

        controllerMemChartOption = {
            type: 'line',
            data: controllerMemChartData,
            options: {
                animation : false,
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                    }]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.yLabel;
                        }
                    }
                }
            }
        };

        controllerEthChartData = {
            labels: [],
            datasets: [{
                pointRadius: 0,
                backgroundColor: "rgba(71, 209, 71, 0.3)",
                borderColor: "rgba(71, 209, 71, 1)",
                pointBorderColor: "rgba(71, 209, 71, 1)",
                label: 'Send',
                data: []
            }, {
                pointRadius: 0,
                backgroundColor: "rgba(48, 165, 255, 0.2)",
                borderColor: "rgba(48, 165, 255, 1)",
                pointBorderColor: "rgba(48, 165, 255, 1)",
                label: 'Receive',
                data: []
            }]
        };

        controllerEthChartOption = {
            type: 'line',
            data: controllerEthChartData,
            options: {
                animation : false,
                scales: {
                    xAxes: [{
                        display: false,
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        for (var i = 0; i < 60; i++) {
            controllerCpuChartData.labels.push('');
            controllerCpuChartData.datasets[0].data.push(0);

            controllerMemChartData.labels.push('');
            controllerMemChartData.datasets[0].data.push(0);

            controllerEthChartData.labels.push('');
            controllerEthChartData.datasets[0].data.push(0);
            controllerEthChartData.datasets[1].data.push(0);
        }

        var ctx = document.getElementById("controller-cpu-line-chart").getContext("2d");
        $scope.controllers[0].cpuChart = new Chart(ctx, controllerCpuChartOption);

        ctx = document.getElementById("controller-mem-line-chart").getContext("2d");
        $scope.controllers[0].memChart = new Chart(ctx, controllerMemChartOption);

        ctx = document.getElementById("controller-eth-line-chart").getContext("2d");
        $scope.controllers[0].ethChart = new Chart(ctx, controllerEthChartOption);
    }

    function updateTopRanksTrafficCharts(chart, data) {
        data.sort(function(a, b) {
            var aTotal, bTotal;

            aTotal = a.transmitUtilization + a.receiveUtilization;
            bTotal = b.transmitUtilization + b.receiveUtilization;

            return (aTotal - bTotal) * -1;
        });

        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];

        data.forEach(function(d) {
            var deviceName = getDeviceName(d.device);

            chart.data.labels.push(deviceName + ', port' + d.port);
            chart.data.datasets[0].data.push(d.transmitUtilization);
            chart.data.datasets[1].data.push(d.receiveUtilization);
        });

        chart.update();
    }

    function updateTopRanksDropCountCharts(chart, data) {
        data.sort(function(a, b) {
            var aTotal, bTotal;

            aTotal = a.transmitDropCount + a.receiveDropCount;
            bTotal = b.transmitDropCount + b.receiveDropCount;

            return (aTotal - bTotal) * -1;
        });

        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];

        data.forEach(function(d) {
            var deviceName = getDeviceName(d.device);

            chart.data.labels.push(deviceName + ', port' + d.port);
            chart.data.datasets[0].data.push(d.transmitDropCount);
            chart.data.datasets[1].data.push(d.receiveDropCount);
        });

        chart.update();
    }

    function createTopRanksCharts() {
        top5TrafficCoreBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(71, 209, 71, 0.8)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(48, 165, 255, 1)",
                    data: []
                }
            ]
        };

        top5TrafficCoreBarChartOption = {
            type: 'horizontalBar',
            data: top5TrafficCoreBarChartData,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5TrafficAccessBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(71, 209, 71, 0.8)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(48, 165, 255, 1)",
                    data: []
                }
            ]
        };

        top5TrafficAccessBarChartOption = {
            type: 'horizontalBar',
            data: top5TrafficAccessBarChartData,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5DropCountCoreBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(249, 36, 63, 0.7)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(255, 181, 62, 1)",
                    data: []
                }
            ]
        };

        top5DropCountCoreBarChartOption = {
            type: 'horizontalBar',
            data: top5DropCountCoreBarChartData,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5DropCountAccessBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(249, 36, 63, 0.7)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(255, 181, 62, 1)",
                    data: []
                }
            ]
        };

        top5DropCountAccessBarChartOption = {
            type: 'horizontalBar',
            data: top5DropCountAccessBarChartData,
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        for (var i = 0; i < 5; i++) {
            top5TrafficCoreBarChartData.labels.push('');
            top5TrafficCoreBarChartData.datasets[0].data.push(0);
            top5TrafficCoreBarChartData.datasets[1].data.push(0);

            top5TrafficAccessBarChartData.labels.push('');
            top5TrafficAccessBarChartData.datasets[0].data.push(0);
            top5TrafficAccessBarChartData.datasets[1].data.push(0);

            top5DropCountCoreBarChartData.labels.push('');
            top5DropCountCoreBarChartData.datasets[0].data.push(0);
            top5DropCountCoreBarChartData.datasets[1].data.push(0);

            top5DropCountAccessBarChartData.labels.push('');
            top5DropCountAccessBarChartData.datasets[0].data.push(0);
            top5DropCountAccessBarChartData.datasets[1].data.push(0);
        }

        var ctx = document.getElementById("top5-traffic-core").getContext("2d");
        window.top5trafficCoreBarChart = new Chart(ctx, top5TrafficCoreBarChartOption);

        ctx = document.getElementById("top5-traffic-access").getContext("2d");
        window.top5trafficAccessBarChart = new Chart(ctx, top5TrafficAccessBarChartOption);

        ctx = document.getElementById("top5-drop-count-core").getContext("2d");
        window.top5dropCountCoreBarChart = new Chart(ctx, top5DropCountCoreBarChartOption);

        ctx = document.getElementById("top5-drop-count-access").getContext("2d");
        window.top5dropCountAccessBarChart = new Chart(ctx, top5DropCountAccessBarChartOption);
    }

    function dashboardOverviewDataResponse(data) {
        if (data.status === 200) {
            $scope.overview = data.dashboardOverview;
        } else {
            // TODO: show error
            console.log(data);
        }
    }

    function updateControllerCharts(controllerInfo) {
        var data, value, value2;

        $scope.controllers[0].name = controllerInfo.name;

        data = controllerCpuChartData.datasets[0].data;
        data.forEach(function (el, index, array) {
            if (index !== 0) {
                array[index - 1] = el;
            }
        });
        value = data[data.length - 1] = controllerInfo.cpu.utilization;

        $scope.controllers[0].cpuChart.update();
        $scope.controllers[0].cpuInfo = {
            utilization: value,
            frequencyInGhz: controllerInfo.cpu.frequencyInGhz
        };

        data = controllerMemChartData.datasets[0].data;
        data.forEach(function (el, index, array) {
            if (index !== 0) {
                array[index - 1] = el;
            }
        });
        value = data[ data.length - 1 ] = controllerInfo.memory.utilization;

        $scope.controllers[0].memChart.update();
        $scope.controllers[0].memInfo = {
            utilization: value,
            totalInGb: controllerInfo.memory.totalInGb,
            usedInGb: controllerInfo.memory.usedInGb
        };

        data = controllerEthChartData.datasets[0].data;
        data.forEach(function (el, index, array) {
            if (index !== 0) {
                array[index - 1] = el;
            }
        });
        value = data[ data.length - 1 ] = controllerInfo.ethernet.transmitInKbps;

        data = controllerEthChartData.datasets[1].data;
        data.forEach(function (el, index, array) {
            if (index !== 0) {
                array[index - 1] = el;
            }
        });
        value2 = data[ data.length - 1 ] = controllerInfo.ethernet.receiveInKbps;

        $scope.controllers[0].ethChart.update();
        $scope.controllers[0].ethInfo = {
            transmitInKbps: value,
            receiveInKbps: value2
        };

        $scope.$digest();
    }

    function dashboardControllerDataResponse(data) {
        if (data.status === 200) {
            var controllerInfo = data.dashboardControllers[0];

            updateControllerCharts(controllerInfo);

            $timeout(function(){wss.sendEvent('dashboardControllerDataRequest');}, 1000);
        } else {
            // TODO: show error
            console.log(data);
        }
    }

    function dashboardTopRanksDataResponse(data) {
        if ($scope.isDeviceRespDone === false) {
            var respData = angular.copy(data);
            $timeout(function(){dashboardTopRanksDataResponse(respData)}, 100);
        }

        if (data.status === 200) {
            updateTopRanksTrafficCharts(window.top5trafficCoreBarChart, data.dashboardTopRanks.coreLink.traffic);
            updateTopRanksTrafficCharts(window.top5trafficAccessBarChart, data.dashboardTopRanks.accessLink.traffic);
            updateTopRanksDropCountCharts(window.top5dropCountCoreBarChart, data.dashboardTopRanks.coreLink.dropCount);
            updateTopRanksDropCountCharts(window.top5dropCountAccessBarChart, data.dashboardTopRanks.accessLink.dropCount);

            $timeout(function(){wss.sendEvent('dashboardTopRanksDataRequest');}, 5000);
        } else {
            // TODO: show error
            console.log(data);
        }
    }

    function getDeviceName(deviceId) {
        var index;

        $scope.deviceCfgs = $scope.deviceCfgs || [];

        index = $scope.deviceCfgs.findIndex(function(device) {
            return (device.id === deviceId);
        });

        if (index !== -1) {
            return $scope.deviceCfgs[index].name;
        }

        return "";
    }

    function deviceCfgDataResponse(data) {
        if (data.status === 200) {
            $scope.deviceCfgs = data.deviceCfgs;
        } else {
            // TODO: show error
            console.log(data);
        }

        $scope.isDeviceRespDone = true;
    }

    angular.module('ovDashboard', [])
    .controller('OvDashboardCtrl',
        ['$log', '$scope', '$timeout', 'WebSocketService',

        function (_$log_, _$scope_, _$timeout_, _wss_) {

            $log = _$log_;
            $scope = _$scope_;
            $timeout = _$timeout_;
            wss = _wss_;

            $scope.overview = {
                controller: {
                    totalCount: 0
                },
                spine: {
                    totalCount: 0
                },
                leaf: {
                    totalCount: 0
                },
                rack: {
                    totalCount: 0
                },
                server: {
                    totalCount: 0
                },
                link: {
                    totalCount: 0,
                    issuedCount: 0
                }
            };

            $scope.controllers = [{}];

            $scope.topRanks = {
                coreLink: {
                    traffic: [{}],
                    dropCount: [{}]
                },
                accessLink: {
                    traffic: [{}],
                    dropCount: [{}]
                }
            };

            $scope.deviceCfgs = [];
            $scope.isDeviceRespDone = false;

            var handlers = {
                dashboardOverviewDataResponse: dashboardOverviewDataResponse,
                dashboardControllerDataResponse: dashboardControllerDataResponse,
                dashboardTopRanksDataResponse: dashboardTopRanksDataResponse,
                deviceCfgDataResponse: deviceCfgDataResponse
            };

            wss.bindHandlers(handlers);

            wss.sendEvent('deviceCfgDataRequest');
            wss.sendEvent('dashboardOverviewDataRequest');
            wss.sendEvent('dashboardControllerDataRequest');
            wss.sendEvent('dashboardTopRanksDataRequest');

            createControllerCharts();
            createTopRanksCharts();

            $scope.$on('$destroy', function () {
                wss.unbindHandlers(handlers);
            });

            $log.log('OvDashboardCtrl has been created');
        }]);
}());
