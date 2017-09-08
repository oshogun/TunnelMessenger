"use strict";
exports.__esModule = true;
var Settings_1 = require("./Settings");
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
