define("frontend/Audio", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Audio = (function () {
        function Audio(path, parentNode) {
            this.hasSound = true;
            var node = document.createElement("audio");
            node.preload = "auto";
            node.src = path;
            this.node = node;
            parentNode.appendChild(this.node);
        }
        Audio.prototype.play = function () {
            if (this.hasSound) {
                this.node.play();
            }
        };
        Audio.prototype.mute = function () {
            this.hasSound = false;
        };
        Audio.prototype.unmute = function () {
            this.hasSound = true;
        };
        return Audio;
    }());
    exports.Audio = Audio;
});
define("shared/Settings", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Settings;
    (function (Settings) {
        Settings.IMAGE_MAX_HEIGHT = "400px";
        Settings.IMAGE_MAX_WIDTH = "400px";
    })(Settings = exports.Settings || (exports.Settings = {}));
});
define("shared/Profile", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var User = (function () {
        function User(nickname, fullName, email, password) {
            this.nickname = nickname;
            this.fullName = fullName;
            this.email = email;
            this.password = password;
            this.subnick = "";
        }
        User.verifyUser = function (username, password, callback) {
            var mysql = require("mysql");
            var fs = require("fs");
            fs.readFile('credentials.json', 'utf8', function (err, data) {
                if (err) {
                    throw err;
                }
                var connection = mysql.createConnection(JSON.parse(data));
                var query = "SELECT * FROM `users` WHERE `username` = ? AND `password` = ?";
                var found;
                connection.query(query, [username,
                    password], function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                    if (results.length != 0) {
                        found = true;
                    }
                    else {
                        found = false;
                    }
                    callback(found);
                });
            });
        };
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
        User.prototype.findUser = function (callback) {
            var self = this;
            var mysql = require("mysql");
            var fs = require("fs");
            fs.readFile('credentials.json', 'utf8', function (err, data) {
                if (err) {
                    throw err;
                }
                var connection = mysql.createConnection(JSON.parse(data));
                var query = "SELECT * FROM `users` WHERE `username` = ?";
                var found;
                connection.query({ sql: query, values: [self.nickname] }, function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                    if (results.length != 0) {
                        found = true;
                    }
                    else {
                        found = false;
                    }
                    console.log(results);
                    callback(found);
                });
            });
        };
        User.prototype.registerUser = function (callback) {
            var self = this;
            var mysql = require("mysql");
            var fs = require("fs");
            fs.readFile('credentials.json', 'utf8', function (err, data) {
                if (err) {
                    throw err;
                }
                var connection = mysql.createConnection(JSON.parse(data));
                connection.connect();
                self.findUser(function (found) {
                    if (!found) {
                        var query_1 = "INSERT INTO users(username, nickname, fullName, email, password)\
                             VALUES('" + self.nickname + "','" + self.nickname + "','" + self.fullName + "',\
                             '" + self.email + "','" + self.password + "')";
                        connection.query(query_1, function (error) {
                            if (error) {
                                throw error;
                            }
                            console.log(query_1);
                            callback(true);
                        });
                        connection.end();
                    }
                    else {
                        callback(false);
                    }
                });
            });
        };
        return User;
    }());
    exports.User = User;
});
define("shared/Message", ["require", "exports", "shared/Settings"], function (require, exports, Settings_1) {
    "use strict";
    exports.__esModule = true;
    var TextMessage = (function () {
        function TextMessage(content, author, datetime) {
            this.content = content;
            this.author = author;
            this.datetime = datetime;
        }
        TextMessage.prototype.display = function (node, callback) {
            node.innerHTML = this.content;
            if (callback) {
                callback();
            }
        };
        TextMessage.prototype.getAuthor = function () {
            return this.author;
        };
        TextMessage.prototype.getDatetime = function () {
            return this.datetime;
        };
        return TextMessage;
    }());
    exports.TextMessage = TextMessage;
    var ImageMessage = (function () {
        function ImageMessage(url, author, datetime) {
            this.url = url;
            this.author = author;
            this.datetime = datetime;
        }
        ImageMessage.prototype.display = function (node, callback) {
            var container = document.createElement("img");
            container.style.maxHeight = Settings_1.Settings.IMAGE_MAX_HEIGHT;
            container.style.maxWidth = Settings_1.Settings.IMAGE_MAX_WIDTH;
            container.src = this.url;
            if (callback) {
                container.addEventListener("load", callback, false);
            }
            node.appendChild(container);
        };
        ImageMessage.prototype.getAuthor = function () {
            return this.author;
        };
        ImageMessage.prototype.getDatetime = function () {
            return this.datetime;
        };
        return ImageMessage;
    }());
    exports.ImageMessage = ImageMessage;
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
        Chat.prototype.addMessage = function (message, callback) {
            var previousMessage = this.messages[this.messages.length - 1];
            this.messages.push(message);
            if (!previousMessage || message.getAuthor() != previousMessage.getAuthor()) {
                this.spawnMessageBlock();
            }
            this.mergeWithLastBlock(message, callback);
        };
        Chat.prototype.clear = function () {
            this.node.innerHTML = "";
            this.messages = [];
            this.lastMessageBlock = null;
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
        Chat.prototype.mergeWithLastBlock = function (message, callback) {
            var contentContainer = Utils_1.utils.create("div", {
                className: "content"
            });
            this.lastMessageBlock.appendChild(contentContainer);
            message.display(contentContainer, callback);
        };
        return Chat;
    }());
    exports.Chat = Chat;
});
define("shared/MessageFactory", ["require", "exports", "shared/Message"], function (require, exports, Message_1) {
    "use strict";
    exports.__esModule = true;
    var MessageFactory = (function () {
        function MessageFactory() {
        }
        MessageFactory.getInstance = function (fullMessage, author, date) {
            var separator = fullMessage.indexOf(":");
            var type = fullMessage.substr(0, separator);
            var content = fullMessage.substr(separator + 2);
            var message;
            switch (type) {
                case "TEXT":
                    message = new Message_1.TextMessage(content, author, date);
                    break;
                case "IMAGE":
                    message = new Message_1.ImageMessage(content, author, date);
                    break;
                default:
                    throw Error("Unknown message type");
            }
            return message;
        };
        return MessageFactory;
    }());
    exports.MessageFactory = MessageFactory;
});
define("frontend/main", ["require", "exports", "frontend/Audio", "shared/Chat", "shared/MessageFactory", "shared/Profile"], function (require, exports, Audio_1, Chat_1, MessageFactory_1, Profile_1) {
    "use strict";
    exports.__esModule = true;
    $(document).ready(function () {
        console.log("Server running.");
        var socket = io();
        var audio = new Audio_1.Audio("/public/notify.ogg", document.body);
        var chat = new Chat_1.Chat("Chat #1", [], $("#chatBox").get(0));
        var defaultTitle = document.title;
        var unreadMessages = 0;
        var typingTimeout = null;
        function stopTypingCallback() {
            socket.emit("stoppedTyping");
            typingTimeout = null;
        }
        $("#sendMessage").click(function () {
            socket.emit("chatMessage", $("#messageBox").val());
            $("#messageBox").val("");
            return false;
        });
        $("#sendNickname").click(function () {
            socket.emit("changeNick", $("#nicknameBox").val());
            $("#nicknameBox").val("");
            return false;
        });
        $("#messageBox").keyup(function (e) {
            if (e.keyCode == 13) {
                $("#sendMessage").click();
                stopTypingCallback();
            }
            else {
                if (!typingTimeout) {
                    socket.emit("isTyping");
                }
                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                }
                typingTimeout = setTimeout(stopTypingCallback, 1500);
            }
        });
        $("#messageBox").get(0).addEventListener("paste", function (e) {
            var items = e.clipboardData.items;
            if (!items) {
                return;
            }
            var types = e.clipboardData.types;
            var typeList = [];
            for (var i = 0; i < types.length; i++) {
                typeList.push(types[i]);
            }
            var _loop_1 = function (i) {
                if (items[i].type.indexOf("image") !== -1) {
                    var data = void 0;
                    if (typeList.indexOf("text/html") != -1) {
                        data = e.clipboardData.getData("text/html");
                        socket.emit("chatImage", data);
                    }
                    else {
                        try {
                            var blob = items[i].getAsFile();
                            if (!blob) {
                                throw Error();
                            }
                            var reader_1 = new FileReader();
                            reader_1.readAsDataURL(blob);
                            reader_1.onloadend = function () {
                                socket.emit("chatImage", reader_1.result);
                            };
                        }
                        catch (e) {
                            console.log("[ERROR] Failed to process image file");
                        }
                    }
                }
            };
            for (var i = 0; i < items.length; i++) {
                _loop_1(i);
            }
        });
        var dummyUsers = {};
        function onPageFocus() {
            unreadMessages = 0;
            document.title = defaultTitle;
        }
        $(document).focus(onPageFocus);
        window.addEventListener("focus", onPageFocus);
        function processMessage(name, content) {
            if (!dummyUsers.hasOwnProperty(name)) {
                dummyUsers[name] = new Profile_1.User(name, name + " da Silva", name + "@chatBox.com", "123456");
            }
            var message = MessageFactory_1.MessageFactory.getInstance(content, dummyUsers[name], new Date());
            chat.addMessage(message, function () {
                $("#chatBox").scrollTop(1e10);
            });
        }
        socket.on("menu", function (id) {
            console.log("[OPEN MENU]", id);
        });
        socket.on("sendMessage", processMessage);
        socket.on("chatMessage", function (name, content) {
            if (!document.hasFocus()) {
                unreadMessages++;
                document.title = "(" + unreadMessages + ") " + defaultTitle;
                audio.play();
            }
            processMessage(name, content);
        });
        socket.on("isTyping", function (user) {
            $("#typingCell").html(user + " is typing...");
        });
        socket.on("stoppedTyping", function () {
            $("#typingCell").html("&nbsp;");
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
        socket.on("clearChatbox", function () {
            chat.clear();
        });
        socket.on("mute", function () {
            audio.mute();
        });
        socket.on("unmute", function () {
            audio.unmute();
        });
    });
});
