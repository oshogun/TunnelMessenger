import {Game} from "./Game"
import {gameInfoTable} from "./GameInfo"
import {Workspace} from "./Commands"
import {NetworkManager} from "./NetworkManager"
import {SocketId} from "./Settings"

export enum PlayerJoinStatus {
	SUCCESS,
	WRONG_PASSWORD,
	TOO_MANY_PLAYERS,
	NON_EXISTING_GAME_ROOM
}

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

	public addPlayer(playerSocket: SocketId, password?: string): PlayerJoinStatus {
		if (this.password !== undefined && password !== this.password) {
			return PlayerJoinStatus.WRONG_PASSWORD;
		}

		let gameInfo = gameInfoTable[this.gameName];
		let playerCount = this.getPlayerCount();
		if (playerCount == gameInfo.maxPlayers) {
			return PlayerJoinStatus.TOO_MANY_PLAYERS;
		}

		// let networkManager = this.networkManager;
		// networkManager.sendToSockets([playerSocket], "gameLaunch", -1,
		// 	this.url(), this.id, ...this.dimensions());
		// this.spectators.push(playerSocket);
		this.players.push(playerSocket);
		return PlayerJoinStatus.SUCCESS;
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

	private getPlayerCount(): number {
		return 1 + this.players.length;
	}

	private gameName: string;
	private id: string;
	private networkManager: NetworkManager;
	private password: string|undefined;
	private players: SocketId[] = [];
	private roomLeader: SocketId;
}
