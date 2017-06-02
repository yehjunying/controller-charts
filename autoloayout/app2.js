const assert = require('assert');

function getTopo(lu) {
    var topo = [
            [], [], []
        ],
        hosts = {},
        racks = {};

    Object.keys(lu).forEach(function(key) {
        if (!lu[key].role) {
            return;
        }

        if (lu[key].role === 'spine') {
            topo[0].push(lu[key]);
        } else if (lu[key].role === 'tor') {
            var rackId = lu[key].rack;

            if (typeof racks[rackId] === 'undefined') {
                racks[rackId] = [];
            }

            racks[rackId].push(lu[key]);
            // topo[1].push(lu[key]);
        } else {
            var tor = lu[key].cp.device;

            if (typeof hosts[tor] === 'undefined') {
                hosts[tor] = [];
            }

            hosts[tor].push(lu[key]);
        }
    });

    topo[0].sort(function(a, b) {
        return (a.id < b.id) ? -1 : 1;
    });

    Object.keys(racks)
    .sort()
    .forEach(function(key) {
        var rack = racks[key];

        rack.sort(function(a, b) {
            return (a.id < b.id) ? -1 : 1;
        })
        .forEach(function(tor) {
            // topo[1] = topo[1].concat(tor);
            topo[1].push(tor);
        });
    });

    topo[1].forEach(function (tor) {
        // tor has children
        if (hosts[tor.id]) {
            hosts[tor.id].sort(function(a, b) {
                return (a.id < b.id) ? -1 : 1;
            });

            topo[2] = topo[2].concat(hosts[tor.id]);
        }
    });

    return topo;
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

function makeTor(id, rack) {
    return {
            "id": id,
            "type":"switch",
            "class":"device",
            "role": "tor",
            "rack": rack || 'rack',
            "x":218.5,
            "y":48
    };
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

(function(){
    var lu = {
        "rest:2.0.0.1:80": makeSpine("rest:2.0.0.1:80"),
        "rest:2.0.0.2:80": makeSpine("rest:2.0.0.2:80"),

        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80"),
        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80"),
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:1.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:1.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:1.0.0.1:80")
    };


    var topo = getTopo(lu);

    assert.equal(topo[0].length, 2);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[1].length, 4);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "tor");
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
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:1.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:1.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:1.0.0.1:80")
    };

    var topo = getTopo(lu);

    assert.equal(topo[0].length, 2);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[0][0].id, "rest:2.0.0.1:80");
    assert.equal(topo[0][1].id, "rest:2.0.0.2:80");

    assert.equal(topo[1].length, 4);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "tor");
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

        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80", "2a"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80", "1a"),
        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80", "2a"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80", "1a"),
        
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:1.0.0.2:80"),
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:1.0.0.2:80"),

        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:1.0.0.1:80")
    };

    var topo = getTopo(lu);

    assert.equal(topo[0].length, 2);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[0][0].id, "rest:2.0.0.1:80");
    assert.equal(topo[0][1].id, "rest:2.0.0.2:80");

    assert.equal(topo[1].length, 4);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "tor");
    });

    assert.equal(topo[1][0].id, "rest:1.0.0.3:80");
    assert.equal(topo[1][1].id, "rest:1.0.0.4:80");
    assert.equal(topo[1][2].id, "rest:1.0.0.1:80");
    assert.equal(topo[1][3].id, "rest:1.0.0.2:80");
    
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

        "rest:1.0.0.2:80": makeTor("rest:1.0.0.2:80", "2a"),
        "rest:1.0.0.4:80": makeTor("rest:1.0.0.4:80", "1a"),
        "rest:1.0.0.1:80": makeTor("rest:1.0.0.1:80", "2a"),
        "rest:1.0.0.3:80": makeTor("rest:1.0.0.3:80", "1a"),
        
        "0E:2A:3F:00:00:05/-1": makeHost("0E:2A:3F:00:00:05/-1", "rest:1.0.0.1:80"),
        "0E:2A:3F:00:00:04/-1": makeHost("0E:2A:3F:00:00:04/-1", "rest:1.0.0.1:80"),

        "0E:2A:3F:00:00:03/-1": makeHost("0E:2A:3F:00:00:03/-1", "rest:1.0.0.4:80"),
        "0E:2A:3F:00:00:02/-1": makeHost("0E:2A:3F:00:00:02/-1", "rest:1.0.0.3:80"),
        "0E:2A:3F:00:00:01/-1": makeHost("0E:2A:3F:00:00:01/-1", "rest:1.0.0.3:80")
    };

    var topo = getTopo(lu);

    assert.equal(topo[0].length, 2);
    topo[0].forEach(function(el) {
        assert.equal(el.role, "spine");
    });

    assert.equal(topo[0][0].id, "rest:2.0.0.1:80");
    assert.equal(topo[0][1].id, "rest:2.0.0.2:80");

    assert.equal(topo[1].length, 4);
    topo[1].forEach(function(el) {
        assert.equal(el.role, "tor");
    });

    assert.equal(topo[1][0].id, "rest:1.0.0.3:80");
    assert.equal(topo[1][1].id, "rest:1.0.0.4:80");
    assert.equal(topo[1][2].id, "rest:1.0.0.1:80");
    assert.equal(topo[1][3].id, "rest:1.0.0.2:80");
    
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

console.log('pass');
process.exit(0);