/// <reference path="../defs/node.d.ts" />

import {Command, CommandLoader, CommandPackage, Workspace} from "./Commands"
import {MessageTarget} from "./MessageTarget"
import {NetworkManager} from "./NetworkManager"
import {UserManager} from "./UserManager"
import {UserPersistence} from "./UserPersistence"
import {User} from "../shared/User"
import {MTGHandler} from "./Magic";

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
        let newUser = new User(username,full_name,email,password);

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


let /*the*/ carnage /*begin*/ = 1200;
let /*the*/zoeira /*begin*/ = false;

if (process.argv.length > 2 && process.argv[2] == "1") {
    zoeira = true;
    console.log("zoeira mode ENGAGED");
}

let userManager = new UserManager();
userManager.addUser(0, "SERVER");

let connectedUsers = 0;

io.on("connection", function(socket) {
    connectedUsers++;

    let networkManager = new NetworkManager(io, socket, userManager);

    let workspace: Workspace = {
        "changeNickCallback": changeNickCallback,
        "zoeiraEnable": function() { zoeira = true; },
        "zoeiraDisable": function() { zoeira = false; },
        "findMtgCardImage": findMtgCardImage,
        "findMtgLegalInfo": findMtgLegalInfo
    };

    let commandLoader = new CommandLoader();
    commandLoader.addPackage("std", networkManager, workspace);

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

     function findMtgCardImage(argument) {
        let image_uri: string;
        mtgHandler.getCard(argument, function(res) {
             let imageTag:string;
             if(res.image_uri != null)
                 imageTag = "IMAGE: " + res.image_uri;
             else
                 imageTag = "IMAGE: " + "https://media.giphy.com/media/WCwFvyeb6WJna/giphy.gif";
             networkManager.serverBroadcast(imageTag);            
        });
        
    }
    
    function findMtgLegalInfo(argument) {
        mtgHandler.getCard(argument, function(res){ 
            networkManager.serverBroadcast("TEXT: " + res.name + "'s legalities:" + "<br>Standard: " + res.legalities.standard + "<br>Modern: " + res.legalities.modern 
                + "<br>Commander: " + res.legalities.commander + "<br>Legacy: "+res.legalities.legacy + "<br>Vintage: " +res.legalities.vintage
                + "<br>Pauper: " + res.legalities.pauper + "<br>Frontier " + res.legalities.frontier + "<br>Penny Dreadful: " + res.legalities.penny
                + "<br>Duel: " + res.legalities.duel);
               
                
            
        });
    }
    networkManager.login("anon" + (connectedUsers + 1));

    console.log("A user has connected. Users online: " + connectedUsers);
  
    socket.on("chatMessage", function(message) {
        let messagePieces = message.split(" ");
        let command = <Command> commandLoader.getCommand(message);
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
            if (command.hasOwnProperty("parameters")) {
                if (command.parameters != messagePieces.length - 1) {
                    networkManager.serverBroadcast("TEXT: expected " + command.parameters + " parameters");
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
});


http.listen(port, function(){
    console.log("Listening on port " + port);
});
