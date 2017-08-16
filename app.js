
var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

var allowedFolders = ["css", "js", "lib"];
var port = 3000;

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

http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' + port);
});
