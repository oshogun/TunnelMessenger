/// <reference path="../../node_modules/@types/es6-promise/index.d.ts" />

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

function delay(time: number): Promise<void> {
	return new Promise<void>(function(resolve, reject) {
		setTimeout(resolve, time);
	});
}

export class Game {
	constructor(socket: any, playerIndex: number, url: string, id: string) {
		this.socket = socket;
		this.playerIndex = playerIndex;
		this.url = url;
		this.id = id;
	}

	public launch(width: number, height: number): void {
		let iframe = this.adjustUI(width, height);
		this.catchNetworkInstance(iframe);
	}

	public abort(): void {
		$("#gameContainer").remove();

		let userList = document.getElementById("userList")!;
		userList.style.display = "";
	}

	public receiveData(data: any): void {
		this.network.receive(data);
	}

	private adjustUI(width: number, height: number): HTMLIFrameElement {
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

		return iframe;
	}

	private catchNetworkInstance(iframe: HTMLIFrameElement): void {
		let id = this.id;
		let playerIndex = this.playerIndex;
		let socket = this.socket;
		let self = this;

		let attempt = function() {
			delay(100).then(function() {
				let network = <Network> iframe.contentWindow["network"];
				if (!network) {
					return attempt();
				}

				self.network = network;

				network.setProxy({
					send: function(data: any) {
						socket.emit("gameData", id, playerIndex, data);
					}
				});
			});
		};

		$(iframe).ready(attempt);
	}

	private id: string;
	private network: Network;
	private playerIndex: number;
	private socket: any;
	private url: string;
}
