import {Message} from "./Message"
import {User} from "./Profile"
import {utils} from "./Utils"

export class Chat {
    constructor(name: string, users: User[], node: HTMLElement) {
        this.name = name;
        this.users = users;
        this.node = node;
    }

    public addMessage(message: Message, callback?: () => void): void {
        let previousMessage = this.messages[this.messages.length - 1];
        this.messages.push(message);

        if (!previousMessage || message.getAuthor() != previousMessage.getAuthor()) {
            this.spawnMessageBlock();
        }

        this.mergeWithLastBlock(message, callback);

        // for (let user of this.users) {
        //  if (user == message.getAuthor()) {
        //      this.messages.push(message);
        //      return;
        //  }
        // }

        // throw "This message does not belong to this conversation";
    }

    public clear(): void {
        this.node.innerHTML = "";
        this.messages = [];
        this.lastMessageBlock = null;
    }

    private spawnMessageBlock(): void {
        let lastMessage = this.messages[this.messages.length - 1];

        let container = <HTMLDivElement> utils.create("div", {
            className: "messageBlock"
        });

        // Author
        let authorContainer = <HTMLDivElement> utils.create("div", {
            className: "author"
        });
        lastMessage.getAuthor().display(authorContainer);
        container.appendChild(authorContainer);

        // Datetime
        // container.appendChild(utils.create("div", {
        //  className: "datetime",
        //  innerHTML: lastMessage.getDatetime().toString()
        // }))

        this.node.appendChild(container);
        this.lastMessageBlock = container;
    }

    private mergeWithLastBlock(message: Message, callback?: () => void): void {
        let contentContainer = <HTMLDivElement> utils.create("div", {
            className: "content"
        });

        (<HTMLElement> this.lastMessageBlock).appendChild(contentContainer);
        message.display(contentContainer, callback);
    }

    private name: string;
    private users: User[];
    private messages: Message[] = [];
    private lastMessageBlock: HTMLElement|null;
    private node: HTMLElement;
}
