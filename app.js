
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require("body-parser");
var allowedFolders = ["css", "js", "lib"];
var port = 3000;

var users = {};
var connectedUsers = 0;

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

    users[socket.id] = "anon" + connectedUsers;

    console.log('A user has connected. Users online: ' + connectedUsers);

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

    var commands = {
        "/github": "https://github.com/oshogun/TunnelMessenger",
        "/whoami": function() {
            return users[socket.id]
        }
    }

    socket.on("chatMessage", function(message) {
        sendToSender("sendMessage", message);
        sendToOthers("chatMessage", message);

        if (commands.hasOwnProperty(message)) {
            var command = commands[message];
            var output = (command instanceof Function) ? command() : command;
            serverBroadcast(output);
        }
    });

    socket.on("changeNick", function(nick){
        if (nick != null && nick != "") {
            users[socket.id] = nick;
        }
    });

    socket.on("disconnect", function(){
        connectedUsers--;
        console.log("A user has disconnected. Users online: " + connectedUsers);
    });

    socket.on("isTyping", function() {
        sendToOthers("isTyping");
    });

    socket.on("stoppedTyping",function() {
        sendToOthers("stoppedTyping");
    });
});

http.listen(3000, function(){
    console.log("listening on *:3000");
});
