import {SocketId} from "./Settings"

export class UserManager {
    public addUser(socketId: SocketId, name: string): void {
        this.connectedUsers[socketId] = name;
    }

    public login(socketId: SocketId, name: string): void {
        this.connectedUsers[socketId] = name;
        this.nicknames.push([socketId, name]);
    }

    public logout(socketId: SocketId): void {
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames.splice(i, 1);
                break;
            }
        }

        delete this.connectedUsers[socketId];
    }

    public renameUser(socketId: SocketId, newName: string): void {
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames[i][1] = newName;
            }
        }

        this.connectedUsers[socketId] = newName;
    }

    public getName(socketId: SocketId) {
        return this.connectedUsers[socketId];
    }

    public getNicknames(): [SocketId, string][] {
        return this.nicknames;
    }

    public getSocketId(username: string): SocketId|null {
        for (let socketId in this.connectedUsers) {
            if (this.connectedUsers.hasOwnProperty(socketId)) {
                if (this.connectedUsers[socketId] == username) {
                    return socketId;
                }
            }
        }

        return null;
    }

    private connectedUsers: {[socketId: string]: string} = {};
    private nicknames: [SocketId, string][] = [];
}
