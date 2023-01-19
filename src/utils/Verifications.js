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
	validateLink(link) {
		return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(link);
	}
}
