import {Settings} from "./Settings"
import {User} from "./Profile"

export interface Message {
	display(node: HTMLElement): void;
	getAuthor(): User;
	getDatetime(): Date;
}

export class TextMessage implements Message {
	constructor(content: string, author: User, datetime: Date) {
		this.content = content;
		this.author = author;
		this.datetime = datetime;
	}

	display(node: HTMLElement): void {
		node.innerHTML = this.content;
	}

	getAuthor(): User {
		return this.author;
	}

	getDatetime(): Date {
		return this.datetime;
	}

	private author: User;
	private content: string;
	private datetime: Date;
}

export class ImageMessage implements Message {
	constructor(url: string, author: User, datetime: Date) {
		this.url = url;
		this.author = author;
		this.datetime = datetime;
	}

	display(node: HTMLElement): void {
		let container = document.createElement("img");
		container.style.maxHeight = Settings.IMAGE_MAX_HEIGHT;
		container.style.maxWidth = Settings.IMAGE_MAX_WIDTH;
		container.src = this.url;
		node.appendChild(container);
	}

	getAuthor(): User {
		return this.author;
	}

	getDatetime(): Date {
		return this.datetime;
	}

	private author: User;
	private url: string;
	private datetime: Date;
}
