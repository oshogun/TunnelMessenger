/// <reference path="../defs/jQuery.d.ts" />

import {Audio} from "./Audio"
import {Chat} from "../shared/Chat"
import {MessageFactory} from "../shared/MessageFactory"
import {User} from "../shared/Profile"

declare var io;

$(document).ready(function() {
    console.log("Server running.");

    let socket = io();
    let audio = new Audio("/public/notify.ogg", document.body);
    let chat = new Chat("Chat #1", [], $("#chatBox").get(0));
    let defaultTitle = document.title;
    let unreadMessages = 0;

    $("#sendMessage").click(function(){
        socket.emit("chatMessage", $("#messageBox").val());
        $("#messageBox").val("");
        return false;
    });

    $("#sendNickname").click(function(){
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
            }, 3000);
        }
    });

    $("#messageBox").get(0).addEventListener("paste", function(e) {
        let items = e.clipboardData.items;
        if (!items) {
            return;
        }

        let types = e.clipboardData.types;
        let typeList: string[] = [];
        for (let i = 0; i < types.length; i++) {
            typeList.push(types[i]);
        }

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                let data: string;
                if (typeList.indexOf("text/html") != -1) {
                    data = e.clipboardData.getData("text/html");
                    socket.emit("chatImage", data);
                } else {
                    try {
                        let blob = items[i].getAsFile();
                        let reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = function() {
                            socket.emit("chatImage", reader.result);
                        };
                    } catch (e) {
                        console.log("[ERROR] Failed to process image file");
                    }
                }
            }
        }
    });

    let dummyUsers = {};

    $(document).focus(function() {
        unreadMessages = 0;
        document.title = defaultTitle;
    });

    function processMessage(name: string, content: string) {
        if (!dummyUsers.hasOwnProperty(name)) {
            dummyUsers[name] = new User(name, name + " da Silva", name + "@chatBox.com");
        }

        let message = MessageFactory.getInstance(content, dummyUsers[name], new Date());
       
        chat.addMessage(message, function() {
            $("#chatBox").scrollTop(1e10);
        });
    }

    socket.on("menu", function(id) {
        console.log("[OPEN MENU]", id);
    });

    socket.on("sendMessage", processMessage);

    socket.on("chatMessage", function(name, content) {
        if (!document.hasFocus()) {
            unreadMessages++;
            document.title = "(" + unreadMessages + ") " + defaultTitle;
            audio.play();
        }

        processMessage(name, content);
    });

    socket.on("isTyping", function(user) {
        $("#typingCell").html(user + " is typing...");

    })
    socket.on("stoppedTyping", function() {
        $("#typingCell").html("&nbsp;");
    });

    socket.on("changeNick", function(source, nicks) {
        let nickList = "<ol>";

        for (let pair of nicks) {
            nickList += "<li>" + pair[1] + "</li>";
        }

        nickList += "</ol>";

        $("#list").html(nickList);
    });

    socket.on("clearChatbox", function() {
        chat.clear();
    });

    socket.on("mute", function() {
        audio.mute();
    });

    socket.on("unmute", function() {
        audio.unmute();
    });
});

