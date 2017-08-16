/// <reference path="defs/jQuery.d.ts" />

import {User} from "./Profile"

declare var io;

$(document).ready(function() {
    console.log("Server running.");

    let socket = io();

    $("#sendMessage").click(function(){
        socket.emit("chat message", $("#message").val());
        $("#message").val("");
        return false;
    });

    $("#message").keyup(function(e) {
        if (e.keyCode == 13) {
            $("#sendMessage").click();
        }
    });

    socket.on("chat message", function(name, content) {
        $("#messages").append($("<li>").text("" + name + ": " + content));
        $("html, body").scrollTop($(document).height());
    });
});

