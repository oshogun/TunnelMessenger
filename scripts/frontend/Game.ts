import {utils} from "../shared/Utils"

export class Game {
	constructor(url: string) {
		this.url = url;
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
	}

	private url: string;
}
