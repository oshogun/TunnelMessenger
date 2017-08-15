/// <reference path="defs/jQuery.d.ts" />



let bob = new User("robertinhUUhHH22", "Roberto Álvares Ribeiro Ramos", "bobgatinhodosurf@gmail.com");


function displayBob() {
	document.getElementById("robertao").innerHTML = bob.getNickname() + "<br>" + bob.getfullName() + "<br>" + bob.getEmail();
}
$(document).ready(function() {
	console.log("SERVER RUNNINGGGGGGGGGGGG HNGGGG");
});


