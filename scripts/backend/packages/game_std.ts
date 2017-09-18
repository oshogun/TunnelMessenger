import {Command, CommandGroup, CommandPackage, Workspace} from "../Commands"
import {Game} from "../Game"
import {MessageTarget} from "../MessageTarget"
import {NetworkManager} from "../NetworkManager"
import {SocketId} from "../Settings"

export let game_std: CommandPackage = {
    generateCommands: function(networkManager: NetworkManager, workspace: Workspace) {
        let commands: CommandGroup = {
            "/abortgames": {
                "broadcast": true,
                "description": "Aborts every game in progress or that you're spectating",
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

                    let onAccept = function(id: string, from: SocketId, to: SocketId) {
                        let targetName = workspace["getUserName"](to);
                        let message = "TEXT: Your invitation to play Chess against "
                                    + targetName + " has been accepted.<br>"
                                    + "The game will start soon.";
                        workspace["serverToSender"](message);

                        let game = new Game(networkManager,
                            workspace, id, from, to, "chess");
                        game.launch();
                        workspace["registerGame"](id, game);
                    };

                    let onReject = function(id: string, from: SocketId, to: SocketId) {
                        let targetName = workspace["getUserName"](to);
                        let message = "TEXT: Your invitation to play Chess against "
                                    + targetName + " has been declined.";
                        workspace["serverToSender"](message);
                    };

                    let message = "The user " + workspace["senderName"]()
                                + " invited you to play Chess.";

                    if (!workspace["gameInvite"](targetUser, message, onAccept, onReject)) {
                        return "TEXT: You can't play against yourself.";
                    }

                    return "TEXT: An invitation has been sent.";
                },
                "secret": true
            },
            "/listgames": {
                "broadcast": true,
                "description": "Lists all games in progress",
                "result": function() {
                    return "TEXT: " + workspace["listGames"]();
                },
                "secret": true,
            },
            "/spectate": {
                "broadcast": true,
                "description": "Spectates a game (parameter: game id)",
                "parameters": 1,
                "result": function(gameId: string) {
                    if (!workspace["spectate"](gameId)) {
                        return "TEXT: Invalid game ID";
                    }

                    return "TEXT: You are now spectating a game. It will start soon.";
                },
                "secret": true
            }
        };

        return commands;
    }
}
