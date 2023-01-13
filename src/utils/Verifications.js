export class Verifications {
	verifyEmail(email) {
		return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
	}

	validatePassword(password) {
		return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password);
	}

	validateUsername(username) {
		return /^[a-zA-Z0-9._-]{3,15}$/.test(username);
	}
	checkLength(text, length) {
		return text.length <= length;
	}
}
