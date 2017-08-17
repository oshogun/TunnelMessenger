/// <reference path="defs/jQuery.d.ts" />

import {Chat} from "./Chat"
import {TextMessage} from "./Message"
import {User} from "./Profile"

declare var io;

$(document).ready(function() {
    console.log("Server running.");

    let socket = io();
    let chat = new Chat("Chat #1", [], $("#display").get(0));


    $("#sendMessage").click(function(){
        socket.emit("chat message", $("#messageBox").val());
        $("#messageBox").val("");
        return false;
    });
    $('#nicknameButton').click(function(){
    	socket.emit('changeNick', $("#nicknameBox").val());
    	$("#nicknameBox").val("Novo Nickname");
    	return false;
    });
    $("#messageBox").keyup(function(e) {
        if (e.keyCode == 13) {
            $("#sendMessage").click();
        }
    });

    let dummyUsers = {};

    socket.on("chat message", function(name, content) {
        if (!dummyUsers.hasOwnProperty(name)) {
            dummyUsers[name] = new User(name, name + " da Silva", name + "@baidu.com");
        }

        let message = new TextMessage(content, dummyUsers[name], new Date());
       
	     chat.addMessage(message);
	    $("html, body").scrollTop($(document).height());
    	
    });
});

