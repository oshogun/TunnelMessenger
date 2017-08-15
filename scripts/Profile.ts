class User {
	private nickname: string;
	private fullName: string;
	private email: string;
	private subnick: string;

	constructor(nickname: string, fullName: string, email:string) {
		this.nickname = nickname;
		this.fullName = fullName;
		this.email = email;
		this.subnick = "";
	}

	getNickname() {
		return this.nickname;
	}

	getfullName() {
		return this.fullName;
	}

	getEmail() {
		return this.email;
	}

	getSubnick() {
		return this.subnick;
	}
}