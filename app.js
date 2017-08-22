var requirejs = require("requirejs");
requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
});
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require("body-parser");
var allowedFolders = ["public", "css", "js", "lib"];
var port = 3000;
var users = {};
var nicks = [];
var connectedUsers = 0;
var zoeira = false;
if (process.argv.length > 2 && process.argv[2] == 1) {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.get("/TunnelMessenger", function (request, response) {
    response.sendFile(__dirname + "/public/index.html");
});
app.post("/login", function (request, response) {
    response.sendFile(__dirname + "/public/index.html");
});
app.get("/register", function (request, response) {
    response.sendFile(__dirname + "/public/register.html");
});
for (var i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function (request, response) {
        response.sendFile(__dirname + request.url);
    });
}
var UserManager = require("./rest").UserManager;
var userManager = new UserManager(app);
users[0] = "SERVER";
io.on("connection", function (socket) {
    connectedUsers++;
    users[socket.id] = "anon" + (nicks.length + 1);
    nicks.push([socket.id, users[socket.id]]);
    broadcast("changeNick", nicks);
    console.log("A user has connected. Users online: " + connectedUsers);
    function sanitizeInput(content) {
        if (!zoeira) {
            return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        else {
            return content;
        }
    }
    function sendToSender(type) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
        socket.emit.apply(socket, [type, users[socket.id]].concat(otherArgs));
    }
    function sendToOthers(type) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
        socket.broadcast.emit.apply(socket.broadcast, [type, users[socket.id]].concat(otherArgs));
    }
    function broadcast(type) {
        var otherArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            otherArgs[_i - 1] = arguments[_i];
        }
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
            for (var i = 0; i < nicks.length; i++) {
                if (nicks[i][0] == socket.id) {
                    nicks[i][1] = nick;
                }
            }
            users[socket.id] = nick;
            broadcast("changeNick", nicks);
        }
    }
    var commands = {
        "/help": {
            "broadcast": false,
            "description": "Lists all available commands",
            "result": function () {
                var output = "TEXT: Available commands:<ul>";
                for (var name_1 in commands) {
                    if (commands.hasOwnProperty(name_1)) {
                        var command = commands[name_1];
                        output += "<li>" + name_1;
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
            "result": "TEXT: https://github.com/oshogun/TunnelMessenger"
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
            "description": "Lets the user smash"
        },
        "/whoami": {
            "broadcast": true,
            "description": "Shows your nickname",
            "result": function () {
                return "TEXT: " + users[socket.id];
            }
        },
        "/zoeira_disable": {
            "description": "Disables the zoeira mode",
            "result": function () {
                zoeira = false;
                return "TEXT: zoeira mode aborted";
            }
        },
        "/zoeira_enable": {
            "description": "Enables the zoeira mode",
            "result": function () {
                zoeira = true;
                return "TEXT: zoeira mode ENGAGED";
            }
        }
    };
    socket.on("chatMessage", function (message) {
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
            var output = void 0;
            if (result instanceof Function) {
                output = result.apply(null, messagePieces.slice(1));
            }
            else {
                output = result;
            }
            if (typeof output != "undefined") {
                if (commandType(output) == "MENU") {
                    socket.emit("menu", commandContent(output));
                }
                else {
                    serverBroadcast(output);
                }
            }
        }
    });
    socket.on("changeNick", changeNickCallback);
    socket.on("disconnect", function () {
        connectedUsers--;
        for (var i = 0; i < nicks.length; i++) {
            if (nicks[i][0] == socket.id) {
                nicks.splice(i, 1);
            }
        }
        console.log("A user has disconnected. Users online: " + connectedUsers);
        broadcast("changeNick", nicks);
    });
    socket.on("isTyping", function () {
        sendToOthers("isTyping");
    });
    socket.on("stoppedTyping", function () {
        sendToOthers("stoppedTyping");
    });
});
http.listen(port, function () {
    console.log("Listening on port " + port);
});
define("shared/Profile", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var User = (function () {
        function User(nickname, fullName, email) {
            this.nickname = nickname;
            this.fullName = fullName;
            this.email = email;
            this.subnick = "";
        }
        User.prototype.getNickname = function () {
            return this.nickname;
        };
        User.prototype.getFullName = function () {
            return this.fullName;
        };
        User.prototype.getEmail = function () {
            return this.email;
        };
        User.prototype.getSubnick = function () {
            return this.subnick;
        };
        User.prototype.display = function (node) {
            node.innerHTML = this.nickname;
        };
        User.prototype.registerUser = function () {
            var mysql = require("mysql");
            var connection = mysql.createConnection({
                host: 'localhost',
                user: 'labsec',
                password: 'labsec',
                database: 'TunnelMessenger'
            });
            connection.connect();
            var query = "INSERT INTO users(username, nickname, subnick, fullName, email)\
                     VALUES(" + this.nickname + "," + this.nickname + "," + this.subnick + ",\
                     " + this.email + ")";
            connection.query(query, function (error) {
                if (error) {
                    throw error;
                }
                console.log(query);
            });
            connection.end;
        };
        return User;
    }());
    exports.User = User;
});
define("shared/Message", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var TextMessage = (function () {
        function TextMessage(content, author, datetime) {
            this.content = content;
            this.author = author;
            this.datetime = datetime;
        }
        TextMessage.prototype.display = function (node) {
            node.innerHTML = this.content;
        };
        TextMessage.prototype.getAuthor = function () {
            return this.author;
        };
        TextMessage.prototype.getDatetime = function () {
            return this.datetime;
        };
        TextMessage.prototype.getContent = function () {
            return this.content;
        };
        return TextMessage;
    }());
    exports.TextMessage = TextMessage;
});
define("shared/Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var utils;
    (function (utils) {
        function create(tag, props) {
            var result = document.createElement(tag);
            if (props) {
                this.foreach(props, function (key, value) {
                    if (key == "click") {
                        result.addEventListener("click", value);
                    }
                    else {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        utils.create = create;
        function foreach(obj, callback) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (callback(i, obj[i]) === false) {
                        break;
                    }
                }
            }
        }
        utils.foreach = foreach;
    })(utils = exports.utils || (exports.utils = {}));
});
define("shared/Chat", ["require", "exports", "shared/Utils"], function (require, exports, Utils_1) {
    "use strict";
    exports.__esModule = true;
    var Chat = (function () {
        function Chat(name, users, node) {
            this.messages = [];
            this.name = name;
            this.users = users;
            this.node = node;
        }
        Chat.prototype.addMessage = function (message) {
            var previousMessage = this.messages[this.messages.length - 1];
            this.messages.push(message);
            if (!previousMessage || message.getAuthor() != previousMessage.getAuthor()) {
                this.spawnMessageBlock();
            }
            this.mergeWithLastBlock(message);
        };
        Chat.prototype.spawnMessageBlock = function () {
            var lastMessage = this.messages[this.messages.length - 1];
            var container = Utils_1.utils.create("div", {
                className: "messageBlock"
            });
            var authorContainer = Utils_1.utils.create("div", {
                className: "author"
            });
            lastMessage.getAuthor().display(authorContainer);
            container.appendChild(authorContainer);
            this.node.appendChild(container);
            this.lastMessageBlock = container;
        };
        Chat.prototype.mergeWithLastBlock = function (message) {
            var contentContainer = Utils_1.utils.create("div", {
                className: "content"
            });
            message.display(contentContainer);
            this.lastMessageBlock.appendChild(contentContainer);
        };
        return Chat;
    }());
    exports.Chat = Chat;
});
