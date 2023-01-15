export function truncateText(text, limit) {
	return text && `${text.substring(0, limit)}${text.length > limit ? "..." : ""}`;
}

export function removeSpaces(text) {
	if (text) {
		let newText = text.replace(/  +/g, " ");
		return newText.split(" ").join("-");
	}
	return;
}
export function removeHTML(str) {
	let doc = new DOMParser().parseFromString(str, "text/html");
	return doc.body.textContent || "";
}

export function removeSpecialChars(str) {
	return str.replace(/[^a-zA-Z0-9 ]/g, "");
}
export function createLink(username, str, id) {
	return `/@${username}/${removeSpaces(removeSpecialChars(str))}-${id}`;
}

export function countElements(text) {
	if (text) {
		text = text.trim();
		if (text === "") return 0;
		text = text.replace(/  +/g, " ");
		return text.split(" ").length;
	}
	return 0;
}
