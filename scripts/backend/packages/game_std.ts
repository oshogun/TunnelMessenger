import {Command, CommandGroup, CommandPackage, Workspace} from "../Commands"
import {Game} from "../Game"
import {GameRoom, PlayerJoinStatus} from "../GameRoom"
import {gameInfoTable} from "../GameInfo"
import {MessageTarget} from "../MessageTarget"
import {NetworkManager} from "../NetworkManager"
import {SocketId} from "../Settings"
import {UserManager} from "../UserManager"
import {utils} from "../../shared/Utils"

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
                "result": function(targetUser: string) {
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

                        let game = new Game(networkManager, id, [from, to], "chess");
                        if (!game.canLaunch()) {
                            // Shouldn't happen in practice, but just to be safe
                            workspace["serverToSender"]("TEXT: Failed to launch game.");
                            return;
                        }

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
            "/gameinfo": {
                "broadcast": false,
                "description": "Shows information about a game",
                "parameters": 1,
                "result": function(gameName: string) {
                    if (!gameInfoTable.hasOwnProperty(gameName)) {
                        return "TEXT: Invalid game name";
                    }

                    function range(min: number, max: number): string {
                        if (min == max) {
                            return min.toString();
                        }

                        return min + "~" + max;
                    }

                    let info = gameInfoTable[gameName];
                    let result: string = "";
                    let [width, height] = info.dimensions;
                    let allowedPlayers = range(info.minPlayers, info.maxPlayers);
                    result += "Frame size: " + width + "x" + height + "<br>";
                    result += "Allowed players: " + allowedPlayers + "<br>";

                    return "TEXT: " + result;
                },
                "secret": true
            },
            "/host": {
                "broadcast": false,
                "description": "Creates a game room (game name as parameter and optionally a password)",
                "parameters": [1, 2],
                "result": function(gameName: string, password?: string) {
                    if (!workspace["host"](gameName, password)) {
                        return "TEXT: Cannot host a game while playing or in a game room";
                    }

                    return "TEXT: You are now hosting a game.";
                },
                "secret": true
            },
            "/leaveroom": {
                "broadcast": true,
                "description": "Leaves the current room",
                "result": function() {
                    if (!workspace["leaveRoom"]()) {
                        return "TEXT: You are not in a game room.";
                    }

                    return "TEXT: You left the game room.";
                },
                "secret": true
            },
            "/listgames": {
                "broadcast": false,
                "description": "Lists all games in progress",
                "result": function() {
                    return "TEXT: " + workspace["listGames"]();
                },
                "secret": true
            },
            "/listrooms": {
                "broadcast": false,
                "description": "Lists all game rooms",
                "result": function() {
                    return "TEXT: " + workspace["listRooms"]();
                },
                "secret": true
            },
            "/join": {
                "broadcast": false,
                "description": "Joins a game room (paramaters: game id and maybe a password)",
                "parameters": [1, 2],
                "result": function(gameId: string, password?: string) {
                    let room = <GameRoom|null> workspace["getGameRoom"]();
                    if (room !== null) {
                        return "TEXT: You are already in a game room.";
                    }

                    let joinStatus = <PlayerJoinStatus> workspace["join"](gameId, password);

                    switch (joinStatus) {
                        case PlayerJoinStatus.WRONG_PASSWORD:
                            return "TEXT: Wrong password.";
                        case PlayerJoinStatus.TOO_MANY_PLAYERS:
                            return "TEXT: The room is full.";
                        case PlayerJoinStatus.NON_EXISTING_GAME_ROOM:
                            return "TEXT: Invalid game room ID.";
                        case PlayerJoinStatus.SUCCESS:
                            return "TEXT: You are now in a game room. Type /leaveroom to leave.";
                    }

                    return utils.assertUnreachable(joinStatus);
                },
                "secret": true
            },
            "/roominfo": {
                "broadcast": false,
                "description": "Shows information about the game room you're in",
                "result": function() {
                    let room = <GameRoom|null> workspace["getGameRoom"]();
                    if (room === null) {
                        return "TEXT: You are not in a game room.";
                    }

                    let result: string = "";
                    result += "Room ID: " + room.getId() + "<br>";
                    result += "Game name: " + room.getGameName() + "<br>";
                    result += "Has password: " + room.hasPassword().toString() + "<br>";

                    let userManager = <UserManager> workspace["userManager"]();
                    let sockets = room.getPlayerSockets();
                    let first: boolean = true;
                    let playerNames: string[] = [];
                    for (let socket of sockets) {
                        let playerName = userManager.getName(socket);
                        if (first) {
                            result += "Room leader: " + playerName + "<br>";
                            result += "Other players: ";
                            first = false;
                        } else {
                            playerNames.push(playerName);
                        }
                    }

                    result += playerNames.join(", ") + "<br>";

                    return "TEXT: " + result;
                },
                "secret": true
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
            },
            "/startgame": {
                "broadcast": true,
                "description": "Starts the game in a game room (room leader only)",
                "result": function() {
                    let room = <GameRoom|null> workspace["getGameRoom"]();
                    if (room === null) {
                        return "TEXT: You are not in a game room.";
                    }

                    if (!room.isRoomLeader(networkManager.id())) {
                        return "TEXT: Only the room leader can start the game.";
                    }

                    let game = room.startGame();
                    if (!game.canLaunch()) {
                        return "TEXT: Failed to start the game: insufficient number of players";
                    }

                    // Deletes the game room
                    workspace["leaveRoom"]();

                    game.launch();
                    workspace["registerGame"](room.getId(), game);
                    return "TEXT: The game will start soon.";
                },
                "secret": false
            },
            "/supportedgames": {
                "broadcast": false,
                "description": "Shows a list of all supported games",
                "result": function() {
                    let result: string = "<ul>";

                    for (let name in gameInfoTable) {
                        if (gameInfoTable.hasOwnProperty(name)) {
                            result += "<li>" + name + "</li>";
                        }
                    }

                    result += "</ul>";
                    return "TEXT: " + result;
                },
                "secret": true
            },
        };

        return commands;
    }
}
