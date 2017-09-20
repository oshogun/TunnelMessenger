import {gameInfoTable, GameInfo} from "./GameInfo"
import {Workspace} from "./Commands"
import {NetworkManager} from "./NetworkManager"
import {SocketId} from "./Settings"

export class Game {
	constructor(networkManager: NetworkManager, id: string,
		players: SocketId[], gameName: string) {

		this.networkManager = networkManager;
		this.id = id;
		this.players = players;
		this.gameName = gameName;
	}

	public canLaunch(): boolean {
		let gameInfo = this.info();
		let minPlayers = gameInfo.minPlayers;
		let maxPlayers = gameInfo.maxPlayers;

		let playerCount = this.getPlayerCount();
		return (playerCount >= minPlayers && playerCount <= maxPlayers);
	}

	public launch(): void {
		if (!this.canLaunch()) {
			throw Error("Cannot launch game");
		}

		for (let i = 0; i < this.players.length; i++) {
			this.sendToPlayers([i], "gameLaunch", i, this.url(),
				this.id, ...this.dimensions());
		}
	}

	public abort(): void {
		let receivers: number[] = [];
		for (let i = 0; i < this.players.length; i++) {
			receivers.push(i);
		}

		this.sendToPlayers(receivers, "gameAbort");
		this.sendToSpectators("gameAbort");
	}

	public addSpectator(playerSocket: SocketId): void {
		let networkManager = this.networkManager;
		networkManager.sendToSockets([playerSocket], "gameLaunch", -1,
			this.url(), this.id, ...this.dimensions());
		this.spectators.push(playerSocket);
	}

	public removeSpectator(playerSocket: SocketId): void {
		for (let i = 0; i < this.spectators.length; i++) {
			if (this.spectators[i] == playerSocket) {
				let networkManager = this.networkManager;
				networkManager.sendToSockets([playerSocket], "gameAbort");

				this.spectators.splice(i, 1);
				break;
			}
		}
	}

	public receiveData(senderIndex: number, data: any): void {
		let receivers: number[] = [];
		for (let i = 0; i < this.players.length; i++) {
			if (i != senderIndex) {
				receivers.push(i);
			}
		}

		this.sendToPlayers(receivers, "gameData", data);
		this.sendToSpectators("gameData", data);
	}

	public getPlayerSockets(): SocketId[] {
		return this.players;
	}

	public getName(): string {
		return this.gameName;
	}

	public info(): GameInfo {
		if (!gameInfoTable.hasOwnProperty(this.gameName)) {
			throw Error("Failed to retrieve the game information");
		}

		return gameInfoTable[this.gameName];
	}

	private sendToPlayers(indexList: number[], type: string,
		...otherArgs: any[]): void {

		let players = this.players;
		let receivers = indexList.map(function(index) {
			return players[index];
		});

		let networkManager = this.networkManager;
		networkManager.sendToSockets(receivers, type, ...otherArgs);
	}

	private sendToSpectators(type: string, ...otherArgs: any[]): void {
		this.networkManager.sendToSockets(this.spectators, type, ...otherArgs);
	}

	private getPlayerCount(): number {
		return this.players.length;
	}

	private url(): string {
		return "/games/" + this.gameName + "/index.html";
	}

	private dimensions(): [number, number] {
		return this.info().dimensions;
	}

	private id: string;
	private gameName: string;
	private networkManager: NetworkManager;
	private players: SocketId[];
	private spectators: SocketId[] = [];
}
