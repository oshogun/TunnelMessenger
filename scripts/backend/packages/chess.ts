import {Command, CommandGroup, CommandPackage, Workspace} from "../Commands"
import {MessageTarget} from "../MessageTarget"
import {NetworkManager} from "../NetworkManager"

export let chess: CommandPackage = {
    generateCommands: function(networkManager: NetworkManager, workspace: Workspace) {
        let commands: CommandGroup = {
            "/chega-de-chess": {
                "broadcast": true,
                "description": "Flies away from a chess match",
                "result": function() {
                    workspace["removePackage"]("chess");
                    return "TEXT: You have flied away from the match.";
                },
                "secret": true
            },
            "/move": {
                "broadcast": true,
                "description": "Makes a move",
                "result": function() {
                    return "TEXT: Your move has been executed.";
                },
                "secret": true
            },
        };

        return commands;
    }
}
