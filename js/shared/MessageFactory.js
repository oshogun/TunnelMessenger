"use strict";
exports.__esModule = true;
var Message_1 = require("./Message");
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
