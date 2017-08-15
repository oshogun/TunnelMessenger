export class User {
    constructor(nickname: string, fullName: string, email: string) {
        this.nickname = nickname;
        this.fullName = fullName;
        this.email = email;
        this.subnick = "";
    }

    getNickname(): string {
        return this.nickname;
    }

    getFullName(): string {
        return this.fullName;
    }

    getEmail(): string {
        return this.email;
    }

    getSubnick(): string {
        return this.subnick;
    }

    private nickname: string;
    private fullName: string;
    private email: string;
    private subnick: string;
}
