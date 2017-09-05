/// <reference path="../defs/node.d.ts" />

// removes "js/backend" from the end
let root = __dirname.split("/").slice(0, -2).join("/");

let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let path = require('path');
let bodyParser = require("body-parser");
let urlencodedparser = bodyParser.urlencoded({extended: false});
let allowedFolders = ["css", "js", "lib", "public", "user_images"];
let port = process.env.PORT || 3000;
let markdown = require("markdown").markdown;
let users = {};
let nicks = [];
let connectedUsers = 0;
let /*the*/ carnage /*begin*/ = 1200;
let /*the*/zoeira /*begin*/ = false;

if (process.argv.length > 2 && process.argv[2] == "1") {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}

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
    let emailRegex = new RegExp(
            /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        );
    if(!emailRegex.test(email)) {
        console.log("Ih rapaz, meio trap esse email aí");
    } else {
        console.log("Bom email parça");
    }
    if (password != password_verify) {
        console.log("passwords don't match");
    } else {
        console.log("passwords match");
    }
    response.sendFile(root + "/public/index.html");
});
app.post("/login", function(request, response) {
    response.sendFile(root + "/public/index.html");
});

app.get("/", function(request,response){
    response.sendFile(root + "/public/register.html");
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
users[0] = "SERVER";

io.on("connection", function(socket) {
    connectedUsers++;

    users[socket.id] = "anon" + (nicks.length + 1);
    nicks.push([socket.id, users[socket.id]]);
    broadcast("changeNick", nicks);

    console.log("A user has connected. Users online: " + connectedUsers);

    function sanitizeInput(content) {
        if(!zoeira) {
            return markdown.toHTML(content).replace(/^(?:<p>)?(.*?)(?:<\/p>)?$/, "$1");    
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

    function serverToSender(message) {
        socket.emit("chatMessage", users[0], message);
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
        "/clear": {
            "broadcast": false,
            "description": "Clears the message box",
            "result": function() {
                sendToSender("clearChatbox");
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
                sendToSender("mute");
                return "TEXT: The notification sounds have been muted.";
            },
            "secret": true
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
        "/unmute": {
            "broadcast": false,
            "description": "Unmutes the notification sound",
            "result": function() {
                sendToSender("unmute");
                return "TEXT: The notification sounds have been unmuted.";
            },
            "secret": true
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
        "/roll": {
            "broadcast": true,
            "description": "rolls n dice of m sides",
            "parameters": 2,
            "result": function(n_dice, m_sides) {
                if (m_sides > 10000 || n_dice > 100) {
                    return "TEXT: Can you not";
                }

                let min = Math.ceil(1);                
                let max = Math.floor(m_sides);
              
                let result = 0;
                for(let i = 0; i < n_dice; i++) {
                    result+= Math.floor(Math.random() * (max - min)) + min;
                }
                return "TEXT: Roll " + n_dice + "d" + m_sides+": " + result;
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
                    if (command.secret) {
                        serverToSender(output);
                    } else {
                        serverBroadcast(output);
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
            let id = Math.round(Math.random() * 1e10).toString();
            url = "/user_images/" + (+new Date()) + "_" + id;

            let fs = require("fs");
            try {
                fs.writeFileSync(root + url, base64, "base64");
            } catch (e) {
                console.log("[ERROR] Failed to upload image");
            }
        }

        let output = "IMAGE: " + url;
        sendToSender("sendMessage", output);
        sendToOthers("chatMessage", output);
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
