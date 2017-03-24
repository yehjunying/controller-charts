const assert = require('assert');
const lodash = require('lodash');
const angular = lodash;

function makeChart(ctx, opt) {
    return {
        update: function() {}
    };
}

function makeLineChart(canvasContext) {
    var _chartData = {
        datasets: [
            { data: (new Array(60)).fill(0) }
        ]
    },
    _opt = {
        data: _chartData
    },
    _info = {};

    return {
        chart: makeChart(canvasContext, _opt),
        update: function(data) {
            var chartData = _chartData.datasets[0].data;
            angular.forEach(chartData, function (el, index, array) {
                if (index !== 0) {
                    array[index - 1] = el;
                }
            });
            chartData[chartData.length - 1] = data.utilization;
            this.chart.update();

            _info = data;
        },
        chartLast: function(n) {
            n = n || 1;
            var chartData = _chartData.datasets[0].data;

            if (chartData.length < n) {
                n = chartData.length;
            }

            return chartData.slice(chartData.length - n, chartData.length)
                .reverse();
        },
        last: function() {
            return _info;
        }
    };
}

function makeStackChart(canvasContext) {
    var _chartData = {
        datasets: [
            { data: (new Array(60)).fill(0) },
            { data: (new Array(60)).fill(0) }
        ]
    },
    _opt = {
        data: _chartData
    },
    _info = {};
    
     return {
        chart: makeChart(canvasContext, _opt),
        update: function(data) {
            var chartData = _chartData.datasets[0].data;
            angular.forEach(chartData, function (el, index, array) {
                if (index !== 0) {
                    array[index - 1] = el;
                }
            });
            chartData[chartData.length - 1] = data.transmitInKbps;

            chartData = _chartData.datasets[1].data;
            angular.forEach(chartData, function (el, index, array) {
                if (index !== 0) {
                    array[index - 1] = el;
                }
            });
            chartData[chartData.length - 1] = data.receiveInKbps;
            this.chart.update();

            _info = data;
        },
        chartLast: function(n) {
            n = n || 1;
            var chartData = _chartData.datasets[0].data,
            ret = [];

            if (chartData.length < n) {
                n = chartData.length;
            }

            ret[0] = chartData.slice(chartData.length - n, chartData.length)
                .reverse();

            chartData = _chartData.datasets[1].data;
            ret[1] = chartData.slice(chartData.length - n, chartData.length)
                .reverse();

            return ret;
        },
        last: function() {
            return _info;
        }
    };
}

function makeController() {
    return {
        name: '',
        cpu: makeLineChart(),
        memory: makeLineChart(),
        ethernet: makeStackChart(),
        update: function(data) {
            this.name = data.name;
            this.cpu.update(data.cpu);
            this.memory.update(data.memory);
            this.ethernet.update(data.ethernet);
        }
    };
}

function updateControllerCharts(controllers, resp) {
    var r_resp = {};

    angular.forEach(resp, function(value, key) {
        // unique
        r_resp[value.name] = value;
    });
    
    angular.forEach(r_resp, function(value, key) {
        var index = controllers.findIndex(function(ctrl) {
            return (ctrl.name === value.name);
        });
        
        if (index === -1) {
            index = controllers.findIndex(function(ctrl) {
                return (ctrl.name === '');
            });
        }

        if (index === -1) {
            // something error...
            return;
        }

        controllers[index].update(value);
    });

    angular.forEach(controllers, function(value, key) {
        if (typeof r_resp[value.name] === 'undefined') {
            controllers[key].name = '';
        }
    });
}

function makeControllerUtilization(name) {
    return {
        name: name,
        cpu: {
            utilization: 15,
            frequencyInGhz: 2.20
        },
        memory: {
            utilization: 51,
            totalInGb: 4, 
            usedInGb: 1.5 
        }, 
        ethernet: {
            transmitInKbps: 50, 
            receiveInKbps: 55
        }
    };
}

(function test_for_init(){
    var controllers = [
        makeController(), makeController(), makeController()
    ],
    respCtrl1 = makeControllerUtilization('ctrl1'),
    respCtrl2 = makeControllerUtilization('ctrl2'),
    resp = {
        status: 200, 
        dashboardControllers: [
            respCtrl1, respCtrl2
        ]
    };

    updateControllerCharts(controllers, resp.dashboardControllers);
    
    assert.equal(respCtrl1.name, controllers[0].name);
    assert.deepEqual(respCtrl1.cpu, controllers[0].cpu.last());
    assert.deepEqual(respCtrl1.memory, controllers[0].memory.last());
    assert.deepEqual(respCtrl1.ethernet, controllers[0].ethernet.last());
    assert.equal(respCtrl2.name, controllers[1].name);
})();

(function test_for_response_element_position_is_changed(){
    var controllers = [
        makeController(), makeController(), makeController()
    ],
    respCtrl1 = makeControllerUtilization('ctrl1'),
    respCtrl2 = makeControllerUtilization('ctrl2'),
    resp = {
        status: 200, 
        dashboardControllers: [
            respCtrl1, respCtrl2
        ]
    };

    updateControllerCharts(controllers, resp.dashboardControllers);
    
    assert.equal(respCtrl1.name, controllers[0].name);
    assert.deepEqual(respCtrl1.cpu, controllers[0].cpu.last());
    assert.deepEqual(respCtrl1.memory, controllers[0].memory.last());
    assert.deepEqual(respCtrl1.ethernet, controllers[0].ethernet.last());
    assert.equal(respCtrl2.name, controllers[1].name);

    var resp2 = {
        status: 200, 
        dashboardControllers: [
            makeControllerUtilization('ctrl2'),
            makeControllerUtilization('ctrl1')
        ]
    };

    updateControllerCharts(controllers, resp2.dashboardControllers);

    assert.equal(respCtrl1.name, controllers[0].name);
    assert.deepEqual(respCtrl1.cpu, controllers[0].cpu.last());
    assert.deepEqual(respCtrl1.memory, controllers[0].memory.last());
    assert.deepEqual(respCtrl1.ethernet, controllers[0].ethernet.last());
    assert.equal(respCtrl2.name, controllers[1].name);
})();

(function test_for_response_element_disappear(){
    var controllers = [
        makeController(), makeController(), makeController()
    ],
    respCtrl1 = makeControllerUtilization('ctrl1'),
    respCtrl2 = makeControllerUtilization('ctrl2'),
    resp = {
        status: 200, 
        dashboardControllers: [
            respCtrl1, respCtrl2
        ]
    };

    updateControllerCharts(controllers, resp.dashboardControllers);
    
    assert.equal(respCtrl1.name, controllers[0].name);
    assert.deepEqual(respCtrl1.cpu, controllers[0].cpu.last());
    assert.deepEqual(respCtrl1.memory, controllers[0].memory.last());
    assert.deepEqual(respCtrl1.ethernet, controllers[0].ethernet.last());
    assert.equal(respCtrl2.name, controllers[1].name);

    var resp2 = {
        status: 200, 
        dashboardControllers: [
            makeControllerUtilization('ctrl2')
        ]
    };

    updateControllerCharts(controllers, resp2.dashboardControllers);

    assert.equal('', controllers[0].name);
    assert.equal(respCtrl2.name, controllers[1].name);
})();

(function test_for_response_element_update_continuously(){
    var controllers = [
        makeController(), makeController(), makeController()
    ];

    updateControllerCharts(controllers, [{
        name: 'ctrl1',
        cpu: { utilization: 1 },
        memory: { utilization: 1 }, 
        ethernet: { transmitInKbps: 1, receiveInKbps: 1 }
    }]);
    
    assert.equal('ctrl1', controllers[0].name);
    
    assert.deepEqual([1], controllers[0].cpu.chartLast());
    assert.deepEqual([1], controllers[0].memory.chartLast());
    assert.deepEqual([[1],[1]], controllers[0].ethernet.chartLast());

    assert.equal(1, controllers[0].cpu.last().utilization);
    assert.equal(1, controllers[0].memory.last().utilization);
    assert.equal(1, controllers[0].ethernet.last().transmitInKbps);

    updateControllerCharts(controllers, [{
        name: 'ctrl1',
        cpu: { utilization: 2 },
        memory: { utilization: 2 }, 
        ethernet: { transmitInKbps: 2, receiveInKbps: 2 }
    }]);
    
    assert.equal('ctrl1', controllers[0].name);

    assert.deepEqual([2, 1], controllers[0].cpu.chartLast(2));
    assert.deepEqual([2, 1], controllers[0].memory.chartLast(2));

    assert.equal(2, controllers[0].cpu.last().utilization);
    assert.equal(2, controllers[0].memory.last().utilization);
    assert.equal(2, controllers[0].ethernet.last().transmitInKbps);
    
    updateControllerCharts(controllers, [{
        name: 'ctrl1',
        cpu: { utilization: 3 },
        memory: { utilization: 3 }, 
        ethernet: { transmitInKbps: 3, receiveInKbps: 3 }
    }]);
    
    assert.equal('ctrl1', controllers[0].name);

    assert.deepEqual([3, 2, 1], controllers[0].cpu.chartLast(3));
    assert.deepEqual([3, 2, 1], controllers[0].memory.chartLast(3));

    assert.equal(3, controllers[0].cpu.last().utilization);
    assert.equal(3, controllers[0].memory.last().utilization);
    assert.equal(3, controllers[0].ethernet.last().transmitInKbps);
})();

console.log('pass');
process.exit(0);