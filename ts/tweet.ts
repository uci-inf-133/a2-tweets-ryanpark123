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
        const strip = (txt: string) => {
            let t = txt.replace(/https?:\/\/\S+/gi, "");
            t = t.replace(/#runkeeper/gi, "");
            return t.replace(/\s+/g, " ").trim();
        };

        const s = strip(this.text).toLowerCase();
        if (!s) return false;

        const boilerplate = [
            /^just completed .+ with @runkeeper\.?$/,
            /^i'?m .+ with @runkeeper\.?$/,
            /^just posted a. + with @runkeeper\.?$/,
            /^achieved .+ with @runkeeper\.?$/,
            /^i just set a goal.*$/
        ];
        const isBoilerOnly = boilerplate.some((p) => p.test(s));

        const hasExtraSignals = /-|-|:|;|!|\?| feeling | splits | pace | weather /.test(s);

        return !isBoilerOnly || hasExtraSignals;
    }

    get writtenText():string {
        if(!this.written) 
            return "";

        const strip = (txt: string) => {
            let t = txt.replace(/https?:\/\/\S+/gi, "");
            t = t.replace(/#runkeeper/gi, "");
            return t.replace(/\s+/g, " ").trim();
        };

        let out = strip(this.text);

        out = out.replace(/^just completed .*? ( with @runkeeper)?\.?\s*/i, "");
        out = out.replace(/^i'?m .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^just posted a .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^achieved .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^i just set a goal.*?\s*/i, "");

        return out.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }

        const s = this.text.toLowerCase();

        const m = s.match(/\b(?:mi|mile|miles|km|kilometer|kilometers)\b\s+([a-z]+)/);
        let type = m?.[1] || "";

        if (!type) {
            const common = ["run", "walk", "hike", "bike", "ride", "cycling", "swim", "ski", "elliptical", "row", "treadmill"];
            type = common.find((w) => s.includes(' ${w} ')) || "";
        }

        if (!type) return "unknown";
        if (type === "ride" || type === "cycling") type = "bike";

        return type;
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