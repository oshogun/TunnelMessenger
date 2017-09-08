"use strict";
exports.__esModule = true;
var UserManager = (function () {
    function UserManager() {
        this.connectedUsers = {};
        this.nicknames = [];
    }
    UserManager.prototype.addUser = function (socketId, name) {
        this.connectedUsers[socketId] = name;
    };
    UserManager.prototype.login = function (socketId, name) {
        this.connectedUsers[socketId] = name;
        this.nicknames.push([socketId, name]);
    };
    UserManager.prototype.logout = function (socketId) {
        for (var i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames.splice(i, 1);
                break;
            }
        }
        delete this.connectedUsers[socketId];
    };
    UserManager.prototype.renameUser = function (socketId, newName) {
        for (var i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames[i][1] = newName;
            }
        }
        this.connectedUsers[socketId] = newName;
    };
    UserManager.prototype.getName = function (socketId) {
        return this.connectedUsers[socketId];
    };
    UserManager.prototype.getNicknames = function () {
        return this.nicknames;
    };
    return UserManager;
}());
exports.UserManager = UserManager;
