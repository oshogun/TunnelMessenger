import {NetworkManager} from "./NetworkManager"

export let generateCommands = function(networkManager: NetworkManager,
    workspace: {[functionName: string]: Function}) {

    let commands = {
        "/clear": {
            "broadcast": false,
            "description": "Clears the message box",
            "result": function() {
                networkManager.sendToSender("clearChatbox");
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
                networkManager.sendToSender("mute");
                return "TEXT: The notification sounds have been muted.";
            },
            "secret": true
        },
        "/nick": {
            "broadcast": false,
            "description": "Changes the nickname of the user",
            "parameters": 1,
            "result": workspace.changeNickCallback
        },
        "/settings": {
            "broadcast": false,
            "description": "Displays a settings menu",
            "result": "MENU: settings"
        },
        "/smash": {
            "result": "TEXT: <img src=\"https://i.ytimg.com/vi/U1tdKEd-l6Q/maxresdefault.jpg\">",
            "description":"Lets the user smash"
        },
        "/unmute": {
            "broadcast": false,
            "description": "Unmutes the notification sound",
            "result": function() {
                networkManager.sendToSender("unmute");
                return "TEXT: The notification sounds have been unmuted.";
            },
            "secret": true
        },
        "/whoami": {
            "broadcast": true,
            "description": "Shows your nickname",
            "result": function() {
                return "TEXT: " + networkManager.user()
            }
        },
        "/zoeira_disable": {
            "description": "Disables the zoeira mode",
            "result": function() {
                workspace.zoeiraDisable();
                return "TEXT: zoeira mode aborted";
            }
        },
        "/zoeira_enable": {
            "description": "Enables the zoeira mode",
            "result": function() {
                workspace.zoeiraEnable();
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
