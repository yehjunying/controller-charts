const assert = require('assert');
var math = require('mathjs');

var Math = {
    _cos: {
        0: 1,
        90: 0,
        180: -1,
        270: 0
    },
    _sin: {
        0: 0,
        90: 1,
        180: 0,
        270: -1
    },
    cos: function (deg) {
        if (typeof this._cos[deg] === 'undefined') {
            this._cos[deg] = math.eval('cos(' + deg + ' deg)');
        }

        return this._cos[deg];
    },
    sin: function (deg) {
        if (typeof this._sin[deg] === 'undefined') {
            this._sin[deg] = math.eval('sin(' + deg + ' deg)');
        }

        return this._sin[deg];
    },
    round: math.round
};

function justify (devices, logicView) {
    devices.forEach(function(el, index, array) {
        var offsetX = logicView.left || 0,
            offsetY = logicView.top || 0;

        el.x = offsetX + (logicView.width / (array.length * 2) * (index * 2 + 1));
        el.y = offsetY + (logicView.height / 2);
    });
}

function l2p (device, logicView, phyView) {
    device.x = device.x * (phyView.width / logicView.width) + phyView.left;
    device.y = device.y * (phyView.height / logicView.height) + phyView.top;
}

function justifyLayout (topo, phyView) {

    var logicView = {
        width: 1000,
        height: 1000
    };

    justify(topo[0], {
        width: logicView.width,
        height: logicView.height / 4 * 1});

    justify(topo[1], {
        top: (logicView.height / 4) * 1,
        width: logicView.width, height: logicView.height / 4 * 1
    });

    justify(topo[2], {
        top: (logicView.height / 4) * 2,
        width: logicView.width,
        height: logicView.height / 4 * 2});

    // scaling
    topo.forEach(function (devices) {
        devices.forEach(function(dev) {
            l2p(dev, logicView, phyView);
        });
    });
}

function justifyGroupLayout (topo, phyView) {

    var logicView = {
        width: 1000,
        height: 1000
    };

    justify(topo[0], {
        width: logicView.width,
        height: logicView.height / 4 * 1
    });

    justify(topo[1], {
        top: (logicView.height / 4) * 1,
        width: logicView.width,
        height: logicView.height / 4 * 1
    });

    topo[1].reduce(function(offset, el) {
        var width = (el.x - offset.left) * 2,
            height = (logicView.height / 4) * 2,
            nodes;

        nodes = topo[2].reduce(function(nodes, n) {
            if (n.cp.device == el.id) {
                nodes = nodes.concat(n);
            }
            return nodes;
        }, []);

        justify(nodes, {left: offset.left, top: offset.top,  width: width, height: height});

        offset.left += width;
        return offset;
    }, {left: 0, top: (logicView.height / 4) * 2});

    // scaling
    topo.forEach(function (devices) {
        devices.forEach(function(dev) {
            l2p(dev, logicView, phyView);
        });
    });
}

function justifyGroupWeightLayout (topo, phyView) {

    var logicView = {
        width: 1000,
        height: 1000
    };

    justify(topo[0], {
        width: logicView.width,
        height: logicView.height / 4 * 1
    });

    //justify(topo[1], {
    //    top: (logicView.height / 4) * 1,
    //    width: logicView.width,
    //    height: logicView.height / 4 * 1
    //});

    topo[1].reduce(function(offset, el) {
        var width = (el.x - offset.left) * 2,
            height = (logicView.height / 4) * 2,
            nodes,
            totalWeight = topo[1].length + topo[2].length,
            weight;

        nodes = topo[2].reduce(function(nodes, n) {
            if (n.cp.device == el.id) {
                nodes = nodes.concat(n);
            }
            return nodes;
        }, []);

        weight = nodes.length + 1;
        width = (logicView.width / totalWeight) * weight;

        console.log(width);
        el.x = offset.left + width / 2;
        el.y = (logicView.height / 4) * 1 + (logicView.height / 8);


        justify(nodes, {left: offset.left, top: offset.top,  width: width, height: height});

        offset.left += width;
        return offset;
    }, {left: 0, top: (logicView.height / 4) * 2});

    // scaling
    topo.forEach(function (devices) {
        devices.forEach(function(dev) {
            l2p(dev, logicView, phyView);
        });
    });
}

(function () {
    var topo = [
        [
            {
               'role': 'spine',
                x: 0,
                y: 0
            },
            {
                'role': 'spine',
                x: 0,
                y: 0
            }
        ],
        [
            {
                'role': 'tor',
                x: 0,
                y: 0
            },
            {
                'role': 'tor',
                x: 0,
                y: 0
            },
            {
                'role': 'tor',
                x: 0,
                y: 0
            },
            {
                'role': 'tor',
                x: 0,
                y: 0
            }
        ],
        [
            {
               'role': 'host'
            },
            {
               'role': 'host'
            },
            {
               'role': 'host'
            },
            {
               'role': 'host'
            },
            {
               'role': 'host'
            }
        ]
    ];

    justifyLayout(topo, {left: 10, top: 20, width: 100, height: 100});

    assert.equal(topo[0][0].x, 25.0 + 10);
    assert.equal(topo[0][1].x, 75.0 + 10);

    assert.equal(topo[0][0].y, 12.5 + 20);
    assert.equal(topo[0][1].y, 12.5 + 20);

    assert.equal(topo[1][0].x, 12.5 + 10);
    assert.equal(topo[1][1].x, 37.5 + 10);
    assert.equal(topo[1][2].x, 62.5 + 10);
    assert.equal(topo[1][3].x, 87.5 + 10);

    assert.equal(topo[1][0].y, 37.5 + 20);
    assert.equal(topo[1][1].y, 37.5 + 20);
    assert.equal(topo[1][2].y, 37.5 + 20);
    assert.equal(topo[1][3].y, 37.5 + 20);

    assert.equal(topo[2][0].x, 10.0 + 10);
    assert.equal(topo[2][1].x, 30.0 + 10);
    assert.equal(topo[2][2].x, 50.0 + 10);
    assert.equal(topo[2][3].x, 70.0 + 10);
    assert.equal(topo[2][4].x, 90.0 + 10);

    assert.equal(topo[2][0].y, 75.0 + 20);
    assert.equal(topo[2][1].y, 75.0 + 20);
    assert.equal(topo[2][2].y, 75.0 + 20);
    assert.equal(topo[2][3].y, 75.0 + 20);
    assert.equal(topo[2][4].y, 75.0 + 20);
})();

function makeTor(id) {
    return {
            "id": id,
            "type":"switch",
            "class":"device",
            "role": "tor",
            "x":218.5,
            "y":48
    };
}

function makeSpine(id, attrs) {
    attrs = attrs || {};

    return Object.assign({
            "id": id,
            "type":"switch",
            "class":"device",
            "role": "spine",
            "x":218.5,
            "y":48
    }, attrs);
}

function makeHost(id, cpDevice) {
    return {
            "id": id, //"0E:2A:69:30:13:81/-1",
            "type": "endstation",
            "class": "host",
            "role": "host",
            "x":218.5,
            "y":48,
            "cp": {
                "device": cpDevice, //"rest:216.58.200.211:80",
                "port": 81
            }
    };
}

(function () {
    var topo = [
        [makeSpine('spine1'), makeSpine('spine2')],
        [makeTor('tor1'), makeTor('tor2'), makeTor('tor3'), makeTor('tor4')],
        [makeHost('host1', 'tor1'), makeHost('host2', 'tor1'),
         makeHost('host3', 'tor2'), 
         makeHost('host4', 'tor3'), makeHost('host5', 'tor3'), makeHost('host6', 'tor3'), makeHost('host7', 'tor3')]
    ];

    justifyGroupLayout(topo, {left: 10, top: 20, width: 100, height: 100});

    // spine
    assert.equal(topo[0][0].x, 25.0 + 10);
    assert.equal(topo[0][1].x, 75.0 + 10);

    assert.equal(topo[0][0].y, 12.5 + 20);
    assert.equal(topo[0][1].y, 12.5 + 20);

    // tor
    assert.equal(topo[1][0].x, 12.5 + 10);
    assert.equal(topo[1][1].x, 37.5 + 10);
    assert.equal(topo[1][2].x, 62.5 + 10);
    assert.equal(topo[1][3].x, 87.5 + 10);

    assert.equal(topo[1][0].y, 37.5 + 20);
    assert.equal(topo[1][1].y, 37.5 + 20);
    assert.equal(topo[1][2].y, 37.5 + 20);
    assert.equal(topo[1][3].y, 37.5 + 20);

    // hosts
    // on tor1
    assert.equal(topo[2][0].x,  6.25 + 10);
    assert.equal(topo[2][1].x, 18.75 + 10);

    // on tor2
    assert.equal(topo[2][2].x, 37.5 + 10);

    // on tor3
    assert.equal(topo[2][3].x, 53.125 + 10);
    assert.equal(topo[2][4].x, 59.375 + 10);
    assert.equal(topo[2][5].x, 65.625 + 10);
    assert.equal(topo[2][6].x, 71.875 + 10);

    assert.equal(topo[2][0].y, 75.0 + 20);
    assert.equal(topo[2][1].y, 75.0 + 20);
    assert.equal(topo[2][2].y, 75.0 + 20);
    assert.equal(topo[2][3].y, 75.0 + 20);
    assert.equal(topo[2][4].y, 75.0 + 20);
    assert.equal(topo[2][5].y, 75.0 + 20);
    assert.equal(topo[2][6].y, 75.0 + 20);
})();

(function () {
    var topo = [
        [makeSpine('spine1'), makeSpine('spine2')],
        [makeTor('tor1'), makeTor('tor2'), makeTor('tor3'), makeTor('tor4')],
        [makeHost('host1', 'tor1'), makeHost('host2', 'tor1'),
         makeHost('host3', 'tor2'), 
         makeHost('host4', 'tor3'), makeHost('host5', 'tor3'), makeHost('host6', 'tor3')]
    ];

    justifyGroupWeightLayout(topo, {left: 10, top: 20, width: 100, height: 100});

    // spine
    assert.equal(topo[0][0].x, 25.0 + 10);
    assert.equal(topo[0][1].x, 75.0 + 10);

    assert.equal(topo[0][0].y, 12.5 + 20);
    assert.equal(topo[0][1].y, 12.5 + 20);

    // tor
    assert.equal(topo[1][0].x, 15.0 + 10);
    assert.equal(topo[1][1].x, 40.0 + 10);
    assert.equal(topo[1][2].x, 70.0 + 10);
    assert.equal(topo[1][3].x, 95.0 + 10);

    assert.equal(topo[1][0].y, 37.5 + 20);
    assert.equal(topo[1][1].y, 37.5 + 20);
    assert.equal(topo[1][2].y, 37.5 + 20);
    assert.equal(topo[1][3].y, 37.5 + 20);

    // hosts
    // on tor1
    assert.equal(topo[2][0].x,  7.5 + 10);
    assert.equal(topo[2][1].x, 22.5 + 10);

    // on tor2
    assert.equal(topo[2][2].x, 40.0 + 10);

    // on tor3
    assert.equal(Math.round(topo[2][3].x, 1), 56.7 + 10);
    assert.equal(Math.round(topo[2][4].x, 1), 70.0 + 10);
    assert.equal(Math.round(topo[2][5].x, 1), 83.3 + 10);

    assert.equal(topo[2][0].y, 75.0 + 20);
    assert.equal(topo[2][1].y, 75.0 + 20);
    assert.equal(topo[2][2].y, 75.0 + 20);
    assert.equal(topo[2][3].y, 75.0 + 20);
    assert.equal(topo[2][4].y, 75.0 + 20);
    assert.equal(topo[2][5].y, 75.0 + 20);
})();

function getTopo(lu) {
    var topo = [
            [], [], []
        ],
        hosts = {};

    Object.keys(lu).forEach(function(key) {
        if (!lu[key].role) {
            return;
        }

        if (lu[key].role === 'tor') {
            topo[0].push(lu[key]);
        } else if (lu[key].role === 'spine') {
            topo[1].push(lu[key]);
        } else {
            //topo[2].push(lu[key]);
            var spine = lu[key].cp.device;

            if (typeof hosts[spine] === 'undefined') {
                hosts[spine] = [];
            }

            hosts[spine].push(lu[key]);
        }
    });
    
    topo[1].forEach(function (spine) {
        if (hosts[spine.id]) {
            topo[2] = topo[2].concat(hosts[spine.id]);
        }
    });

    return topo;
}

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80")
    };

    var ref = lu["rest:2.0.0.1:80"],
        topo = [];

    topo.push(lu["rest:2.0.0.1:80"]);
    ref.x = 1234;
    assert.equal(topo[0].x, 1234);

})();

// (function() {
//     var lu = {
//         "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80"),
//         "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80"),
//
//         "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
//         "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
//         "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
//         "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
//
//         "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:1.0.0.1:80"),
//         "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:1.0.0.1:80"),
//
//         "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:1.0.0.2:80"),
//         "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:1.0.0.3:80"),
//         "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:1.0.0.4:80"),
//     };
//
//     function getTopo(lu, attr) {
//         var attr = attr || {},
//             topo = [
//                 [], [], []
//             ],
//             hosts = {};
//
//         Object.keys(lu).forEach(function (key) {
//             var node = lu[key],
//                 role = attr.get.call(node, 'role');
//
//                 node['___$attr$___'] = attr;
//
//             if (role === 'spine') {
//                 lu[key].x = 'ss';
//                 topo[0].push(lu[key]);
//             } else if (role === 'tor') {
//                 topo[1].push(lu[key]);
//             } else {
//                 //var tor = lu[key].cp.device;
//                 var tor = attr.get.call(node, 'cp');
//
//                 if (typeof hosts[tor] === 'undefined') {
//                     hosts[tor] = [];
//                 }
//
//                 hosts[tor].push(lu[key]);
//             }
//         });
//
//         topo[1].forEach(function (tor) {
//             // FIXME: consider for no spine case
//             if (hosts[tor.id]) {
//                 topo[2] = topo[2].concat(hosts[tor.id]);
//             }
//         });
//
//         return topo;
//     }
//
//     var topo = getTopo(lu, {
//         get: function (name) {
//             if (name === 'cp') {
//                 return this.cp.device;
//             } else if (name === 'x') {
//                 if (this.metaUi && this.metaUi.hasOwnProperty('x')) {
//                     return this.metaUi.x;
//                 }
//             } else if (name === 'y') {
//                 if (this.metaUi && this.metaUi.hasOwnProperty('y')) {
//                     return this.metaUi.y;
//                 }
//             }
//
//             return this[name];
//         },
//         set: function (name, val) {
//             if (name === 'x') {
//                 if (!this.hasOwnProperty('metaUi')) {
//                     this['metaUi'] = {};
//                 }
//
//                 this.metaUi.x = val;
//             } else if (name === 'y') {
//                 if (!this.hasOwnProperty('metaUi')) {
//                     this['metaUi'] = {};
//                 }
//
//                 this.metaUi.y = val;
//             } else {
//                 this[name] = val;
//             }
//         }
//     });
//
//     assert.equal(topo[0].length, 2);
//     topo[0].forEach(function(el) {
//         assert.equal(el.role, "spine");
//     });
//
//     assert.equal(topo[1].length, 4);
//     topo[1].forEach(function(el) {
//         assert.equal(el.role, "tor");
//     });
//
//     assert.equal(topo[2].length, 5);
//     topo[2].forEach(function(el) {
//         assert.equal(el.role, "host");
//     });
//
//     autolayout(topo, {left: 0, top: 0, width: 1000, height: 1000});
//
//     assert.equal(topo[0][0].x, 250);
//     assert.equal(topo[0][1].x, 750);
//
//     assert.equal(topo[0][0].y, 125);
//     assert.equal(topo[0][1].y, 125);
//
//     assert.equal(topo[1][0].x, 125);
//     assert.equal(topo[1][1].x, 375);
//     assert.equal(topo[1][2].x, 625);
//     assert.equal(topo[1][3].x, 875);
//
//     assert.equal(topo[1][0].y, 375);
//     assert.equal(topo[1][1].y, 375);
//     assert.equal(topo[1][2].y, 375);
//     assert.equal(topo[1][3].y, 375);
//
//     assert.equal(topo[2][0].x, 100);
//     assert.equal(topo[2][1].x, 300);
//     assert.equal(topo[2][2].x, 500);
//     assert.equal(topo[2][3].x, 700);
//     assert.equal(topo[2][4].x, 900);
//
//     assert.equal(topo[2][0].y, 750);
//     assert.equal(topo[2][1].y, 750);
//     assert.equal(topo[2][2].y, 750);
//     assert.equal(topo[2][3].y, 750);
//     assert.equal(topo[2][4].y, 750);
//
// })();

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80"),
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80"),

        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:2.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:2.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:2.0.0.1:80")
    };


    var topo = getTopo(lu);

    assert.equal(topo[0].length, 4);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "tor");
    });

    assert.equal(topo[1].length, 2);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[2].length, 5);
    topo[2].forEach(function(el) {
        assert.equal(el.role, "host");
    });

    assert.equal(topo[2][0].id, "0E:2A:3F:00:00:01/-1");
    assert.equal(topo[2][1].id, "0E:2A:3F:00:00:02/-1");
    assert.equal(topo[2][2].id, "0E:2A:3F:00:00:03/-1");
    assert.equal(topo[2][3].id, "0E:2A:3F:00:00:04/-1");
    assert.equal(topo[2][4].id, "0E:2A:3F:00:00:05/-1");

})();

(function(){
    var lu = {
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80"),
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80"),

        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:2.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:2.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:2.0.0.1:80")
    };


    var topo = getTopo(lu);

    assert.equal(topo[0].length, 4);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "tor");
    });

    assert.equal(topo[1].length, 2);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[2].length, 5);
    topo[2].forEach(function(el) {
        assert.equal(el.role, "host");
    });

    assert.equal(topo[2][0].id, "0E:2A:3F:00:00:01/-1");
    assert.equal(topo[2][1].id, "0E:2A:3F:00:00:02/-1");
    assert.equal(topo[2][2].id, "0E:2A:3F:00:00:03/-1");
    assert.equal(topo[2][3].id, "0E:2A:3F:00:00:04/-1");
    assert.equal(topo[2][4].id, "0E:2A:3F:00:00:05/-1");

})();

function syncPosition(topo, lu) {
    topo.forEach(function(devices) {
        devices.forEach(function(dev){
            if (lu[dev.id]) {
                if (typeof lu[dev.id].metaUi === 'undefined') {
                    lu[dev.id].metaUi = {};
                }
                lu[dev.id].metaUi.x = dev.x;
                lu[dev.id].metaUi.y = dev.y;
            }
        });
    });
}

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80"),
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80"),

        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:2.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:2.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:2.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:2.0.0.1:80"),
    };


    var topo = getTopo(lu);

    syncPosition(topo, lu);

    topo.forEach(function(devices) {
        devices.forEach(function(dev) {
            assert.equal(lu[dev.id].metaUi.x, dev.x);
            assert.equal(lu[dev.id].metaUi.y, dev.y);
        });
    });

})();

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80", {x: 0, y: 0}),
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80", {x: 100, y: 100}),

        // "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
        // "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
        // "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
        // "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
        //
        // "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:2.0.0.2:80"),
        // "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:2.0.0.2:80"),
        //
        // "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:2.0.0.1:80"),
        // "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:2.0.0.1:80"),
        // "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:2.0.0.1:80")
    };

    // var x = 50,
    //     y = 50,
    //     xl, yl;
    //
    // xl = x * Math.cos(90) - y * Math.sin(90);
    // yl = x * Math.sin(90) + y * Math.cos(90);

    function transform(lu, fn) {
        Object.keys(lu).forEach(function(key) {
            fn(lu[key]);
        });
    }

    var maxY = Number.NEGATIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        minX = Number.POSITIVE_INFINITY,
        h,
        w;

    transform(lu, function start (d) {
        if (d.x < minX) {
            minX = d.x;
        }

        if (d.y < minY) {
            minY = d.y;
        }

        if (maxX < d.x) {
            maxX = d.x;
        }

        if (maxY < d.y) {
            maxY = d.y;
        }

        h = maxY - minY;
        w = maxX - minX;
    });

    transform(lu, function translate (d) {
        d.y = h - d.y;
    });

    assert.equal(lu['rest:2.0.0.1:80'].x, 0);
    assert.equal(lu['rest:2.0.0.1:80'].y, 100);

    assert.equal(lu['rest:2.0.0.2:80'].x, 100);
    assert.equal(lu['rest:2.0.0.2:80'].y, 0);

    transform(lu, function translate(d) {
        d.x -= (w / 2);
        d.y -= (h / 2);
    });

    assert.equal(lu['rest:2.0.0.1:80'].x, -50);
    assert.equal(lu['rest:2.0.0.1:80'].y, 50);

    assert.equal(lu['rest:2.0.0.2:80'].x, 50);
    assert.equal(lu['rest:2.0.0.2:80'].y, -50);

    transform(lu, function rotate(d) {
        var x = d.x,
            y = d.y;

        d.x = x * Math.cos(90) - y * Math.sin(90);
        d.y = x * Math.sin(90) + y * Math.cos(90);
    });

    assert.equal(lu['rest:2.0.0.1:80'].x, -50);
    assert.equal(lu['rest:2.0.0.1:80'].y, -50);

    assert.equal(lu['rest:2.0.0.2:80'].x, 50);
    assert.equal(lu['rest:2.0.0.2:80'].y, 50);

    transform(lu, function translate(d) {
        d.x += (w / 2);
        d.y += (h / 2);
    });

    assert.equal(lu['rest:2.0.0.1:80'].x, 0);
    assert.equal(lu['rest:2.0.0.1:80'].y, 0);

    assert.equal(lu['rest:2.0.0.2:80'].x, 100);
    assert.equal(lu['rest:2.0.0.2:80'].y, 100);

    transform(lu, function translate (d) {
        d.y = h - d.y;
    });

    assert.equal(lu['rest:2.0.0.1:80'].x, 0);
    assert.equal(lu['rest:2.0.0.1:80'].y, 100);

    assert.equal(lu['rest:2.0.0.2:80'].x, 100);
    assert.equal(lu['rest:2.0.0.2:80'].y, 0);

})();

function rotateRight(data) {

    var xx = function (data) {
        var self = {
            maxY: Number.NEGATIVE_INFINITY,
            minY: Number.POSITIVE_INFINITY,
            maxX: Number.NEGATIVE_INFINITY,
            minX: Number.POSITIVE_INFINITY,
            h: 0,
            w: 0
        };

        return {
            transform: function (fn) {

                Object.keys(data).forEach(function(key) {
                    fn.call(self, data[key]);
                });

                return this;
            }
        }
    };

    xx(data)
        .transform(function range (d) {
            if (d.x < this.minX) {
                this.minX = d.x;
            }

            if (d.y < this.minY) {
                this.minY = d.y;
            }

            if (this.maxX < d.x) {
                this.maxX = d.x;
            }

            if (this.maxY < d.y) {
                this.maxY = d.y;
            }

            this.h = this.maxY - this.minY;
            this.w = this.maxX - this.minX;
        })
        .transform(function translate (d) {
            d.y = this.h - d.y;
        })
        .transform(function translate (d) {
            d.x -= (this.w / 2);
            d.y -= (this.h / 2);
        })
        .transform(function rotate(d) {
            var x = d.x,
                y = d.y;

            d.x = x * Math.cos(90) - y * Math.sin(90);
            d.y = x * Math.sin(90) + y * Math.cos(90);
        })
        .transform(function translate(d) {
            d.x += (this.w / 2);
            d.y += (this.h / 2);
        })
        .transform(function translate (d) {
            d.y = this.h - d.y;
        });
}

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80", {x: 0, y: 0}),
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80", {x: 100, y: 100})
    };

    rotateRight(lu);

    assert.equal(lu['rest:2.0.0.1:80'].x, 0);
    assert.equal(lu['rest:2.0.0.1:80'].y, 100);

    assert.equal(lu['rest:2.0.0.2:80'].x, 100);
    assert.equal(lu['rest:2.0.0.2:80'].y, 0);

})();

console.log('pass');
process.exit(0);
