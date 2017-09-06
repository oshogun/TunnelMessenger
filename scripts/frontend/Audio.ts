
export class Audio {
	constructor(path: string, parentNode: HTMLElement) {
		let node = document.createElement("audio");
		node.preload = "auto";
		node.src = path;

		this.node = node;
		parentNode.appendChild(this.node);
	}

	public play(): void {
		if (this.hasSound) {
			this.node.play();
		}
	}

	public mute(): void {
		this.hasSound = false;
	}

	public unmute(): void {
		this.hasSound = true;
	}

	private node: HTMLAudioElement;
	private hasSound: boolean = true;
}
