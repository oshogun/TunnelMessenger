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

function runQuery(connection: MySqlConnection, query: string,
    params?: string[]): Promise<[any, any]> {

    return new Promise(function(resolve, reject) {
        connection.query(query, params, function(error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve([results, fields]);
            }
        });

        connection.end();
    });
}

export namespace UserPersistence {
    export function verify(username: string, password: string): Promise<boolean> {
        return getConnection().then(function(connection) {
            let query = "SELECT * FROM `users` WHERE `username` = ? AND `password` = ?";
            return runQuery(connection, query, [username, password]);
        }).then(function(data) {
            let [results, fields] = data;
            return (results.length != 0);
        });
    }

    export function register(user: User): Promise<boolean> {
        let nickname = user.getNickname();
        let fullName = user.getFullName();
        let email = user.getEmail();
        let password = user.getPassword();

        let query = "INSERT INTO users(username, nickname, fullName, email, password)\
                     VALUES('" + nickname +"','" + nickname + "','" + fullName + "',\
                     '"+ email +"','" + password +"')";

        return findUser(user).then(function(found) {
            if (found) {
                return false;
            }

            return getConnection().then(function(connection) {
                return runQuery(connection, query);
            }).then(function(data) {
                console.log(query);
                return true;
            });
        });
    }

    function findUser(user: User): Promise<boolean> {
        return getConnection().then(function(connection) {
            let query = "SELECT * FROM `users` WHERE `username` = ?";
            return runQuery(connection, query, [user.getNickname()]);
        }).then(function(data) {
            let [results, fields] = data;
            console.log(results);
            return (results.length != 0);
        });
    }
}
