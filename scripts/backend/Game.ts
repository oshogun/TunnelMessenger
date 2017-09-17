import {Workspace} from "./Commands"
import {NetworkManager} from "./NetworkManager"
import {SocketId} from "./Settings"

const frameSizeTable = {
	"chess": [730, 738]
};

export class Game {
	constructor(networkManager: NetworkManager, workspace: Workspace,
		id: string, from: SocketId, to: SocketId) {

		this.networkManager = networkManager;
		this.workspace = workspace;
		this.id = id;
		this.players = [from, to];
	}

	public launch(gameName: string): void {
		if (!frameSizeTable.hasOwnProperty(gameName)) {
			throw Error("Failed to find the correct frame size");
		}

		let url = "/games/" + gameName + "/index.html";
		let dimensions = frameSizeTable[gameName];

		for (let i = 0; i < this.players.length; i++) {
			this.sendToPlayers([i], "gameLaunch", i, url, this.id,
				dimensions[0], dimensions[1]);
		}
	}

	public abort(): void {
		let receivers: number[] = [];
		for (let i = 0; i < this.players.length; i++) {
			receivers.push(i);
		}

		this.sendToPlayers(receivers, "gameAbort");
	}

	public receiveData(senderIndex: number, data: any): void {
		let receivers: number[] = [];
		for (let i = 0; i < this.players.length; i++) {
			if (i != senderIndex) {
				receivers.push(i);
			}
		}

		this.sendToPlayers(receivers, "gameData", data);
	}

	public getPlayerSockets(): SocketId[] {
		return this.players;
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

	private id: string;
	private networkManager: NetworkManager;
	private players: SocketId[];
	private workspace: Workspace;
}
