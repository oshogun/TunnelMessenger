import {Workspace} from "./Commands"
import {NetworkManager} from "./NetworkManager"
import {SocketId} from "./Settings"

const frameSizeTable = {
	"chess": [730, 738]
};

export class Game {
	constructor(networkManager: NetworkManager, workspace: Workspace,
		from: SocketId, to: SocketId) {

		this.networkManager = networkManager;
		this.workspace = workspace;
		this.players = [from, to];
	}

	public launch(gameName: string): void {
		if (!frameSizeTable.hasOwnProperty(gameName)) {
			throw Error("Failed to find the correct frame size");
		}

		let url = "/games/" + gameName + "/index.html";
		let dimensions = frameSizeTable[gameName];
		this.sendToPlayers("gameLaunch", url, dimensions[0], dimensions[1]);
	}

	private sendToPlayers(type: string, ...otherArgs: any[]): void {
		let networkManager = this.networkManager;
		networkManager.sendToSockets(this.players, type, ...otherArgs);
	}

	private networkManager: NetworkManager;
	private players: SocketId[];
	private workspace: Workspace;
}
