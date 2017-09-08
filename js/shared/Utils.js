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
