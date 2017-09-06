import {MessageTarget} from "./MessageTarget"
import {UserManager} from "./UserManager"

export class NetworkManager {
    constructor(io: any, socket: any, userManager: UserManager) {
        this.io = io;
        this.socket = socket;
        this.userManager = userManager;
    }

    public send(target: MessageTarget, type: string, ...otherArgs: any[]): void {
        let io = this.io;
        let socket = this.socket;
        let method: (...args: any[]) => void;
        let proxy: any;

        switch (target) {
            case MessageTarget.SENDER:
                method = socket.emit;
                proxy = socket;
                break;
            case MessageTarget.OTHERS:
                method = socket.broadcast.emit;
                proxy = socket.broadcast;
                break;
            case MessageTarget.EVERYONE:
                method = io.emit;
                proxy = io;
                break;
            default:
                throw Error("Unknown MessageTarget: '" + target + "'");
        }

        let args = [type, this.user()].concat(otherArgs);
        method.apply(proxy, args);
    }

    public serverToSender(message): void {
        this.socket.emit("chatMessage", this.getName(0), message);
    }

    public serverBroadcast(message): void {
        this.io.emit("chatMessage", this.getName(0), message);
    }

    public login(name: string): void {
        this.userManager.login(this.id(), name);
        this.send(MessageTarget.EVERYONE, "changeNick", this.nicknames());
    }

    public logout(): void {
        this.userManager.logout(this.id());
        this.send(MessageTarget.EVERYONE, "changeNick", this.nicknames());
    }

    public renameUser(newName: string): void {
        this.userManager.renameUser(this.id(), newName);
        this.send(MessageTarget.EVERYONE, "changeNick", this.nicknames());
    }

    public user(): string {
        return this.getName(this.id());
    }

    private getName(socketId: number): string {
        return this.userManager.getName(socketId);
    }

    private nicknames() {
        return this.userManager.getNicknames();
    }

    private id(): number {
        return this.socket.id;
    }

    private io: any;
    private socket: any;
    private userManager: UserManager;
}
