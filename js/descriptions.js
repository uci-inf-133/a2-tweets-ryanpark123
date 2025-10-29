let tweet_array = [];
let written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// convert raw tweets into Tweet objects
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	written_tweets = tweet_array.filter(t => t.written);

	document.getElementById('searchCount').innerText = '0';
	document.getElementById('searchText').innerText = '';
	document.getElementById('tweetTable').innerHTML = '';
}

function addEventHandlerForSearch() {
	const input = document.getElementById('textFilter');
	if (!input) return;

	input.addEventListener('input', function() {
		const q = input.value.trim();
		document.getElementById('searchText').innerText = q;

		if (q.length == 0) {
			document.getElementById('searchCount').innerText = '0';
			document.getElementById('tweetTable').innerHTML = '';
			return;
		}

		const query = q.toLowerCase();
		const matches = written_tweets.filter(t => t.writtenText.toLowerCase().includes(query));

		document.getElementById('searchCount').innerText = matches.length.toString();

		const rows = matches.map((t, i) => t.getHTMLTableRow(i + 1)).join('');
		document.getElementById('tweetTable').innerHTML = rows;
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});