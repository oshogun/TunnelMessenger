define("Profile",["require","exports"],function(e,t){"use strict";var n=function(){function t(e,t,n){this.nickname=e,this.fullName=t,this.email=n,this.subnick=""}return t.prototype.getNickname=function(){return this.nickname},t.prototype.getFullName=function(){return this.fullName},t.prototype.getEmail=function(){return this.email},t.prototype.getSubnick=function(){return this.subnick},t.prototype.display=function(e){e.innerHTML=this.nickname},t.prototype.registerUser=function(){var t=e("mysql"),n=t.createConnection({host:"localhost",user:"tunnel",password:"123456",database:"TunnelMessenger"});n.connect();var i="INSERT INTO users(username, nickname, subnick, fullName, email)                     VALUES("+this.nickname+","+this.nickname+","+this.subnick+",                     "+this.email+")";n.query(i,function(e){if(e)throw e;console.log(i)}),n.end},t}();t.User=n}),define("Message",["require","exports"],function(e,t){"use strict";var n=function(){function e(e,t,n){this.content=e,this.author=t,this.datetime=n}return e.prototype.display=function(e){e.innerHTML=this.content},e.prototype.getAuthor=function(){return this.author},e.prototype.getDatetime=function(){return this.datetime},e.prototype.getContent=function(){return this.content},e}();t.TextMessage=n}),define("Utils",["require","exports"],function(e,t){"use strict";var n;!function(e){function t(e,t){var n=document.createElement(e);return t&&this.foreach(t,function(e,t){"click"==e?n.addEventListener("click",t):n[e]=t}),n}function n(e,t){for(var n in e)if(e.hasOwnProperty(n)&&t(n,e[n])===!1)break}e.create=t,e.foreach=n}(n=t.utils||(t.utils={}))}),define("Chat",["require","exports","Utils"],function(e,t,n){"use strict";var i=function(){function e(e,t,n){this.messages=[],this.name=e,this.users=t,this.node=n}return e.prototype.addMessage=function(e){var t=this.messages[this.messages.length-1];this.messages.push(e),t&&e.getAuthor()==t.getAuthor()||this.spawnMessageBlock(),this.mergeWithLastBlock(e)},e.prototype.spawnMessageBlock=function(){var e=this.messages[this.messages.length-1],t=n.utils.create("div",{className:"messageBlock"}),i=n.utils.create("div",{className:"author"});e.getAuthor().display(i),t.appendChild(i),this.node.appendChild(t),this.lastMessageBlock=t},e.prototype.mergeWithLastBlock=function(e){var t=n.utils.create("div",{className:"content"});e.display(t),this.lastMessageBlock.appendChild(t)},e}();t.Chat=i}),define("main",["require","exports","Chat","Message","Profile"],function(e,t,n,i,s){"use strict";$(document).ready(function(){function e(e,t){c.hasOwnProperty(e)||(c[e]=new s.User(e,e+" da Silva",e+"@baidu.com")),t=t.substr(t.indexOf(":")+2);var n=new i.TextMessage(t,c[e],new Date);o.addMessage(n),$("html, body").scrollTop($(document).height())}console.log("Server running.");var t=io(),o=new n.Chat("Chat #1",[],$("#display").get(0)),a=document.title,r=0;$("#sendMessage").click(function(){return t.emit("chatMessage",$("#messageBox").val()),$("#messageBox").val(""),!1}),$("#nicknameButton").click(function(){return t.emit("changeNick",$("#nicknameBox").val()),$("#nicknameBox").val(""),!1}),$("#messageBox").keyup(function(e){13==e.keyCode?$("#sendMessage").click():(t.emit("isTyping"),setTimeout(function(){t.emit("stoppedTyping")},1e3))});var c={};$(document).focus(function(){r=0,document.title=a}),t.on("menu",function(e){console.log("[OPEN MENU]",e)}),t.on("sendMessage",e),t.on("chatMessage",function(t,n){document.hasFocus()||(r++,document.title="("+r+") "+a),e(t,n)}),t.on("isTyping",function(e){$("#typingCell").html(e+" is typing...")}),t.on("stoppedTyping",function(){$("#typingCell").html("")})})});
