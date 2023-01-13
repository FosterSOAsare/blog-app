export function arrangeSponsorships(sponsorships) {
	let res = [];
	if (sponsorships?.length) {
		res = sponsorships.sort((a, b) => b.amount - a.amount);
	}
	if (res.length < 3) {
		let max = 3 - res.length;
		for (let i = 0; i < max; i++) {
			res.push({});
		}
	}
	return res;
}
