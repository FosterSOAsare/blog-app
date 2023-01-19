export function arrangeSponsorships(sponsorships) {
	sponsorships = sponsorships.empty ? [] : sponsorships;
	if (sponsorships.length < 3) {
		let max = 3 - sponsorships.length;
		for (let i = 0; i < max; i++) {
			sponsorships.push({});
		}
	}
	return sponsorships;
}
