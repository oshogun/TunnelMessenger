declare function require(name:string);

export class User {
    constructor(nickname: string, fullName: string, email: string, password:string) {
        this.nickname = nickname;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.subnick = "";
        this.mysql = require("mysql");
        this.fs = require("fs");
    }

    getNickname(): string {
        return this.nickname;
    }

    getFullName(): string {
        return this.fullName;
    }

    getEmail(): string {
        return this.email;
    }

    getSubnick(): string {
        return this.subnick;
    }

    display(node: HTMLElement): void {
        node.innerHTML = this.nickname;
    }

    findUser(callback):void {
        let self = this;
        this.fs.readFile('credentials.json', 'utf8', function(err, data) {
            if(err) {
                throw err;
            }
            let connection = self.mysql.createConnection(JSON.parse(data));
            let query = "SELECT * FROM `users` WHERE `username` = ?";
            let found: boolean;
            connection.query({sql:query, values:[self.nickname]}, function(error, results, fields){
                if(error) {
                    throw error;
                }
                if(results.length != 0) {
                    found = true;
                } else {
                    found = false;
                }
                console.log(results);
                callback(found);
            });     
        });
    }
    registerUser(callback):void {
        let self=this;
        this.fs.readFile('credentials.json', 'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            let connection = self.mysql.createConnection(JSON.parse(data));
            connection.connect();
            self.findUser(function(found){
                if (!found) {
                let query = "INSERT INTO users(username, nickname, fullName, email, password)\
                             VALUES('" + self.nickname +"','" + self.nickname + "','" + self.fullName + "',\
                             '"+ self.email +"','" + self.password +"')";
                connection.query(query, function(error) {
                    if(error) {
                        throw error;
                    }
                    console.log(query);
                    callback(true);
                });
                connection.end();
                } else {
                    callback(false);
                }
            });    
        });       
    }


    private nickname: string;
    private fullName: string;
    private email: string;
    private subnick: string;
    private password: string;
    private mysql;
    private fs;
}
