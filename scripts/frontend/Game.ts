import {utils} from "../shared/Utils"

type Callback = (data: any) => void;
type Proxy = {
	send: Callback;
};

interface Network {
	setProxy(proxy: Proxy): void;
	send(data: any): void;
	receive(data: any): void;
}

export class Game {
	constructor(socket: any, playerIndex: number, url: string, id: string) {
		this.socket = socket;
		this.playerIndex = playerIndex;
		this.url = url;
		this.id = id;
	}

	public launch(width: number, height: number): void {
		let container = utils.create("div", {
			id: "gameContainer"
		});

		let iframe = <HTMLIFrameElement> utils.create("iframe", {
			height: height.toString(),
			id: "gameFrame",
			src: this.url,
			width: width.toString()
		});
		container.appendChild(iframe);

		let userList = document.getElementById("userList")!;
		userList.style.display = "none";

		let chat = document.getElementById("chat")!;
		$(container).insertAfter(chat);

		let id = this.id;
		let playerIndex = this.playerIndex;
		let socket = this.socket;
		let self = this;

		$(iframe).ready(function() {
			let network = <Network> iframe.contentWindow["network"];
			self.network = network;

			network.setProxy({
				send: function(data: any) {
					socket.emit("gameData", id, playerIndex, data);
				}
			});
		});
	}

	public receiveData(data: any): void {
		this.network.receive(data);
	}

	private id: string;
	private network: Network;
	private playerIndex: number;
	private socket: any;
	private url: string;
}
