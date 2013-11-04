var x11 = require('../lib');
var should = require('should');
var assert = require('assert');
var util = require('util');

var TEST_PROPERTY = 'My Test Property';

describe('ChangeProperty', function() {
    before(function(done) {
        var self = this;
        var client = x11.createClient(function(err, dpy) {
            should.not.exist(err);
            self.X = dpy.client;
            self.wid = self.X.AllocID();
            self.wid_helper = self.X.AllocID();
            self.X.CreateWindow(self.wid, dpy.screen[0].root, 0, 0, 1, 1); // 1x1 pixel window
            self.X.CreateWindow(self.wid_helper, dpy.screen[0].root, 0, 0, 1, 1); // 1x1 pixel window
            self.X.QueryTree(dpy.screen[0].root, function(err, list) {
                should.not.exist(err);
                list.children.indexOf(self.wid).should.not.equal(-1);
                done();
            });
        });

        client.on('error', done);
    });

    it('should add a new WINDOW property with length 1', function(done) {
        var self = this;
        this.X.InternAtom(false, TEST_PROPERTY, function(err, atom) {
            should.not.exist(err);
            var raw = new Buffer(4);
            raw.writeUInt32LE(self.wid, 0);
            self.X.ChangeProperty(0, self.wid, atom, self.X.atoms.WINDOW, 32, raw);
            self.X.GetProperty(0, self.wid, atom, self.X.atoms.WINDOW, 0, 1000000000, function(err, prop) {
                prop.data.readUInt32LE(0).should.equal(self.wid);
                done();
            });
        });
    });

    it('should add a new WINDOW property with length 2', function(done) {
        var self = this;
        this.X.InternAtom(false, TEST_PROPERTY, function(err, atom) {
            should.not.exist(err);
            var raw = new Buffer(new Array(8));
            raw.writeUInt32LE(self.wid, 0);
            raw.writeUInt32LE(self.wid_helper, 4);
            console.log(raw);
            self.X.ChangeProperty(0, self.wid, atom, self.X.atoms.ATOM, 32, raw);
            self.X.GetProperty(0, self.wid, atom, self.X.atoms.ATOM, 0, 1000000000, function(err, prop) {
                prop.data.readUInt32LE(0).should.equal(self.wid);
                prop.data.readUInt32LE(4).should.equal(self.wid_helper);
                done();
            });
        });
    });

    it('should replace a the WINDOW property with length 0', function(done) {
        var self = this;
        this.X.InternAtom(false, TEST_PROPERTY, function(err, atom) {
            should.not.exist(err);
            var raw = new Buffer(0);
            self.X.ChangeProperty(0, self.wid, atom, self.X.atoms.WINDOW, 32, raw);
            self.X.GetProperty(0, self.wid, atom, self.X.atoms.WINDOW, 0, 1000000000, function(err, prop) {
                prop.data.length.should.equal(0);
                done();
            });
        });
    });

    after(function(done) {
        this.X.DestroyWindow(this.wid);
        this.X.terminate();
        this.X.on('end', done);
    });
});

