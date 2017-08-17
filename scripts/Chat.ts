import {Message} from "./Message"
import {User} from "./Profile"
import {utils} from "./Utils"

export class Chat {
    constructor(name: string, users: User[], node: HTMLElement) {
        this.name = name;
        this.users = users;
        this.node = node;
    }

    addMessage(message: Message): void {
        let previousMessage = this.messages[this.messages.length - 1];
        this.messages.push(message);

        console.log("previous:", previousMessage);
        console.log("this:", message);
        if (!previousMessage || message.getAuthor() != previousMessage.getAuthor()) {
            console.log("[SPAWN]");
            this.spawnMessageBlock();
        }

        console.log("[MERGE]");
        this.mergeWithLastBlock(message);

        // for (let user of this.users) {
        //  if (user == message.getAuthor()) {
        //      this.messages.push(message);
        //      return;
        //  }
        // }

        // throw "This message does not belong to this conversation";
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

    private mergeWithLastBlock(message: Message): void {
        let contentContainer = <HTMLDivElement> utils.create("div", {
            className: "content"
        });

        message.display(contentContainer);
        this.lastMessageBlock.appendChild(contentContainer);
    }

    private name: string;
    private users: User[];
    private messages: Message[] = [];
    private lastMessageBlock: HTMLElement;
    private node: HTMLElement;
}
