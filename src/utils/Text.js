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
	return `/@${username}/${removeSpaces(removeSpecialChars(str)).toLowerCase()}-${id}`;
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

export const capitalize = (text) => {
	const lowercaseText = text.toLowerCase();
	const words = lowercaseText.split(" ");
	for (let i = 0; i < words.length; i++) {
		words[i] = `${words[i].charAt(0).toUpperCase()}${words[i].slice(1)}`;
	}
	return words.join(" ");
};
