/// <reference path="../../node_modules/@types/es6-promise/index.d.ts" />

import {Settings} from "./Settings"
import {User} from "../shared/User"

declare function require(name: string);

let mysql = require("mysql");
let fs = require("fs");

type MySqlConnection = any;

function readCredentials(): Promise<string> {
    return new Promise(function(resolve, reject) {
        const file = Settings.CREDENTIALS_FILE;
        const encoding = Settings.CREDENTIALS_ENCODING;
        fs.readFile(file, encoding, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function getConnection(): Promise<MySqlConnection> {
    return readCredentials().then(function(data) {
        return mysql.createConnection(JSON.parse(data));
    });
}

export namespace UserPersistence {
    export function verify(username: string, password: string): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            getConnection().then(function(connection) {
                let query = "SELECT * FROM `users` WHERE `username` = ? AND `password` = ?";
                connection.query(query, [username, password],
                    function(error, results, fields) {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.length != 0);
                    }
                });
            });
        });
    }

    export function register(user: User): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            findUser(user).then(function(found) {
                if (found) {
                    resolve(false);
                    return;
                }

                getConnection().then(function(connection) {
                    let nickname = user.getNickname();
                    let fullName = user.getFullName();
                    let email = user.getEmail();
                    let password = user.getPassword();

                    let query = "INSERT INTO users(username, nickname, fullName, email, password)\
                                 VALUES('" + nickname +"','" + nickname + "','" + fullName + "',\
                                 '"+ email +"','" + password +"')";

                    connection.query(query, function(error) {
                        if (error) {
                            reject(error);
                        } else {
                            console.log(query);
                            resolve(true);
                        }
                    });

                    connection.end();
                });
            });
        });
    }

    function findUser(user: User): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            getConnection().then(function(connection) {
                let query = "SELECT * FROM `users` WHERE `username` = ?";
                connection.query({sql: query, values: [user.getNickname()]},
                    function(error, results, fields) {

                    if(error) {
                        reject(error);
                    } else {
                        console.log(results);
                        resolve(results.length != 0);
                    }
                });
            });
        });
    }
}
