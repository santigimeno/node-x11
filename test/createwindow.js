var x11 = require('../lib/x11');

var xclient = x11.createClient();

xclient.on('connect', function(display) {
    var X = this;
    var root = display.screen[0].root;
    var wid = X.AllocID();

    X.CreateWindow(wid, root, 10, 10, 400, 300, 1, 1, 0, { backgroundPixel: 0, eventMask: 0x00000040 });
    X.MapWindow(wid);
});