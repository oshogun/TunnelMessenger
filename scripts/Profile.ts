declare function require(name:string);

export class User {
    constructor(nickname: string, fullName: string, email: string) {
        this.nickname = nickname;
        this.fullName = fullName;
        this.email = email;
        this.subnick = "";
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

    registerUser():void {
        let mysql = require("mysql");
        let connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'tunnel',
            password : '123456',
            database : 'TunnelMessenger'
        });

        connection.connect();
        let query = "INSERT INTO users(username, nickname, subnick, fullName, email)\
                     VALUES(" + this.nickname +"," + this.nickname + "," + this.subnick + ",\
                     "+ this.email +")";
        connection.query(query, function(error) {
            if(error) {
                throw error;
            }
            console.log(query);
        });
        connection.end;
    }

    private nickname: string;
    private fullName: string;
    private email: string;
    private subnick: string;
}
