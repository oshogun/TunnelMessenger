define("shared/Profile", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var User = (function () {
        function User(nickname, fullName, email) {
            this.nickname = nickname;
            this.fullName = fullName;
            this.email = email;
            this.subnick = "";
        }
        User.prototype.getNickname = function () {
            return this.nickname;
        };
        User.prototype.getFullName = function () {
            return this.fullName;
        };
        User.prototype.getEmail = function () {
            return this.email;
        };
        User.prototype.getSubnick = function () {
            return this.subnick;
        };
        User.prototype.display = function (node) {
            node.innerHTML = this.nickname;
        };
        User.prototype.registerUser = function () {
            var mysql = require("mysql");
            var connection = mysql.createConnection({
                host: 'localhost',
                user: 'labsec',
                password: 'labsec',
                database: 'TunnelMessenger'
            });
            connection.connect();
            var query = "INSERT INTO users(username, nickname, subnick, fullName, email)\
                     VALUES(" + this.nickname + "," + this.nickname + "," + this.subnick + ",\
                     " + this.email + ")";
            connection.query(query, function (error) {
                if (error) {
                    throw error;
                }
                console.log(query);
            });
            connection.end;
        };
        return User;
    }());
    exports.User = User;
});
define("shared/Message", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var TextMessage = (function () {
        function TextMessage(content, author, datetime) {
            this.content = content;
            this.author = author;
            this.datetime = datetime;
        }
        TextMessage.prototype.display = function (node) {
            node.innerHTML = this.content;
        };
        TextMessage.prototype.getAuthor = function () {
            return this.author;
        };
        TextMessage.prototype.getDatetime = function () {
            return this.datetime;
        };
        TextMessage.prototype.getContent = function () {
            return this.content;
        };
        return TextMessage;
    }());
    exports.TextMessage = TextMessage;
});
define("shared/Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var utils;
    (function (utils) {
        function create(tag, props) {
            var result = document.createElement(tag);
            if (props) {
                this.foreach(props, function (key, value) {
                    if (key == "click") {
                        result.addEventListener("click", value);
                    }
                    else {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        utils.create = create;
        function foreach(obj, callback) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (callback(i, obj[i]) === false) {
                        break;
                    }
                }
            }
        }
        utils.foreach = foreach;
    })(utils = exports.utils || (exports.utils = {}));
});
define("shared/Chat", ["require", "exports", "shared/Utils"], function (require, exports, Utils_1) {
    "use strict";
    exports.__esModule = true;
    var Chat = (function () {
        function Chat(name, users, node) {
            this.messages = [];
            this.name = name;
            this.users = users;
            this.node = node;
        }
        Chat.prototype.addMessage = function (message) {
            var previousMessage = this.messages[this.messages.length - 1];
            this.messages.push(message);
            if (!previousMessage || message.getAuthor() != previousMessage.getAuthor()) {
                this.spawnMessageBlock();
            }
            this.mergeWithLastBlock(message);
        };
        Chat.prototype.spawnMessageBlock = function () {
            var lastMessage = this.messages[this.messages.length - 1];
            var container = Utils_1.utils.create("div", {
                className: "messageBlock"
            });
            var authorContainer = Utils_1.utils.create("div", {
                className: "author"
            });
            lastMessage.getAuthor().display(authorContainer);
            container.appendChild(authorContainer);
            this.node.appendChild(container);
            this.lastMessageBlock = container;
        };
        Chat.prototype.mergeWithLastBlock = function (message) {
            var contentContainer = Utils_1.utils.create("div", {
                className: "content"
            });
            message.display(contentContainer);
            this.lastMessageBlock.appendChild(contentContainer);
        };
        return Chat;
    }());
    exports.Chat = Chat;
});
define("frontend/main", ["require", "exports", "shared/Chat", "shared/Message", "shared/Profile"], function (require, exports, Chat_1, Message_1, Profile_1) {
    "use strict";
    exports.__esModule = true;
    $(document).ready(function () {
        console.log("Server running.");
        var socket = io();
        var chat = new Chat_1.Chat("Chat #1", [], $("#chatBox").get(0));
        var defaultTitle = document.title;
        var unreadMessages = 0;
        $("#chat").css("height", $("body").height());
        $("#chatBox").css("max-height", $("#display").height());
        $("#sendMessage").click(function () {
            socket.emit("chatMessage", $("#messageBox").val());
            $("#messageBox").val("");
            return false;
        });
        $("#nicknameButton").click(function () {
            socket.emit("changeNick", $("#nicknameBox").val());
            $("#nicknameBox").val("");
            return false;
        });
        $("#messageBox").keyup(function (e) {
            if (e.keyCode == 13) {
                $("#sendMessage").click();
            }
            else {
                socket.emit("isTyping");
                setTimeout(function () {
                    socket.emit("stoppedTyping");
                }, 3000);
            }
        });
        var dummyUsers = {};
        $(document).focus(function () {
            unreadMessages = 0;
            document.title = defaultTitle;
        });
        function processMessage(name, content) {
            if (!dummyUsers.hasOwnProperty(name)) {
                dummyUsers[name] = new Profile_1.User(name, name + " da Silva", name + "@chatBox.com");
            }
            content = content.substr(content.indexOf(":") + 2);
            var message = new Message_1.TextMessage(content, dummyUsers[name], new Date());
            chat.addMessage(message);
            $("#chatBox").scrollTop(1e10);
        }
        socket.on("menu", function (id) {
            console.log("[OPEN MENU]", id);
        });
        socket.on("sendMessage", processMessage);
        socket.on("chatMessage", function (name, content) {
            if (!document.hasFocus()) {
                unreadMessages++;
                document.title = "(" + unreadMessages + ") " + defaultTitle;
            }
            processMessage(name, content);
        });
        socket.on("isTyping", function (user) {
            $("#typingCell").html(user + " is typing...");
        });
        socket.on("stoppedTyping", function () {
            $("#typingCell").html("");
        });
        socket.on("changeNick", function (source, nicks) {
            var nickList = "<ol>";
            for (var _i = 0, nicks_1 = nicks; _i < nicks_1.length; _i++) {
                var pair = nicks_1[_i];
                nickList += "<li>" + pair[1] + "</li>";
            }
            nickList += "</ol>";
            $("#list").html(nickList);
        });
    });
});
