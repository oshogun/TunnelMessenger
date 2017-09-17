import {Chat} from "./Chat"
import {Settings} from "./Settings"
import {User, UserType} from "./User"
import {utils} from "./Utils"

export interface Message {
	display(node: HTMLElement, callback?: () => void): void;
	setChat(chat: Chat): void;
	setId(id: string): void;
	getAuthor(): User;
	getDatetime(): Date;
}

abstract class StandardMessage implements Message {
	constructor(content: string, author: User, datetime: Date) {
		this.content = content;
		this.author = author;
		this.datetime = datetime;
	}

	abstract display(node: HTMLElement, callback?: () => void): void;

	public setChat(chat: Chat) {
		this.chat = chat;
	}

	public setId(id: string) {
		this.id = id;
	}

	public getAuthor(): User {
		return this.author;
	}

	public getDatetime(): Date {
		return this.datetime;
	}

	protected author: User;
	protected chat: Chat|null = null;
	protected content: string;
	protected datetime: Date;
	protected id: string|null = null;
}

export class TextMessage extends StandardMessage {
	constructor(content: string, author: User, datetime: Date) {
		super(content, author, datetime);
	}

	public display(node: HTMLElement, callback?: () => void): void {
		node.innerHTML = this.content;
		if (callback) {
			callback();
		}
	}
}

export class ImageMessage extends StandardMessage {
	constructor(url: string, author: User, datetime: Date) {
		super(url, author, datetime);
	}

	public display(node: HTMLElement, callback?: () => void): void {
		let container = document.createElement("img");
		container.style.maxHeight = Settings.IMAGE_MAX_HEIGHT;
		container.style.maxWidth = Settings.IMAGE_MAX_WIDTH;
		container.src = this.content;
		if (callback) {
			container.addEventListener("load", callback, false);
		}
		node.appendChild(container);
	}
}

export class InviteMessage extends StandardMessage {
	constructor(content: string, author: User, datetime: Date) {
		super(content, author, datetime);
	}

	public display(node: HTMLElement, callback?: () => void): void {
		node.innerHTML = this.content;

		let controls = utils.create("div", {
			className: "invite"
		});

		let acceptButton = utils.create("input", {
			className: "button accept_button",
			type: "button",
			value: "Accept"
		});

		let rejectButton = utils.create("input", {
			className: "button reject_button",
			type: "button",
			value: "Decline"
		});

		let id = this.id;
		let socketHandler = this.chat!.getSocketHandler();

		acceptButton.addEventListener("click", function() {
			socketHandler.emit("acceptInvite", id);
			controls.innerHTML = "Accepted.";
		});

		rejectButton.addEventListener("click", function() {
			socketHandler.emit("rejectInvite", id);
			controls.innerHTML = "Declined.";
		});

		controls.appendChild(acceptButton);
		controls.appendChild(rejectButton);
		node.appendChild(controls);

		if (callback) {
			callback();
		}
	}
}
