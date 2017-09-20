/// <reference path="../defs/node.d.ts" />

import {Command, CommandLoader, CommandPackage, Workspace} from "./Commands"
import {Game} from "./Game"
import {GameRoom, PlayerJoinStatus} from "./GameRoom"
import {InviteSystem} from "./InviteSystem"
import {MTGHandler} from "./Magic";
import {MessageTarget} from "./MessageTarget"
import {NetworkManager} from "./NetworkManager"
import {UserManager} from "./UserManager"
import {UserPersistence} from "./UserPersistence"
import {User, UserType} from "../shared/User"
import {SocketId} from "./Settings"

// removes "js/backend" from the end
let root = __dirname.split("/").slice(0, -2).join("/");

let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let path = require('path');
let bodyParser = require("body-parser");
let urlencodedparser = bodyParser.urlencoded({extended: false});
let allowedFolders = ["css", "games", "js", "lib", "public", "user_images"];
let port = process.env.PORT || 3000;
let markdown = require("markdown").markdown;
let mtgHandler = new MTGHandler();

// app.use(bodyParser.urlencoded({
//     extended: true
// }));

app.use(bodyParser.json());


app.get("/TunnelMessenger", function(request, response) {
    response.sendFile(root + "/public/index.html");
});

app.post("/register", urlencodedparser, function(request, response) {
    console.log("kk eae men, sente só esse formulario de registro:");
    console.log(request.body);
    let username = request.body.username;
    let password = request.body.password;
    let password_verify = request.body.confirm_password;
    let email = request.body.email;
    let full_name = request.body.full_name;
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
        console.log("Ih rapaz, meio trap esse email aí");
    } else {
        console.log("Bom email parça");
    }

    if (password != password_verify) {
        console.log("passwords don't match");
    } else {
        let newUser = new User(UserType.NORMAL, username,full_name,email,password);

        UserPersistence.register(newUser).then(function(success) {
            if (success) {
                console.log("passwords match");
                response.sendFile(root + "/public/index.html");
            } else {
                console.log("Username already in use");
                response.sendFile(root + "/public/register.html");
            }
        }, function(error) {
            throw error;
        });
    }
});
app.post("/login", urlencodedparser, function(request, response) {
    if (request.body.done == "login") {
        let username = request.body.username;
        let password = request.body.password;
        UserPersistence.verify(username, password).then(function(found) {
            if (found) {
                console.log("login success");
                response.sendFile(root + "/public/index.html");
            } else {
                console.log("login FAILED");
                response.sendFile(root + "/public/login_failed.html");
            }
        }, function(error) {
            throw error;
        });

    } else {
        response.sendFile(root + "/public/register.html");
    }
});



app.get("/", function(request,response){
    response.sendFile(root + "/public/login.html");
});

app.get("/frontend/main.js", function(request,response){
    response.sendFile(root + "/js/frontend/main.js");
});

for (let i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function(request, response) {
        response.sendFile(root + request.url);
    });
}

// let UserManager = require("./rest").UserManager;
// let userManager = new UserManager(app);

type Map<T> = {[keys: string]: T};

function extend<T>(obj: Map<T>, props: Map<T>): Map<T> {
    for (var i in props) {
        if (props.hasOwnProperty(i)) {
            obj[i] = props[i];
        }
    }

    return obj;
}

function sanitizeInput(content: string): string {
    if (!zoeira) {
        return markdown.toHTML(content).replace(/^(?:<p>)?(.*?)(?:<\/p>)?$/, "$1");
    } else {
        return content;
    }
}

function commandType(command) {
    return command.substr(0, command.indexOf(":"));
}

function commandContent(command) {
    return command.substr(command.indexOf(":") + 2);
}

function uid(): string {
    let id = Math.round(Math.random() * 1e10).toString();
    return (+new Date()) + "_" + id;
}

function ucfirst(value: string): string {
    return value[0].toUpperCase() + value.substr(1);
}

let /*the*/ carnage /*begin*/ = 1200;
let /*the*/zoeira /*begin*/ = false;

if (process.argv.length > 2 && process.argv[2] == "1") {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}

let userManager = new UserManager();
userManager.addUser("0", "SERVER");

let inviteSystem = new InviteSystem();

/**
 * Maps an ID to a Game. This ID is used to allow
 * players to join the game (the same applies to spectators).
 */
let activeGames: {[id: string]: Game} = {};

/**
 * Maps a player to a game ID. This is important not to
 * allow users to have more than one game at their screen
 * at a time.
 */
let gameIdTable: {[socketId: string]: string} = {};

/**
 * Maps an ID to a GameRoom. This ID is used to allow
 * players to join it.
 */
let gameRoomTable: {[id: string]: GameRoom} = {};

let connectedUsers = 0;
let userCounter = 0;

io.on("connection", function(socket) {
    connectedUsers++;

    let networkManager = new NetworkManager(io, socket, userManager);

    let workspace: Workspace = {
        "userManager": function() { return userManager; },
        "changeNickCallback": changeNickCallback,
        "zoeiraEnable": function() { zoeira = true; },
        "zoeiraDisable": function() { zoeira = false; },
        "findMtgCardImage": findMtgCardImage,
        "findMtgLegalInfo": findMtgLegalInfo,
        "senderName": function() { return networkManager.user(); },
        "getUserName": function(socketId) { return userManager.getName(socketId); },
        "gameInvite": gameInvite,
        "serverToSender": function(message) { networkManager.serverToSender(message); },
        "serverToUser": serverToUser,
        "registerGame": registerGame,
        "closeGames": closeGames,
        "activeGames": function() { return activeGames; },
        "listGames": listGames,
        "spectate": spectate,
        "host": host,
        "listRooms": listRooms,
        "join": join,
        "leaveRoom": leaveRoom,
        "getGameRoom": getGameRoom,
    };

    let commandLoader = new CommandLoader();
    commandLoader.addPackage("std", networkManager, workspace);
    commandLoader.addPackage("game_std", networkManager, workspace);

    extend(workspace, {
        "addPackage": function(packageName: string) {
            commandLoader.addPackage(packageName, networkManager, workspace);
        },
        "removePackage": function(packageName: string) {
            commandLoader.removePackage(packageName, networkManager, workspace);
        },
        "isPackageLoaded": function(packageName: string): boolean {
            return commandLoader.isPackageLoaded(packageName);
        }
    });

    function changeNickCallback(newName: string) {
        newName = sanitizeInput(newName);
        if (newName != null && newName != "") {
            networkManager.renameUser(newName);
        }
    }

    function findMtgCardImage(argument: string) {
        let image_uri: string;
        mtgHandler.getCard(argument, function(res) {
             let imageTag:string;
             if (res.image_uri != null) {
                imageTag = "IMAGE: " + res.image_uri;
             } else {
                imageTag = "IMAGE: " + "https://media.giphy.com/media/WCwFvyeb6WJna/giphy.gif";
             }
             networkManager.serverBroadcast(imageTag);            
        });
    }
    
    function findMtgLegalInfo(argument: string) {
        mtgHandler.getCard(argument, function(res){ 
            networkManager.serverBroadcast("TEXT: " + res.name + "'s legalities:" + "<br>Standard: " + res.legalities.standard + "<br>Modern: " + res.legalities.modern 
                + "<br>Commander: " + res.legalities.commander + "<br>Legacy: "+res.legalities.legacy + "<br>Vintage: " +res.legalities.vintage
                + "<br>Pauper: " + res.legalities.pauper + "<br>Frontier " + res.legalities.frontier + "<br>Penny Dreadful: " + res.legalities.penny
                + "<br>Duel: " + res.legalities.duel);
        });
    }

    function gameInvite(targetUser: string, message: string,
        onAccept: () => void, onReject: () => void): boolean {

        let senderSocket = userManager.getSocketId(networkManager.user())!;
        let receiverSocket = userManager.getSocketId(targetUser)!;

        if (senderSocket != receiverSocket) {
            let id = uid();
            inviteSystem.register(id, senderSocket, receiverSocket, onAccept, onReject);
            networkManager.serverToUser(targetUser, "INVITE: " + message, id);
            return true;
        }

        return false;
    }

    function serverToUser(targetUser: string, message: string) {
        networkManager.serverToUser(targetUser, message);
    }

    function registerGame(id: string, game: Game) {
        activeGames[id] = game;

        let playerSockets = game.getPlayerSockets();
        for (let socket of playerSockets) {
            gameIdTable[socket] = id;
        }
    }

    function closeGames(): boolean {
        let id = networkManager.id();

        if (gameIdTable.hasOwnProperty(id)) {
            let gameId = gameIdTable[id];
            let game = activeGames[gameId];

            let playerSockets = game.getPlayerSockets();
            let playerIsParticipating: boolean = false;

            for (let playerSocket of playerSockets) {
                if (playerSocket == id) {
                    playerIsParticipating = true;
                    game.abort();
                    delete activeGames[gameId];
                    break;
                }
            }

            if (!playerIsParticipating) {
                game.removeSpectator(id);
            }

            delete gameIdTable[id];
            return true;
        }

        return false;
    }

    function listGames(): string {
        let empty: boolean = true;
        let result: string = "<ul>";

        for (let id in activeGames) {
            if (activeGames.hasOwnProperty(id)) {
                empty = false;
                let game = activeGames[id];

                let sockets = game.getPlayerSockets();
                let playerNames: string[] = [];
                for (let socket of sockets) {
                    playerNames.push(userManager.getName(socket));
                }

                result += "<li>";
                result += "(" + id + ") " + ucfirst(game.getName()) + ": ";
                result += playerNames.join(" vs ");
                result += "</li>";
            }
        }

        if (empty) {
            return "There are no games in progress.";
        }

        result += "</ul>";
        return result;
    }

    function spectate(gameId: string): boolean {
        if (!activeGames.hasOwnProperty(gameId)) {
            return false;
        }

        let id = networkManager.id();

        let game = activeGames[gameId];
        game.addSpectator(id);
        gameIdTable[id] = gameId;
        return true;
    }

    function host(gameName: string, password?: string): boolean {
        let id = uid();
        let roomLeader = networkManager.id();
        let room = new GameRoom(networkManager, id, roomLeader, gameName, password);
        gameRoomTable[id] = room;
        return true;
    }

    function listRooms(): string {
        let empty: boolean = true;
        let result: string = "<ul>";

        for (let id in gameRoomTable) {
            if (gameRoomTable.hasOwnProperty(id)) {
                empty = false;
                let room = gameRoomTable[id];

                let sockets = room.getPlayerSockets();
                let playerNames: string[] = [];
                for (let socket of sockets) {
                    playerNames.push(userManager.getName(socket));
                }

                result += "<li>";
                result += "(" + id + ") " + ucfirst(room.getGameName()) + ": ";
                result += playerNames.join(", ");

                if (room.hasPassword()) {
                    result += " [password protected]";
                }

                result += "</li>";
            }
        }

        if (empty) {
            return "There are no open game rooms.";
        }

        result += "</ul>";
        return result;
    }

    function join(gameId: string, password?: string): PlayerJoinStatus {
        if (!gameRoomTable.hasOwnProperty(gameId)) {
            return PlayerJoinStatus.NON_EXISTING_GAME_ROOM;
        }

        let id = networkManager.id();

        let room = gameRoomTable[gameId];
        // gameIdTable[id] = gameId;
        return room.addPlayer(id, password);
    }

    function leaveRoom(): boolean {
        let room = getGameRoom();
        if (room === null) {
            return false;
        }

        let id = networkManager.id();

        let isRoomLeader = room.isRoomLeader(id);
        room.removePlayer(id);

        if (isRoomLeader) {
            delete gameRoomTable[room.getId()];
        }

        return true;
    }

    function getGameRoom(): GameRoom|null {
        let id = networkManager.id();

        for (let gameId in gameRoomTable) {
            if (gameRoomTable.hasOwnProperty(gameId)) {
                let room = gameRoomTable[gameId];

                let sockets = room.getPlayerSockets();
                for (let socket of sockets) {
                    if (socket == id) {
                        return room;
                    }
                }
            }
        }

        return null;
    }

    userCounter++;
    networkManager.login("anon" + userCounter);

    console.log("A user has connected. Users online: " + connectedUsers);
  
    socket.on("chatMessage", function(message) {
        let messagePieces = message.split(" ");
        let command = commandLoader.getCommand(message)!;
        let isValidCommand = (command !== null);
        let broadcast = isValidCommand ? command.broadcast : true;

        let outputMessage = "TEXT: " + sanitizeInput(message);
        networkManager.send(MessageTarget.SENDER, "sendMessage", outputMessage);

        if (!isValidCommand && message[0] == "/") {
            networkManager.serverToSender("TEXT: Error: invalid command '" + messagePieces[0] + "'");
            return;
        }

        if (broadcast) {
            networkManager.send(MessageTarget.OTHERS, "chatMessage", outputMessage);
        }

        if (isValidCommand) {
            let parameters = commandLoader.parseParameters(message);
            if (command.hasOwnProperty("parameters")) {
                let expectedParamCount = command.parameters!;
                let actualParamCount = parameters.length;

                let allowedParamCount: boolean;
                let expectedStr: string;

                if (typeof expectedParamCount == "number") {
                    allowedParamCount = (expectedParamCount == actualParamCount);
                    expectedStr = expectedParamCount.toString();
                } else {
                    allowedParamCount = (actualParamCount >= expectedParamCount[0])
                                     && (actualParamCount <= expectedParamCount[1]);
                    expectedStr = expectedParamCount.join("-");
                }

                if (!allowedParamCount) {
                    networkManager.serverBroadcast("TEXT: expected " + expectedStr + " parameters");
                    return;
                }
            }

            let result = command.result;
            let output;
            if (result instanceof Function) {
                output = result.apply(null, parameters);
            } else {
                output = result;
            }

            if (typeof output != "undefined") {
                if (commandType(output) == "MENU") {
                    socket.emit("menu", commandContent(output));
                } else {
                    if (command.secret) {
                        networkManager.serverToSender(output);
                    } else {
                        networkManager.serverBroadcast(output);
                    }
                }
            }
        }
    });

    socket.on("chatImage", function(imageTag: string) {
        let srcMatches = imageTag.match(/src="([^"]+)"/);
        let url: string;
        if (srcMatches) {
            url = srcMatches[1];
        } else {
            let base64 = imageTag.substr(imageTag.indexOf(",") + 1);
            url = "/user_images/" + uid();

            let fs = require("fs");
            try {
                fs.writeFileSync(root + url, base64, "base64");
            } catch (e) {
                console.log("[ERROR] Failed to upload image");
            }
        }

        let output = "IMAGE: " + url;
        networkManager.send(MessageTarget.SENDER, "sendMessage", output);
        networkManager.send(MessageTarget.OTHERS, "chatMessage", output);
    });

    socket.on("changeNick", changeNickCallback);

    socket.on("disconnect", function(){
        networkManager.logout();

        connectedUsers--;
        console.log("A user has disconnected. Users online: " + connectedUsers);
    });

    // informs other clients that someone is typing
    socket.on("isTyping", function() {
        networkManager.send(MessageTarget.OTHERS, "isTyping");
    });

    // informs other clients that someone stopped typing
    socket.on("stoppedTyping", function() {
        networkManager.send(MessageTarget.OTHERS, "stoppedTyping");
    });

    socket.on("acceptInvite", function(id: string) {
        inviteSystem.accept(id);
    });

    socket.on("rejectInvite", function(id: string) {
        inviteSystem.reject(id);
    });

    socket.on("gameData", function(id: string, senderIndex: number, data: any) {
        activeGames[id].receiveData(senderIndex, data);
    });
});


http.listen(port, function(){
    console.log("Listening on port " + port);
});
