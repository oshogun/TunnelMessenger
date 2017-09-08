"use strict";
exports.__esModule = true;
var Utils_1 = require("./Utils");
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
