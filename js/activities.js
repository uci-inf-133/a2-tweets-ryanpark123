let tweet_array = [];

const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val };
const show = (sel) => { const n = document.querySelector(sel); if (n) n.style.display = ''};
const hide = (sel) => { const n = document.querySelector(sel); if (n) n.style.display = 'none'};

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completed = tweet_array.filter(t => t.source === 'completed_event');
	const withDist = completed.filter(t => t.activityType && t.activityType !== 'unknown' && t.distance > 0);

	const freqMap = new Map();
	withDist.forEach(t => freqMap.set(t.activityType, (freqMap.get(t.activityType) || 0) + 1));
	const freq = Array.from(freqMap, ([activity, count]) => ({ activity, count })).sort((a,b) => b.count - a.count);

	// distinct # of activity types + top 3 names
	const uniqueTypes = freq.length;
	const top3 = freq.slice(0, 3).map(d => d.activity);

	setText('numberActivities', String(uniqueTypes));
	setText('firstMost', top3[0] || '-');
	setText('secondMost', top3[1] || '-');
	setText('thirdMost', top3[2] || '-');

	// chart 1: counts by activity type
	const activity_vis_spec = {
	  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
	  description: "A graph of the number of Tweets containing each type of activity.",
	  data: {
	    "values": freq
	  },
	  mark: "bar",
	  endocing: {
		x: { field: "activity", type: "nominal", sort: "-y", title: "Activity" },
		y: { field: "count", type: "quantitative", title: "Count"},
		tooltip: [{ field: "activity" }, { field: "count", type: "quantitative"}]
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const dayName = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d];
	const rows = withDist
		.filter(t => top3.includes(t.activityType))
		.map(t => ({
			activity: t.activityType,
			distance: Number(t.distance.toFixed(2)),
			day: dayName(t.time.getDay()),
			dow: t.time.getDay(),
			isWeekend: [0, 6].includes(t.time.getDay())
		}));
	
	// chart 2: RAW distances by day for top 3
	const rawSpec = {
	  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
	  description: "Distances by day for top 3 activities (raw)",
	  data: {
		values: rows
	  },
	  mark: "point",
	  encoding: {
		x: { field: "day", type: "ordinal", title: "Day of Week", sort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
		y: { field: "distance", type: "quantitative", title: "Distance (mi" },
		color: { field: "activity", type: "nominal" },
		tooltip: ["activity", "day", {field: "distance", "type": "quantitative", "format": ".2f"}]
	  }
	};
	vegaEmbed('#distanceVis', rawSpec, {actions:false});

	// chart 3: mean distances by day for top 3
	const meanSpec = {
		$schema: "https://vega.github.io/schema/vega-lite/v5.json",
		description: "Mean distance by day for top 3 activities",
		data: {
			values: rows
		},
		mark: "bar",
		encoding: {
			x: { field: "day", type: "ordinal", title: "Day of Week", sort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
			y: { aggregate: "mean", field: "distance", type: "quantitative", title: "Mean Distance (mi)" },
			color: { field: "activity", type: "nominal" },
			tooltip: [
				"activity", "day", {aggregate: "mean", field: "distance", type: "quantitative", format: ".2f", title: "Mean distance"}
			]
		}
	};
	vegaEmbed('#distanceVisAggregated', meanSpec, {actions: false});

	show('#distanceVis'); hide('#distanceVisAggregated');
	const btn = document.getElementById('aggregate');
	if (btn) {
		btn.textContent = 'Show means';
		btn.onclick = () => {
			const rawVisible = getComputedStyle(document.querySelector('#distanceVis')).display !== 'none';
			if (rawVisible) {
				hide('#distanceVis'); show('#distanceVisAggregated');
				btn.textContent = 'Show raw';
			} else {
				show('#distanceVis'); show('distanceVisAggregated');
				btn.textContent = 'Show means';
			}
		};
	}

	const byAct = new Map();
	for (const r of rows) {
		const arr = byAct.get(r.activity) || [];
		arr.push(r.distance);
		byAct.set(r.activity, arr);
	}
	const means = Array.from(byAct, ([activity, arr]) => ({
		activity,
		mean: arr.reduce((a,b) => a+b, 0) / arr.length
	})).sort((a,b) => b.mean - a.mean);

	const longest = means[0]?.activity || '-';
	const shortest = means[means.length - 1]?.activity || '-';
	setText('longestActivity', longest);
	setText('shortestActivity', shortest);
	
	const wkday = rows.filter(r => !r.isWeekend).map(r => r.distance);
	const wkend = rows.filter(r => r.isWeekend).map(r => r.distance);
	const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
	setText('weekdayOrWeekendLonger', avg(wkend) > avg(wkday) ? 'weekends': 'weekdays');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});