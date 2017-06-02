var layout = (function () {

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

  return {
    justifyLayout: justifyLayout,
    justifyGroupLayout: justifyGroupLayout,
    justifyGroupWeightLayout: justifyGroupWeightLayout
  };
})();