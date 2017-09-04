
export class Audio {
	constructor(path: string, parentNode: HTMLElement) {
		let node = document.createElement("audio");
		node.preload = "auto";
		node.src = path;

		this.node = node;
		parentNode.appendChild(this.node);
	}

	play(): void {
		if (this.hasSound) {
			this.node.play();
		}
	}

	mute(): void {
		this.hasSound = false;
	}

	unmute(): void {
		this.hasSound = true;
	}

	private node: HTMLAudioElement = null;
	private hasSound: boolean = true;
}
