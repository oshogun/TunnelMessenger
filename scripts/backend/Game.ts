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
			this.sendToPlayer(i, "gameLaunch", i, url, this.id,
				dimensions[0], dimensions[1]);
		}
	}

	public receiveData(senderIndex: number, data: any): void {
		for (let i = 0; i < this.players.length; i++) {
			if (i != senderIndex) {
				this.sendToPlayer(i, "gameData", data);
			}
		}
	}

	private sendToPlayer(playerIndex: number, type: string,
		...otherArgs: any[]): void {

		let networkManager = this.networkManager;
		let receivers = [this.players[playerIndex]];
		networkManager.sendToSockets(receivers, type, ...otherArgs);
	}

	private id: string;
	private networkManager: NetworkManager;
	private players: SocketId[];
	private workspace: Workspace;
}
