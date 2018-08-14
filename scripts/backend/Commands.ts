import {NetworkManager} from "./NetworkManager"
import {packageIndex} from "./PackageIndex"
import {UnorderedSet} from "../shared/UnorderedSet"

export interface Command {
    // Should other people see this command?
    broadcast: boolean;

    // Message shown by /help
    description: string;

    // If this command takes arguments, how many does it take? (can be a range)
    parameters?: number|[number, number];

    // Code executed by the command. If a string is returned,
    // it is either echoed by the SERVER (if it's a "TEXT: "
    // message) or transmitted to the users (depending on
    // the "secret" attribute)
    result: string|((...args: any[]) => string)|Function;

    // Should the output of this command be shown only to the user who typed it?
    secret: boolean;
}

export type CommandGroup = {[name: string]: Command};
export type Workspace = {[functionName: string]: Function};

export interface CommandPackage {
    generateCommands: (networkManager: NetworkManager, workspace: Workspace) => CommandGroup;
}

export class CommandLoader {
    public addPackage(packageName: string,
        networkManager: NetworkManager, workspace: Workspace): void {

        if (!this.loadedPackages.contains(packageName)) {
            if (this.packageExists(packageName)) {
                this.packages.push(packageIndex[packageName]);
                this.load(this.packages.length - 1, networkManager, workspace);
                this.loadedPackages.insert(packageName);
            } else {
                console.log("[WARNING] Tried to load a non-existing package '" + packageName + "'");
            }
        }
    }

    public removePackage(packageName: string,
        networkManager: NetworkManager, workspace: Workspace): void {

        let commandPackage = packageIndex[packageName];
        for (let i = 0; i < this.packages.length; i++) {
            if (this.packages[i] == commandPackage) {
                let commandList = commandPackage.generateCommands(networkManager, workspace);
                for (var name in commandList) {
                    if (commandList.hasOwnProperty(name)) {
                        delete this.commands[name];
                    }
                }

                this.packages.splice(i, 1);
                this.loadedPackages.erase(packageName);
                break;
            }
        }
    }

    public isPackageLoaded(packageName: string): boolean {
        return this.loadedPackages.contains(packageName);
    }

    public getCommand(message: string): Command|null {
        let messagePieces = message.split(" ");
        if (!this.commands.hasOwnProperty(messagePieces[0])) {
            return null;
        }

        return this.commands[messagePieces[0]];
    }

    public parseParameters(message: string): string[] {
        let firstSpace = message.indexOf(" ");
        let paramString = message.substr(firstSpace + 1).trim();

        let parameters: string[] = [];
        let buffer = "";
        let quotedString = false;
        let i = 0;
        while (i < paramString.length) {
            let char = paramString[i];

            if (char == '"' && buffer.length == 0) {
                quotedString = true;
                i++;
                continue;
            }

            let isLastChar = (i == paramString.length - 1);
            if (char == '"' && (isLastChar || message[i + 1] == " ")) {
                // closes the string, allow the parameter to end
                quotedString = false;
                i++;
                continue;
            }

            if (char == " " && !quotedString) {
                // marks the end of the parameter
                parameters.push(buffer);
                buffer = "";
                i++;
                continue;
            }

            buffer += char;
            i++;
        }

        // pushes the last parameter if it exists
        if (buffer.length > 0) {
            parameters.push(buffer);
        }

        return parameters;
    }

    public getAllCommands(): CommandGroup {
        return this.commands;
    }

    private load(index: number, networkManager: NetworkManager,
        workspace: Workspace) {

        let commandPackage = this.packages[index];
        let newCommands = commandPackage.generateCommands(networkManager, workspace);
        for (let commandName in newCommands) {
            if (this.commands.hasOwnProperty(commandName)) {
                throw Error("Conflicting command '" + commandName + "'");
            }

            this.commands[commandName] = newCommands[commandName];
        }
    }

    private packageExists(packageName: string): boolean {
        return packageIndex.hasOwnProperty(packageName);
    }

    private commands: CommandGroup = {};
    private packages: CommandPackage[] = [];
    private loadedPackages = new UnorderedSet<string>();
}
