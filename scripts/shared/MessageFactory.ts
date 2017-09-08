import {Message, ImageMessage, TextMessage} from "./Message"
import {User} from "./User"

export class MessageFactory {
    static getInstance(fullMessage, author: User, date: Date): Message {
        let separator = fullMessage.indexOf(":");
        let type = fullMessage.substr(0, separator);
        let content = fullMessage.substr(separator + 2);

        let message: Message;
        switch (type) {
            case "TEXT":
                message = new TextMessage(content, author, date);
                break;
            case "IMAGE":
                message = new ImageMessage(content, author, date);
                break;
            default:
                throw Error("Unknown message type");
        }

        return message;
    }
}
