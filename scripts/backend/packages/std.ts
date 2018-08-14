import {Command, CommandGroup, CommandPackage, Workspace} from "../Commands"
import {Game} from "../Game"
import {MessageTarget} from "../MessageTarget"
import {NetworkManager} from "../NetworkManager"
import {SocketId} from "../Settings"
import {utils} from "../../shared/Utils"

export let std: CommandPackage = {
    generateCommands: function(networkManager: NetworkManager, workspace: Workspace) {
        let commands: CommandGroup = {
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

                    let availableCommands = <CommandGroup> workspace["getAllCommands"]();
                    utils.sortedForeach(availableCommands, function(name, command) {
                            output += "<li>" + name;

                            if (command.parameters) {
                                let commandStr: string;
                                let plural: boolean;
                                if (typeof command.parameters == "number") {
                                    commandStr = command.parameters.toString();
                                    plural = (command.parameters > 1);
                                } else {
                                    commandStr = command.parameters.join("-");
                                    plural = true;
                                }

                                output += " (" + commandStr + " ";
                                output += (plural) ? "parameters" : "parameter";
                                output += ")";
                            }

                            if (command.description) {
                                output += ": " + command.description;
                            }

                            output += "</li>";
                    });

                    output += "</ul>";
                    return output;
                },
                "secret": true
            },
            "/github": {
                "broadcast": true,
                "description": "Displays the URL of this project's github page",
                "result": "TEXT: https://github.com/oshogun/TunnelMessenger",
                "secret": true
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
                "broadcast": true,
                "description": "Displays a given MTG card",
                "parameters": 1,
                "result": workspace["findMtgCardImage"],
                "secret": false
            },
            "/mtgLegalities": {
                "broadcast": true,
                "description": "Displays the legalities of a given MTG card",
                "parameters": 1,
                "result": workspace["findMtgLegalInfo"],
                "secret": false
            },
            "/nick": {
                "broadcast": false,
                "description": "Changes the nickname of the user",
                "parameters": 1,
                "result": workspace["changeNickCallback"],
                "secret": true
            },
            "/settings": {
                "broadcast": false,
                "description": "Displays a settings menu",
                "result": "MENU: settings",
                "secret": true
            },
            "/smash": {
                "broadcast": false,
                "result": "IMAGE: https://i.ytimg.com/vi/U1tdKEd-l6Q/maxresdefault.jpg",
                "description": "Lets the user smash",
                "secret": false
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
                },
                "secret": false
            },
            "/whoami": {
                "broadcast": true,
                "description": "Shows your nickname",
                "result": function() {
                    return "TEXT: " + networkManager.user()
                },
                "secret": true
            },
            "/zoeira_disable": {
                "broadcast": false,
                "description": "Disables the zoeira mode",
                "result": function() {
                    workspace["zoeiraDisable"]();
                    return "TEXT: zoeira mode aborted";
                },
                "secret": false
            },
            "/zoeira_enable": {
                "broadcast": false,
                "description": "Enables the zoeira mode",
                "result": function() {
                    workspace["zoeiraEnable"]();
                    return "TEXT: zoeira mode ENGAGED";
                },
                "secret": false
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
                },
                "secret": false
            },
        };

        return commands;
    }
}
