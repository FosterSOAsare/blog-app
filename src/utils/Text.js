export function truncateText(text, limit) {
	return text && `${text.substring(0, limit)}${text.length > limit ? "..." : ""}`;
}

export function removeSpaces(text) {
	return text && text.split(" ").join("-");
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
