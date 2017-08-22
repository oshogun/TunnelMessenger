declare function require(name: string): any;
declare var __dirname: string;
declare var process;
declare var define;

let requirejs = require("requirejs");

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
});

let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let path = require('path');
let bodyParser = require("body-parser");
let allowedFolders = ["public","css", "js", "lib"];
let port = 3000;

let users = {};
let nicks = [];
let connectedUsers = 0;

let zoeira = false;

if (process.argv.length > 2 && process.argv[2] == 1) {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get("/TunnelMessenger", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

app.post("/login", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

app.get("/register", function(request,response){
    response.sendFile(__dirname + "/public/register.html");
});

for (let i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function(request, response) {
        response.sendFile(__dirname + request.url);
    });
}

let UserManager = require("./rest").UserManager;
let userManager = new UserManager(app);
users[0] = "SERVER";

io.on("connection", function(socket) {
    connectedUsers++;

    users[socket.id] = "anon" + (nicks.length + 1);
    nicks.push([socket.id, users[socket.id]]);
    broadcast("changeNick", nicks);

    console.log("A user has connected. Users online: " + connectedUsers);

    function sanitizeInput(content) {
        if(!zoeira) {
            return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else {
            return content;
        }
    }

    function sendToSender(type, ...otherArgs: any[]) {
        socket.emit.apply(socket, [type, users[socket.id]].concat(otherArgs));
    }

    function sendToOthers(type, ...otherArgs: any[]) {
        socket.broadcast.emit.apply(socket.broadcast, [type, users[socket.id]].concat(otherArgs));
    }

    function broadcast(type, ...otherArgs: any[]) {
        io.emit.apply(io, [type, users[socket.id]].concat(otherArgs));
    }

    function serverBroadcast(message) {
        io.emit("chatMessage", users[0], message);
    }

    function commandType(command) {
        return command.substr(0, command.indexOf(":"));
    }

    function commandContent(command) {
        return command.substr(command.indexOf(":") + 2);
    }

    function changeNickCallback(nick) {
        nick = sanitizeInput(nick);

        if (nick != null && nick != "") {
            // update the list of nicks
            for (let i = 0; i < nicks.length; i++) {
                if (nicks[i][0] == socket.id) {
                    nicks[i][1] = nick;
                }
            }

            // update the actual user's nick
            users[socket.id] = nick;

            // inform other clients
            broadcast("changeNick", nicks);
        }
    }

    let commands = {
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
            }
        },
        "/github": {
            "broadcast": true,
            "description": "Displays the URL of this project's github page",
            "result": "TEXT: https://github.com/oshogun/TunnelMessenger",
        },
        "/nick": {
            "broadcast": false,
            "description": "Changes the nickname of the user",
            "parameters": 1,
            "result": changeNickCallback
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
        "/whoami": {
            "broadcast": true,
            "description": "Shows your nickname",
            "result": function() {
                return "TEXT: " + users[socket.id]
            }
        },
        "/zoeira_disable": {
            "description": "Disables the zoeira mode",
            "result": function() {
                zoeira = false;
                return "TEXT: zoeira mode aborted";
            }
        },
        "/zoeira_enable": {
            "description": "Enables the zoeira mode",
            "result": function() {
                zoeira = true;
                return "TEXT: zoeira mode ENGAGED";
            }
        },
    };

    socket.on("chatMessage", function(message) {
        let messagePieces = message.split(" ");
        let isValidCommand = commands.hasOwnProperty(messagePieces[0]);
        let command = commands[messagePieces[0]];
        let broadcast = isValidCommand ? command.broadcast : true;

        let outputMessage = "TEXT: " + sanitizeInput(message);
        sendToSender("sendMessage", outputMessage);

        if (broadcast) {
            sendToOthers("chatMessage", outputMessage);
        }

        if (isValidCommand) {
            if (command.hasOwnProperty("parameters")) {
                if (command.parameters != messagePieces.length - 1) {
                    serverBroadcast("TEXT: expected " + command.parameters + " parameters");
                    return;
                }
            }

            let result = command.result;
            let output;
            if (result instanceof Function) {
                output = result.apply(null, messagePieces.slice(1));
            } else {
                output = result;
            }

            if (typeof output != "undefined") {
                if (commandType(output) == "MENU") {
                    socket.emit("menu", commandContent(output));
                } else {
                    serverBroadcast(output);
                }
            }
        }
    });

    // update user nicknames on change of nick
    socket.on("changeNick", changeNickCallback);

    socket.on("disconnect", function(){
        connectedUsers--; // decrement the connected users letiable
        // remove the user from the nicknames list
        for (let i = 0; i < nicks.length; i++) {
            if (nicks[i][0] == socket.id) {
                nicks.splice(i, 1);
            }
        }

        console.log("A user has disconnected. Users online: " + connectedUsers);

        // update the nicks list on all clients
        broadcast("changeNick", nicks);
    });

    // inform other clients that someone is typing
    socket.on("isTyping", function() {
        sendToOthers("isTyping");
    });

    // inform other clients that someone stopped typing
    socket.on("stoppedTyping",function() {
        sendToOthers("stoppedTyping");
    });
});

http.listen(port, function(){
    console.log("Listening on port " + port);
});
