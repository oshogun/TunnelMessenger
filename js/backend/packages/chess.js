"use strict";
exports.__esModule = true;
exports.chess = {
    generateCommands: function (networkManager, workspace) {
        var commands = {
            "/chega-de-chess": {
                "broadcast": true,
                "description": "Flies away from a chess match",
                "result": function () {
                    workspace["removePackage"]("chess");
                    return "TEXT: You have flied away from the match.";
                }
            },
            "/move": {
                "broadcast": true,
                "description": "Makes a move",
                "result": function () {
                    return "TEXT: Your move has been executed.";
                }
            }
        };
        return commands;
    }
};
