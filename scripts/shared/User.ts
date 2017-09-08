
export class User {
    constructor(nickname: string, fullName: string, email: string, password: string) {
        this.nickname = nickname;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.subnick = "";
    }

    public getNickname(): string {
        return this.nickname;
    }

    public getFullName(): string {
        return this.fullName;
    }

    public getEmail(): string {
        return this.email;
    }

    public getSubnick(): string {
        return this.subnick;
    }

    public getPassword(): string {
        return this.password;
    }

    public display(node: HTMLElement): void {
        node.innerHTML = this.nickname;
    }

    private nickname: string;
    private fullName: string;
    private email: string;
    private subnick: string;
    private password: string;
}
