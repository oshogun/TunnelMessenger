
export class NetworkManager {
    constructor(io: any) {
        this.io = io;
    }

    public connect(callback: (socket: any) => void): void {
        let self = this;
        this.io.on("connection", function(socket) {
            self.socket = socket;
            callback(socket);
        });
    }

    public sendToSender(type, ...otherArgs: any[]): void {
        let socket = this.socket;
        socket.emit.apply(socket, [type, this.user()].concat(otherArgs));
    }

    public sendToOthers(type, ...otherArgs: any[]): void {
        let socket = this.socket;
        socket.broadcast.emit.apply(socket.broadcast, [type, this.user()].concat(otherArgs));
    }

    public broadcast(type, ...otherArgs: any[]): void {
        let io = this.io;
        let socket = this.socket;
        io.emit.apply(io, [type, this.user()].concat(otherArgs));
    }

    public serverToSender(message): void {
        this.socket.emit("chatMessage", this.connectedUsers[0], message);
    }

    public serverBroadcast(message): void {
        this.io.emit("chatMessage", this.connectedUsers[0], message);
    }

    public addExternalUser(socketId: number, name: string): void {
        this.connectedUsers[socketId] = name;
    }

    public login(name: string): void {
        let id = this.id();
        this.connectedUsers[id] = name;
        this.nicknames.push([id, name]);
        this.broadcast("changeNick", this.nicknames);
    }

    public logout(): void {
        let id = this.id();
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == id) {
                this.nicknames.splice(i, 1);
                break;
            }
        }

        delete this.connectedUsers[id];
        this.broadcast("changeNick", this.nicknames);
    }

    public renameUser(newName: string): void {
        let id = this.id();
        // update the list of nicks
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == id) {
                this.nicknames[i][1] = newName;
            }
        }

        // update the actual user's nick
        this.connectedUsers[id] = newName;

        // inform other clients
        this.broadcast("changeNick", this.nicknames);
    }

    public user(): string {
        return this.connectedUsers[this.id()];
    }

    private id(): number {
        return this.socket.id;
    }

    private io: any;
    private socket: any;
    private connectedUsers: {[socketId: number]: string} = {};
    private nicknames: [number, string][] = [];
}
