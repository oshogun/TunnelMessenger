/// <reference path="../defs/jQuery.d.ts" />

import {Audio} from "./Audio"
import {Chat} from "../shared/Chat"
import {Game} from "./Game"
import {MessageFactory} from "../shared/MessageFactory"
import {User, UserType} from "../shared/User"

declare var io: {
    (): {
        emit: (type: string, ...args: any[]) => void;
        on: (type: string, handler: (...args: any[]) => void) => void;
    }
}

$(document).ready(function() {
    console.log("Server running.");

    let socket = io();
    let audio = new Audio("/public/notify.ogg", document.body);

    let chat = new Chat("Chat #1", [], $("#chatBox").get(0) as HTMLElement);
    chat.setSocketHandler(socket);

    let defaultTitle = document.title;
    let unreadMessages = 0;

    let typingTimeout: number|null = null;

    let game: Game|null = null;

    function stopTypingCallback() {
        socket.emit("stoppedTyping");
        typingTimeout = null;
    }

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
            stopTypingCallback();
        } else {
            if (!typingTimeout) {
                socket.emit("isTyping");
            }

            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            typingTimeout = <number> <any> setTimeout(stopTypingCallback, 1500);
        }
    });

    $("#messageBox").get(0).addEventListener("paste", function(e: ClipboardEvent) {
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
                        if (!blob) {
                            throw Error();
                        }

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

    function onPageFocus() {
        unreadMessages = 0;
        document.title = defaultTitle;
    }

    $(document).focus(onPageFocus);
    window.addEventListener("focus", onPageFocus);

    function processMessage(name: string, content: string, id?: string) {
        if (!dummyUsers.hasOwnProperty(name)) {
            let authorType = (name == "SERVER") ? UserType.SERVER : UserType.NORMAL;
            dummyUsers[name] = new User(
                authorType,
                name,
                name + " da Silva",
                name + "@chatBox.com",
                "123456"
            );
        }

        let user = dummyUsers[name];
        let message = MessageFactory.getInstance(content, user, new Date());

        if (id) {
            message.setId(id);
        }

        chat.addMessage(message, function() {
            $("#chatBox").scrollTop(1e10);
        });
    }

    socket.on("menu", function(id) {
        console.log("[OPEN MENU]", id);
    });

    socket.on("sendMessage", processMessage);

    socket.on("chatMessage", function(name: string, content: string, id?: string) {
        if (!document.hasFocus()) {
            unreadMessages++;
            document.title = "(" + unreadMessages + ") " + defaultTitle;
            audio.play();
        }

        processMessage(name, content, id);
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

    socket.on("gameLaunch", function(playerIndex: number, url: string,
        id: string, width: number, height: number) {

        game = new Game(socket, playerIndex, url, id);
        game.launch(width, height);
    });

    socket.on("gameData", function(data: any) {
        if (game === null) {
            throw Error("Unexpected game data");
        }

        game.receiveData(data);
    });

    socket.on("gameAbort", function() {
        if (game === null) {
            throw Error("Unexpected game abort request");
        }

        game.abort();
        game = null;
    });
});

