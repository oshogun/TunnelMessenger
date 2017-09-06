
export class UserManager {
    public addUser(socketId: number, name: string): void {
        this.connectedUsers[socketId] = name;
    }

    public login(socketId: number, name: string): void {
        this.connectedUsers[socketId] = name;
        this.nicknames.push([socketId, name]);
    }

    public logout(socketId: number): void {
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames.splice(i, 1);
                break;
            }
        }

        delete this.connectedUsers[socketId];
    }

    public renameUser(socketId: number, newName: string): void {
        for (let i = 0; i < this.nicknames.length; i++) {
            if (this.nicknames[i][0] == socketId) {
                this.nicknames[i][1] = newName;
            }
        }

        this.connectedUsers[socketId] = newName;
    }

    public getName(socketId: number) {
        return this.connectedUsers[socketId];
    }

    public getNicknames(): [number, string][] {
        return this.nicknames;
    }

    private connectedUsers: {[socketId: number]: string} = {};
    private nicknames: [number, string][] = [];
}
