define("Profile",["require","exports"],function(e,t){"use strict";var i=function(){function e(e,t,i){this.nickname=e,this.fullName=t,this.email=i,this.subnick=""}return e.prototype.getNickname=function(){return this.nickname},e.prototype.getFullName=function(){return this.fullName},e.prototype.getEmail=function(){return this.email},e.prototype.getSubnick=function(){return this.subnick},e}();t.User=i}),define("main",["require","exports","Profile"],function(e,t,i){"use strict";$(document).ready(function(){console.log("SERVER RUNNINGGGGGGGGGGGG HNGGGG");var e=new i.User("robertinhUUhHH22","Roberto Álvares Ribeiro Ramos","bobgatinhodosurf@gmail.com");$("#displayBob").click(function(){$("#robertao").html(e.getNickname()+"<br>"+e.getFullName()+"<br>"+e.getEmail())})})});
