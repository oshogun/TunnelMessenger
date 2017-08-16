/// <reference path="defs/jQuery.d.ts" />

import {User} from "./Profile"

$(document).ready(function() {
    console.log("SERVER RUNNINGGGGGGGGGGGG HNGGGG");

    let bob = new User("robertinhUUhHH22",
                        "Roberto Álvares Ribeiro Ramos",
                        "bobgatinhodosurf@gmail.com");
    bob.registerUser();

    // $("#displayBob").click(function() {
    //     $("#robertao").html(bob.getNickname() + "<br>" + bob.getFullName() + "<br>" + bob.getEmail());
    // });
});

