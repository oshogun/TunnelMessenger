
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require("body-parser");
var allowedFolders = ["public","css", "js", "lib"];
var port = 3000;

var users = {};
var nicks = [];
var connectedUsers = 0;

var zoeira = false;

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

for (var i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function(request, response) {
        response.sendFile(__dirname + request.url);
    });
}

var UserManager = require("./rest").UserManager;
var userManager = new UserManager(app);
users[0] = "SERVER";
var io = require('socket.io')(http);

io.on("connection", function(socket) {
    connectedUsers++;

    users[socket.id] = "anon" + (nicks.length + 1);
    nicks.push(users[socket.id]);
    io.emit("nick changed", nicks);
    for(var i = 0; i < nicks.length; i++) {
        console.log(nicks[i] +  " ");
    }

    console.log('A user has connected. Users online: ' + connectedUsers);

    function sanitizeInput(content) {
    	if(!zoeira) {
        	return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    	} else {
    		return content;
    	}
    }

    function sendToSender(type/*, ...arguments */) {
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        socket.emit.apply(socket, [type, users[socket.id]].concat(otherArgs));
    }

    function sendToOthers(type/*, ...arguments */) {
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        socket.broadcast.emit.apply(socket.broadcast, [type, users[socket.id]].concat(otherArgs));
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
        if (nick != null && nick != "") {
            // update the list of nicks
            for (var i in nicks) {
                if(nicks[i] == users[socket.id]) {
                    nicks[i] = nick;
                }
            }
            // update the actual user's nick
            users[socket.id] = sanitizeInput(nick);
            // inform other clients
            io.emit("nick changed", nicks);
        }
    }

    var commands = {
        "/github": {
            "broadcast": true,
            "description": "Displays the URL of this project's github page",
            "result": "TEXT: https://github.com/oshogun/TunnelMessenger",
        },
        "/settings": {
            "broadcast": false,
            "description": "Displays a settings menu",
            "result": "MENU: settings"
        },
        "/whoami": {
            "broadcast": true,
            "description": "Shows your nickname",
            "result": function() {
                return "TEXT: " + users[socket.id]
            }
        },
        "/zoeira_enable": {
            "description": "Enables the zoeira mode",
        	"result": function() {
        		zoeira = true;
        		return "TEXT: zoeira mode ENGAGED";
        	}
        },
        "/zoeira_disable": {
            "description": "Disables the zoeira mode",
        	"result": function() {
        		zoeira = false;
        		return "TEXT: zoeira mode aborted";
        	}
        },
        "/nick": {
            "broadcast": false,
            "description": "Changes the nickname of the user",
            "parameters": 1,
            "result": changeNickCallback
        },
        "/help": {
            "broadcast": false,
            "description": "Lists all available commands",
            "result": function() {
                var output = "TEXT: Available commands:<ul>";
                for (var name in commands) {
                    if (commands.hasOwnProperty(name)) {
                        var command = commands[name];
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
        "/smash": {
       		"result": "TEXT: <img src=\"https://i.ytimg.com/vi/U1tdKEd-l6Q/maxresdefault.jpg\">",
      		"description":"Lets the user smash"
        }
    };

    socket.on("chatMessage", function(message) {
        var messagePieces = message.split(" ");
        var isValidCommand = commands.hasOwnProperty(messagePieces[0]);
        var command = commands[messagePieces[0]];
        var broadcast = isValidCommand ? command.broadcast : true;

        var outputMessage = "TEXT: " + sanitizeInput(message);
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

            var result = command.result;
            var output;
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
        connectedUsers--; // decrement the connected users variable
        // remove the user from the nicknames list
        for(var i in nicks) {
            if(nicks[i] == users[socket.id]) {
                nicks.splice(i,1);
            }
        }
        console.log("A user has disconnected. Users online: " + connectedUsers);
        // update the nicks list on all clients
        io.emit("nick changed", nicks);
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

// listen to connections on port 3000
http.listen(3000, function(){
    console.log("listening on *:3000");
});
