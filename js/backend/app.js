"use strict";
exports.__esModule = true;
var Commands_1 = require("./Commands");
var MessageTarget_1 = require("./MessageTarget");
var NetworkManager_1 = require("./NetworkManager");
var UserManager_1 = require("./UserManager");
var Profile_1 = require("../shared/Profile");
var root = __dirname.split("/").slice(0, -2).join("/");
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require("body-parser");
var urlencodedparser = bodyParser.urlencoded({ extended: false });
var allowedFolders = ["css", "js", "lib", "public", "user_images"];
var port = process.env.PORT || 3000;
var markdown = require("markdown").markdown;
app.use(bodyParser.json());
app.get("/TunnelMessenger", function (request, response) {
    response.sendFile(root + "/public/index.html");
});
app.post("/register", urlencodedparser, function (request, response) {
    console.log("kk eae men, sente só esse formulario de registro:");
    console.log(request.body);
    var username = request.body.username;
    var password = request.body.password;
    var password_verify = request.body.confirm_password;
    var email = request.body.email;
    var full_name = request.body.full_name;
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        console.log("Ih rapaz, meio trap esse email aí");
    }
    else {
        console.log("Bom email parça");
    }
    if (password != password_verify) {
        console.log("passwords don't match");
    }
    else {
        var newUser = new Profile_1.User(username, full_name, email, password);
        newUser.registerUser(function (success) {
            if (!success) {
                console.log("Username already in use");
                response.sendFile(root + "/public/register.html");
            }
            else {
                console.log("passwords match");
                response.sendFile(root + "/public/index.html");
            }
        });
    }
});
app.post("/login", urlencodedparser, function (request, response) {
    if (request.body.done == "login") {
        Profile_1.User.verifyUser(request.body.username, request.body.password, function (found) {
            if (found) {
                console.log("login success");
                response.sendFile(root + "/public/index.html");
            }
            else {
                console.log("login FAILED");
                response.sendFile(root + "/public/login_failed.html");
            }
        });
    }
    else {
        response.sendFile(root + "/public/register.html");
    }
});
app.get("/", function (request, response) {
    response.sendFile(root + "/public/login.html");
});
app.get("/frontend/main.js", function (request, response) {
    response.sendFile(root + "/js/frontend/main.js");
});
for (var i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function (request, response) {
        response.sendFile(root + request.url);
    });
}
function extend(obj, props) {
    for (var i in props) {
        if (props.hasOwnProperty(i)) {
            obj[i] = props[i];
        }
    }
    return obj;
}
function sanitizeInput(content) {
    if (!zoeira) {
        return markdown.toHTML(content).replace(/^(?:<p>)?(.*?)(?:<\/p>)?$/, "$1");
    }
    else {
        return content;
    }
}
function commandType(command) {
    return command.substr(0, command.indexOf(":"));
}
function commandContent(command) {
    return command.substr(command.indexOf(":") + 2);
}
var carnage = 1200;
var zoeira = false;
if (process.argv.length > 2 && process.argv[2] == "1") {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}
var userManager = new UserManager_1.UserManager();
userManager.addUser(0, "SERVER");
var connectedUsers = 0;
io.on("connection", function (socket) {
    connectedUsers++;
    var networkManager = new NetworkManager_1.NetworkManager(io, socket, userManager);
    var workspace = {
        "changeNickCallback": changeNickCallback,
        "zoeiraEnable": function () { zoeira = true; },
        "zoeiraDisable": function () { zoeira = false; }
    };
    var commandLoader = new Commands_1.CommandLoader();
    commandLoader.addPackage("std", networkManager, workspace);
    extend(workspace, {
        "addPackage": function (packageName) {
            commandLoader.addPackage(packageName, networkManager, workspace);
        },
        "removePackage": function (packageName) {
            commandLoader.removePackage(packageName, networkManager, workspace);
        }
    });
    function changeNickCallback(newName) {
        newName = sanitizeInput(newName);
        if (newName != null && newName != "") {
            networkManager.renameUser(newName);
        }
    }
    networkManager.login("anon" + (connectedUsers + 1));
    console.log("A user has connected. Users online: " + connectedUsers);
    socket.on("chatMessage", function (message) {
        var messagePieces = message.split(" ");
        var command = commandLoader.getCommand(message);
        var isValidCommand = (command !== null);
        var broadcast = isValidCommand ? command.broadcast : true;
        var outputMessage = "TEXT: " + sanitizeInput(message);
        networkManager.send(MessageTarget_1.MessageTarget.SENDER, "sendMessage", outputMessage);
        if (!isValidCommand && message[0] == "/") {
            networkManager.serverToSender("TEXT: Error: invalid command '" + messagePieces[0] + "'");
            return;
        }
        if (broadcast) {
            networkManager.send(MessageTarget_1.MessageTarget.OTHERS, "chatMessage", outputMessage);
        }
        if (isValidCommand) {
            if (command.hasOwnProperty("parameters")) {
                if (command.parameters != messagePieces.length - 1) {
                    networkManager.serverBroadcast("TEXT: expected " + command.parameters + " parameters");
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
                    if (command.secret) {
                        networkManager.serverToSender(output);
                    }
                    else {
                        networkManager.serverBroadcast(output);
                    }
                }
            }
        }
    });
    socket.on("chatImage", function (imageTag) {
        var srcMatches = imageTag.match(/src="([^"]+)"/);
        var url;
        if (srcMatches) {
            url = srcMatches[1];
        }
        else {
            var base64 = imageTag.substr(imageTag.indexOf(",") + 1);
            var id = Math.round(Math.random() * 1e10).toString();
            url = "/user_images/" + (+new Date()) + "_" + id;
            var fs = require("fs");
            try {
                fs.writeFileSync(root + url, base64, "base64");
            }
            catch (e) {
                console.log("[ERROR] Failed to upload image");
            }
        }
        var output = "IMAGE: " + url;
        networkManager.send(MessageTarget_1.MessageTarget.SENDER, "sendMessage", output);
        networkManager.send(MessageTarget_1.MessageTarget.OTHERS, "chatMessage", output);
    });
    socket.on("changeNick", changeNickCallback);
    socket.on("disconnect", function () {
        networkManager.logout();
        connectedUsers--;
        console.log("A user has disconnected. Users online: " + connectedUsers);
    });
    socket.on("isTyping", function () {
        networkManager.send(MessageTarget_1.MessageTarget.OTHERS, "isTyping");
    });
    socket.on("stoppedTyping", function () {
        networkManager.send(MessageTarget_1.MessageTarget.OTHERS, "stoppedTyping");
    });
});
http.listen(port, function () {
    console.log("Listening on port " + port);
});
