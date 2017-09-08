"use strict";
exports.__esModule = true;
var PackageIndex_1 = require("./PackageIndex");
var CommandLoader = (function () {
    function CommandLoader() {
        this.commands = {};
        this.packages = [];
    }
    CommandLoader.prototype.addPackage = function (packageName, networkManager, workspace) {
        this.packages.push(PackageIndex_1.packageIndex[packageName]);
        this.load(this.packages.length - 1, networkManager, workspace);
    };
    CommandLoader.prototype.removePackage = function (packageName, networkManager, workspace) {
        var commandPackage = PackageIndex_1.packageIndex[packageName];
        for (var i = 0; i < this.packages.length; i++) {
            if (this.packages[i] == commandPackage) {
                var commandList = commandPackage.generateCommands(networkManager, workspace);
                for (var name in commandList) {
                    if (commandList.hasOwnProperty(name)) {
                        delete this.commands[name];
                    }
                }
                this.packages.splice(i, 1);
                break;
            }
        }
    };
    CommandLoader.prototype.getCommand = function (message) {
        var messagePieces = message.split(" ");
        if (!this.commands.hasOwnProperty(messagePieces[0])) {
            return null;
        }
        return this.commands[messagePieces[0]];
    };
    CommandLoader.prototype.load = function (index, networkManager, workspace) {
        var commandPackage = this.packages[index];
        var newCommands = commandPackage.generateCommands(networkManager, workspace);
        for (var commandName in newCommands) {
            if (this.commands.hasOwnProperty(commandName)) {
                throw Error("Conflicting command '" + commandName + "'");
            }
            this.commands[commandName] = newCommands[commandName];
        }
    };
    return CommandLoader;
}());
exports.CommandLoader = CommandLoader;
