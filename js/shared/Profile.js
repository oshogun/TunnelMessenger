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
