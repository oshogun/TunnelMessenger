
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser");
var path = require('path');
var bodyParser = require("body-parser");
var allowedFolders = ["css", "js", "lib"];
var port = 3000;

var users = {};
var connected_users = 0;

app.use(bodyParser.urlencoded({
    extended:true
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
    connected_users += 1;
 
    users[socket.id] = "anon"+connected_users;
    
    console.log('User connected');
    socket.on("chatMessage", function(msg) {
        socket.emit("sendMessage", users[socket.id], msg);
        socket.broadcast.emit('chatMessage', users[socket.id], msg);
        if(msg == "/github") {
            io.emit('chatMessage', users[0], "https://github.com/oshogun/TunnelMessenger");
        } 
        if(msg=="/whoami") {
            io.emit('chatMessage', users[0], users[socket.id]);
        }

    });

    socket.on("changeNick", function(nick){
        if(nick != null && nick != "") {
            users[socket.id] = nick;
        }
    });

    socket.on("disconnect", function(){
        console.log('user disconnected');
        connected_users -= 1;
    });

    socket.on("isTyping", function() {
        socket.broadcast.emit('isTyping', users[socket.id]);
    });

    socket.on("stoppedTyping",function() {
        socket.broadcast.emit('stoppedTyping');
    });
});
    

http.listen(3000, function(){
    console.log('listening on *:3000');
});


