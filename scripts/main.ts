/// <reference path="defs/jQuery.d.ts" />

import {Chat} from "./Chat"
import {TextMessage} from "./Message"
import {User} from "./Profile"

declare var io;

$(document).ready(function() {
    console.log("Server running.");

    let socket = io();
    let chat = new Chat("Chat #1", [], $("#display").get(0));
    let defaultTitle = document.title;
    let unreadMessages = 0;

    $("#sendMessage").click(function(){
        socket.emit("chatMessage", $("#messageBox").val());
        $("#messageBox").val("");
        return false;
    });

    $("#nicknameButton").click(function(){
        socket.emit("changeNick", $("#nicknameBox").val());
        $("#nicknameBox").val("");
        return false;
    });

    $("#messageBox").keyup(function(e) {
        if (e.keyCode == 13) {
            $("#sendMessage").click();
        } else {
            socket.emit("isTyping");
            setTimeout(function(){
                socket.emit("stoppedTyping");
            }, 1000);
        }
    });

    let dummyUsers = {};

    $(document).focus(function() {
        unreadMessages = 0;
        document.title = defaultTitle;
    });

    function processMessage(name: string, content: string) {
        if (!dummyUsers.hasOwnProperty(name)) {
            dummyUsers[name] = new User(name, name + " da Silva", name + "@baidu.com");
        }

        // TODO: handle different types of messages
        content = content.substr(content.indexOf(":") + 2);
        let message = new TextMessage(content, dummyUsers[name], new Date());
       
        chat.addMessage(message);
        $("html, body").scrollTop($(document).height());
    }

    socket.on("menu", function(id) {
        console.log("[OPEN MENU]", id);
    });

    socket.on("sendMessage", processMessage);

    socket.on("chatMessage", function(name, content) {
        if (!document.hasFocus()) {
            unreadMessages++;
            document.title = "(" + unreadMessages + ") " + defaultTitle;
        }

        processMessage(name, content);
    });

    socket.on("isTyping", function(user) {
        $("#typingCell").html(user + " is typing...");

    })
    socket.on("stoppedTyping", function() {
        $("#typingCell").html("");
    });
});

