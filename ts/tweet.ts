class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const s = this.text.toLowerCase();

        if (
            s.startsWith("just completed ") ||
            s.startsWith("completed a ") ||
            / completed (a|an) [\d\.,]+ (mi|mile|miles|km|kilometer|kilometers) /.test(s)
        ) {
            return "completed_event";
        }

        if (
            s.includes("watch my run right now") ||
            ((s.startsWith("i'm") || s.startsWith("im ")) && s.includes(" with @runkeeper")) ||
            (s.startsWith("just posted a ") && s.includes(" with @runkeeper"))
        ) {
            return "live_event";
        }

        if (
            s.includes("personal record") ||
            s.startsWith("achieved ") ||
            s.includes("i just set a goal") ||
            s.includes("set a new goal")
        ) {
            return "achievement";
        }
        
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return false;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        return "";
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}