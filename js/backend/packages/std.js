"use strict";
exports.__esModule = true;
var MessageTarget_1 = require("../MessageTarget");
exports.std = {
    generateCommands: function (networkManager, workspace) {
        var commands = {
            "/chess": {
                "broadcast": true,
                "description": "Stats a game of chess",
                "parameters": 1,
                "result": function (targetUser) {
                    workspace["addPackage"]("chess");
                    return "TEXT: The game shall begin!";
                }
            },
            "/clear": {
                "broadcast": false,
                "description": "Clears the message box",
                "result": function () {
                    networkManager.send(MessageTarget_1.MessageTarget.SENDER, "clearChatbox");
                    return "TEXT: The chatbox has been cleared.";
                },
                "secret": true
            },
            "/help": {
                "broadcast": false,
                "description": "Lists all available commands",
                "result": function () {
                    var output = "TEXT: Available commands:<ul>";
                    for (var name_1 in commands) {
                        if (commands.hasOwnProperty(name_1)) {
                            var command = commands[name_1];
                            output += "<li>" + name_1;
                            if (command.parameters) {
                                output += " (" + command.parameters + " parameter(s))";
                            }
                            if (command.description) {
                                output += ": " + command.description;
                            }
                            output += "</li>";
                        }
                    }
                    output += "</ul>";
                    return output;
                },
                "secret": true
            },
            "/github": {
                "broadcast": true,
                "description": "Displays the URL of this project's github page",
                "result": "TEXT: https://github.com/oshogun/TunnelMessenger"
            },
            "/mute": {
                "broadcast": false,
                "description": "Mutes the notification sound",
                "result": function () {
                    networkManager.send(MessageTarget_1.MessageTarget.SENDER, "mute");
                    return "TEXT: The notification sounds have been muted.";
                },
                "secret": true
            },
            "/nick": {
                "broadcast": false,
                "description": "Changes the nickname of the user",
                "parameters": 1,
                "result": workspace["changeNickCallback"]
            },
            "/settings": {
                "broadcast": false,
                "description": "Displays a settings menu",
                "result": "MENU: settings"
            },
            "/smash": {
                "broadcast": false,
                "result": "TEXT: <img src=\"https://i.ytimg.com/vi/U1tdKEd-l6Q/maxresdefault.jpg\">",
                "description": "Lets the user smash"
            },
            "/unmute": {
                "broadcast": false,
                "description": "Unmutes the notification sound",
                "result": function () {
                    networkManager.send(MessageTarget_1.MessageTarget.SENDER, "unmute");
                    return "TEXT: The notification sounds have been unmuted.";
                },
                "secret": true
            },
            "/whoami": {
                "broadcast": true,
                "description": "Shows your nickname",
                "result": function () {
                    return "TEXT: " + networkManager.user();
                }
            },
            "/zoeira_disable": {
                "broadcast": false,
                "description": "Disables the zoeira mode",
                "result": function () {
                    workspace["zoeiraDisable"]();
                    return "TEXT: zoeira mode aborted";
                }
            },
            "/zoeira_enable": {
                "broadcast": false,
                "description": "Enables the zoeira mode",
                "result": function () {
                    workspace["zoeiraEnable"]();
                    return "TEXT: zoeira mode ENGAGED";
                }
            },
            "/roll": {
                "broadcast": true,
                "description": "rolls n dice of m sides",
                "parameters": 2,
                "result": function (n_dice, m_sides) {
                    if (m_sides > 10000 || n_dice > 100) {
                        return "TEXT: Can you not";
                    }
                    var min = 1;
                    var max = Math.floor(m_sides);
                    var result = 0;
                    for (var i = 0; i < n_dice; i++) {
                        result += Math.floor(Math.random() * (max - min)) + min;
                    }
                    return "TEXT: Roll " + n_dice + "d" + m_sides + ": " + result;
                }
            }
        };
        return commands;
    }
};
