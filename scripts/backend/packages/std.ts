import {Command, CommandGroup, CommandPackage, Workspace} from "../Commands"
import {Game} from "../Game"
import {MessageTarget} from "../MessageTarget"
import {NetworkManager} from "../NetworkManager"
import {SocketId} from "../Settings"

export let std: CommandPackage = {
    generateCommands: function(networkManager: NetworkManager, workspace: Workspace) {
        let commands: CommandGroup = {
            "/abortgames": {
                "broadcast": true,
                "description": "Aborts all games in progress",
                "result": function() {
                    if (workspace["closeGames"]()) {
                        return "TEXT: Game aborted.";
                    } else {
                        return "TEXT: There are no games in progress.";
                    }
                },
                "secret": true
            },
            "/chess": {
                "broadcast": true,
                "description": "Invites a given user to play chess",
                "parameters": 1,
                "result": function(targetUser) {
                    // if (workspace["isPackageLoaded"]("chess")) {
                    //     return "TEXT: There's already a game in progress.";
                    // }

                    // workspace["addPackage"]("chess");
                    let senderName = workspace["senderName"]();

                    let onAccept = function(id: string, from: SocketId, to: SocketId) {
                        let message = "TEXT: Your invitation to play Chess against "
                                    + senderName + " has been accepted.<br>"
                                    + "The game will start soon.";
                        workspace["serverToSender"](message);

                        let game = new Game(networkManager, workspace, id, from, to);
                        game.launch("chess");
                        workspace["registerGame"](id, game);
                    };

                    let onReject = function() {
                        let message = "TEXT: Your invitation to play Chess against "
                                    + senderName + " has been declined.";
                        workspace["serverToSender"](message);
                    };

                    let message = "The user " + workspace["senderName"]()
                                + " invited you to play Chess.";

                    if (workspace["gameInvite"](targetUser, message, onAccept, onReject)) {
                        return "TEXT: An invitation has been sent.";
                    } else {
                        return "TEXT: You can't play against yourself.";
                    }
                },
                "secret": true
            },
            "/clear": {
                "broadcast": false,
                "description": "Clears the message box",
                "result": function() {
                    networkManager.send(MessageTarget.SENDER, "clearChatbox");
                    return "TEXT: The chatbox has been cleared.";
                },
                "secret": true
            },
            "/help": {
                "broadcast": false,
                "description": "Lists all available commands",
                "result": function() {
                    let output = "TEXT: Available commands:<ul>";
                    for (let name in commands) {
                        if (commands.hasOwnProperty(name)) {
                            let command = commands[name];
                            output += "<li>" + name;

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
                "result": "TEXT: https://github.com/oshogun/TunnelMessenger",
            },
            "/mute": {
                "broadcast": false,
                "description": "Mutes the notification sound",
                "result": function() {
                    networkManager.send(MessageTarget.SENDER, "mute");
                    return "TEXT: The notification sounds have been muted.";
                },
                "secret": true
            },
            "/mtg": {
                "broadcast":true,
                "description":"Não é uma prova, é um texte",
                "parameters": 1,
                "result": workspace["findMtgCardImage"]
            },
            "/mtgLegalities": {
                "broadcast": true,
                "description": "Displayes the legalities of a given MTG card",
                "parameters": 1,
                "result": workspace["findMtgLegalInfo"]
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
                "result": "IMAGE: https://i.ytimg.com/vi/U1tdKEd-l6Q/maxresdefault.jpg",
                "description":"Lets the user smash"
            },
            "/unmute": {
                "broadcast": false,
                "description": "Unmutes the notification sound",
                "result": function() {
                    networkManager.send(MessageTarget.SENDER, "unmute");
                    return "TEXT: The notification sounds have been unmuted.";
                },
                "secret": true
            },
            "/video": {
                "broadcast": false,
                "description": "Sends an embedded video (youtube video ID as parameter)",
                "parameters": 1,
                "result": function(videoId) {
                    let url = "https://www.youtube.com/embed/" + videoId;
                    let iframe = "<iframe width='560' height='315' src='"
                        + url + "' frameborder='0' allowfullscreen></iframe>";
                    return "TEXT: " + iframe;
                }
            },
            "/whoami": {
                "broadcast": true,
                "description": "Shows your nickname",
                "result": function() {
                    return "TEXT: " + networkManager.user()
                }
            },
            "/zoeira_disable": {
                "broadcast": false,
                "description": "Disables the zoeira mode",
                "result": function() {
                    workspace["zoeiraDisable"]();
                    return "TEXT: zoeira mode aborted";
                }
            },
            "/zoeira_enable": {
                "broadcast": false,
                "description": "Enables the zoeira mode",
                "result": function() {
                    workspace["zoeiraEnable"]();
                    return "TEXT: zoeira mode ENGAGED";
                }
            },
            "/roll": {
                "broadcast": true,
                "description": "rolls n dice of m sides",
                "parameters": 2,
                "result": function(n_dice, m_sides) {
                    if (m_sides > 10000 || n_dice > 100) {
                        return "TEXT: Can you not";
                    }

                    let min = 1;
                    let max = Math.floor(m_sides);

                    let result = 0;
                    for(let i = 0; i < n_dice; i++) {
                        result+= Math.floor(Math.random() * (max - min)) + min;
                    }
                    return "TEXT: Roll " + n_dice + "d" + m_sides+": " + result;
                }
            },
        };

        return commands;
    }
}
