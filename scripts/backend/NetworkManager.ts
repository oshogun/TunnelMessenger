import {MessageTarget} from "./MessageTarget"
import {SocketId} from "./Settings"
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

    public sendToSockets(socketIds: SocketId[], type: string,
        ...otherArgs: any[]): void {

        let emitter: any = this.io;
        for (let id of socketIds) {
            emitter = emitter.to(id);
        }

        let args = [type].concat(otherArgs);
        emitter.emit.apply(emitter, args);
    }

    public serverToSender(message: string, id?: string): void {
        this.socket.emit("chatMessage", this.server(), message, id);
    }

    public serverBroadcast(message: string, id?: string): void {
        this.io.emit("chatMessage", this.server(), message, id);
    }

    public serverToUser(targetUser: string, message: string, id?: string): void {
        let targetSocketId = this.userManager.getSocketId(targetUser);
        let emitter = this.io.to(targetSocketId);
        emitter.emit("chatMessage", this.server(), message, id);
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

    public id(): SocketId {
        return this.socket.id;
    }

    private server(): string {
        return this.getName("0");
    }

    private getName(socketId: SocketId): string {
        return this.userManager.getName(socketId);
    }

    private nicknames() {
        return this.userManager.getNicknames();
    }

    private io: any;
    private socket: any;
    private userManager: UserManager;
}
