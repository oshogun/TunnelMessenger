import {NetworkManager} from "./NetworkManager"

export interface Command {
    // Should other people see this command?
    broadcast: boolean;

    // Message shown by /help
    description: string;

    // If this command takes arguments, how many does it take?
    parameters?: number;

    // Code executed by the command. If a string is returned,
    // it is either echoed by the SERVER (if it's a "TEXT: "
    // message) or transmitted to the users (depending on
    // the "secret" attribute)
    result: string|((...args: any[]) => string)|Function;

    // Should the output of this command be shown only to the user who typed it?
    secret?: boolean;
}

export type CommandGroup = {[name: string]: Command};
export type Workspace = {[functionName: string]: Function};

export interface CommandPackage {
    generateCommands: (networkManager: NetworkManager, workspace: Workspace) => CommandGroup;
}

export class CommandLoader {
    public addPackage(commandPackage: CommandPackage,
        networkManager: NetworkManager, workspace: Workspace): void {

        this.packages.push(commandPackage);
        this.loadedPackages.push(false);
        this.load(this.packages.length - 1, networkManager, workspace);
    }

    public getCommand(message: string): Command|null {
        let messagePieces = message.split(" ");
        if (!this.commands.hasOwnProperty(messagePieces[0])) {
            return null;
        }

        return this.commands[messagePieces[0]];
    }

    private load(index: number, networkManager: NetworkManager,
        workspace: Workspace) {

        if (!this.loadedPackages[index]) {
            let commandPackage = this.packages[index];
            let newCommands = commandPackage.generateCommands(networkManager, workspace);
            for (let commandName in newCommands) {
                if (this.commands.hasOwnProperty(commandName)) {
                    throw Error("Conflicting command '" + commandName + "'");
                }

                this.commands[commandName] = newCommands[commandName];
            }
        }
    }

    private commands: CommandGroup = {};
    private packages: CommandPackage[] = [];
    private loadedPackages: boolean[] = [];
}
