function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const times = tweet_array.map(t => t.time.getTime());
	const earliest = new Date(Math.min(...times));
	const latest = new Date(Math.max(...times));

	const fmtDate = (d) => d.toLocaleDateString(undefined, {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
	});

	document.getElementById('firstDate').innerText = fmtDate(earliest);
	document.getElementById('lastDate').innerText = fmtDate(latest);

	const totals = { completed_event: 0, live_event: 0, achievement: 0, miscellaneous: 0};
	for (const t of tweet_array) {
		totals[t.source] = (totals[t.source] || 0) + 1;
	}

	const total = tweet_array.length;
	const pct = (n) => total ? ((n/total) * 100).toFixed(2) + '%' : '0.00%';

	const setAll = (cls,val) =>
		document.querySelectorAll(`.${cls}`).forEach(el => el.innerText = val);

	// counts
	setAll('completedEvents', String(totals.completed_event || 0));
	setAll('liveEvents', String(totals.live_event || 0));
	setAll('achievements', String(totals.achievement || 0));
	setAll('miscellaneous', String(totals.miscellaneous || 0));

	// percentages
	setAll('completedEventsPct', pct(totals.completed_event || 0));
	setAll('liveEventsPct', pct(totals.live_event || 0));
	setAll('achievementsPct', pct(totals.achievement || 0));
	setAll('miscellaneousPct', pct(totals.miscellaneous || 0));

	const completed = tweet_array.filter(t => t.source === 'completed_event');
	const withText = completed.filter(t => t.written);

	setAll('written', String(withText.length));
	setAll('writtenPct', completed.length ? ((withText.length / completed.length) * 100).toFixed(2) + '%' : '0.00%');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});