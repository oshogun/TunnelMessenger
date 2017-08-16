
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

var allowedFolders = ["css", "js", "lib"];
var port = 3000;

var users = {};
var connected_users = 0;
app.get("/TunnelMessenger", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

for (var i = 0; i < allowedFolders.length; i++) {
    app.get("/" + allowedFolders[i] + "/*", function(request, response) {
        response.sendFile(__dirname + request.url);
    });
}

var UserManager = require("./rest").UserManager;
var userManager = new UserManager(app);

var io = require('socket.io')(http);

io.on('connection', function(socket) {
	
	connected_users += 1;
	users[socket.id] = "user"+connected_users;


    console.log('User connected');
    socket.on('chat message', function(msg){
    	io.emit('chat message',users[socket.id], msg);
    });
    socket.on('disconnect', function(){
    	console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
  
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});


