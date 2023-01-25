export function checkSubscribed(followers, userId) {
	return followers.length > 0 && followers.find((e) => e === userId);
}

export function removeSubscription(followers, userId) {
	return followers.length > 0 && followers.filter((e) => e !== userId);
}

export function addSubscription(followers, userId) {
	followers.push(userId);
	return followers;
}
