
export class Audio {
	constructor(path: string, parentNode: HTMLElement) {
		let node = document.createElement("audio");
		node.preload = "auto";
		node.src = path;

		this.node = node;
		parentNode.appendChild(this.node);
	}

	play(): void {
		this.node.play();
	}

	private node: HTMLAudioElement = null;
}
