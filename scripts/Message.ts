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
