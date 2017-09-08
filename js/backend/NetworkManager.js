"use strict";
exports.__esModule = true;
var MessageTarget_1 = require("./MessageTarget");
var NetworkManager = (function () {
    function NetworkManager(io, socket, userManager) {
        this.io = io;
        this.socket = socket;
        this.userManager = userManager;
    }
    NetworkManager.prototype.send = function (target, type) {
        var otherArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            otherArgs[_i - 2] = arguments[_i];
        }
        var io = this.io;
        var socket = this.socket;
        var method;
        var proxy;
        switch (target) {
            case MessageTarget_1.MessageTarget.SENDER:
                method = socket.emit;
                proxy = socket;
                break;
            case MessageTarget_1.MessageTarget.OTHERS:
                method = socket.broadcast.emit;
                proxy = socket.broadcast;
                break;
            case MessageTarget_1.MessageTarget.EVERYONE:
                method = io.emit;
                proxy = io;
                break;
            default:
                throw Error("Unknown MessageTarget: '" + target + "'");
        }
        var args = [type, this.user()].concat(otherArgs);
        method.apply(proxy, args);
    };
    NetworkManager.prototype.serverToSender = function (message) {
        this.socket.emit("chatMessage", this.getName(0), message);
    };
    NetworkManager.prototype.serverBroadcast = function (message) {
        this.io.emit("chatMessage", this.getName(0), message);
    };
    NetworkManager.prototype.login = function (name) {
        this.userManager.login(this.id(), name);
        this.send(MessageTarget_1.MessageTarget.EVERYONE, "changeNick", this.nicknames());
    };
    NetworkManager.prototype.logout = function () {
        this.userManager.logout(this.id());
        this.send(MessageTarget_1.MessageTarget.EVERYONE, "changeNick", this.nicknames());
    };
    NetworkManager.prototype.renameUser = function (newName) {
        this.userManager.renameUser(this.id(), newName);
        this.send(MessageTarget_1.MessageTarget.EVERYONE, "changeNick", this.nicknames());
    };
    NetworkManager.prototype.user = function () {
        return this.getName(this.id());
    };
    NetworkManager.prototype.getName = function (socketId) {
        return this.userManager.getName(socketId);
    };
    NetworkManager.prototype.nicknames = function () {
        return this.userManager.getNicknames();
    };
    NetworkManager.prototype.id = function () {
        return this.socket.id;
    };
    return NetworkManager;
}());
exports.NetworkManager = NetworkManager;
