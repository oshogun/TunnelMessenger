import {Game} from "./Game"
import {Workspace} from "./Commands"
import {NetworkManager} from "./NetworkManager"
import {SocketId} from "./Settings"

export class GameRoom {
	constructor(networkManager: NetworkManager, id: string,
		roomLeader: SocketId, gameName: string, password?: string) {

		this.gameName = gameName;
		this.id = id;
		this.networkManager = networkManager;
		this.password = password;
		this.roomLeader = roomLeader;
	}

	public startGame(): Game {
        return new Game(this.networkManager, this.id,
            this.getPlayerSockets(), this.gameName);
	}

	public addPlayer(playerSocket: SocketId, password?: string): boolean {
		if (this.password === undefined || password === this.password) {
			let allowed: boolean = false;
			allowed = allowed || (password === undefined && !this.hasPassword());

			// let networkManager = this.networkManager;
			// networkManager.sendToSockets([playerSocket], "gameLaunch", -1,
			// 	this.url(), this.id, ...this.dimensions());
			// this.spectators.push(playerSocket);
			this.players.push(playerSocket);
			return true;
		}

		return false;
	}

	public removePlayer(playerSocket: SocketId): void {
		if (this.isRoomLeader(playerSocket)) {
			this.players = [];
			return;
		}

		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i] == playerSocket) {
				// let networkManager = this.networkManager;
				// networkManager.sendToSockets([playerSocket], "gameAbort");

				this.players.splice(i, 1);
				break;
			}
		}
	}

	public getGameName(): string {
		return this.gameName;
	}

	public getId(): string {
		return this.id;
	}

	public isRoomLeader(playerSocket: SocketId): boolean {
		return this.roomLeader == playerSocket;
	}

	public getPlayerSockets(): SocketId[] {
		return [this.roomLeader].concat(this.players);
	}

	public hasPassword(): boolean {
		return this.password !== undefined;
	}

	private gameName: string;
	private id: string;
	private networkManager: NetworkManager;
	private password: string|undefined;
	private players: SocketId[] = [];
	private roomLeader: SocketId;
}
