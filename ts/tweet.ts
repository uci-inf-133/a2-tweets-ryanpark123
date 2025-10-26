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
            s.includes("with @runkeeper live") ||
            s.includes("#rklive") ||
            s.includes("watch my run right now") ||
            ((s.startsWith("i'm") || s.startsWith("im ")) && s.includes(" with @runkeeper")) ||
            (s.startsWith("just posted a ") && s.includes(" with @runkeeper"))
        ) {
            return "live_event";
        }

        // achievements/goals
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
            t = t.replace(/#rklive/gi, "");
            return t.replace(/\s+/g, " ").trim();
        };

        const s = strip(this.text).toLowerCase();
        if (!s) return false;

        const boilerplate = [
            /^just completed .+ with @runkeeper\.?$/i,
            /^i'?m .+ with @runkeeper\.?$/i,
            /^just posted a. + with @runkeeper\.?$/i,
            /^achieved .+ with @runkeeper\.?$/i,
            /^i just set a goal.*$/i
        ];
        const isBoilerOnly = boilerplate.some((p) => p.test(s));

        const hasDashNote = /\s-\s/.test(s);
        const hasExtraPunct = /[!:?]/.test(s);
        const hasKeywords = /(tired|weather|pb|pr|pace|splits|wind|rain|hot|cold|hill|hills)/i.test(s);

        return !isBoilerOnly || hasDashNote || hasExtraPunct || hasKeywords;
    }

    get writtenText():string {
        if(!this.written) 
            return "";

        const strip = (txt: string) => {
            let t = txt.replace(/https?:\/\/\S+/gi, "");
            t = t.replace(/#runkeeper/gi, "");
            t = t.replace(/#rklive/gi, "");
            return t.replace(/\s+/g, " ").trim();
        };

        let out = strip(this.text);

        out = out.replace(/^just completed .*?( with @runkeeper\.?( check it out!)?)?\s*/i, "");
        out = out.replace(/^i'?m .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^just posted a .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^achieved .*? with @runkeeper\.?\s*/i, "");
        out = out.replace(/^i just set a goal.*?\s*/i, "");

        const dash = strip(this.text).match(/\s-\s(.+)$/);
        if (dash && dash[1]) return dash[1].trim();

        return out.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }

        const s = this.text.toLowerCase();

        const m = s.match(/\b(?:mi|mile|miles|km|kilometer|kilometers)\b\s+([a-z]+)/);
        let type = (m?.[1] || "").trim();

        if (!type) {
            const common = ["run", "walk", "hike", "bike", "ride", "cycling", "swim", "ski", "elliptical", "row", "treadmill"];
            type = common.find((w) => s.includes(` ${w} `)) || "";
        }

        if (!type) return "unknown";
        if (type === "ride" || type === "cycling") type = "bike";

        return type;
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }

        const s = this.text.toLowerCase();
        const m = s.match(/([\d]+(?:\.\d+)?)\s*(mi|mile|miles|km|kilometer|kilometers)\b/);
        if (!m) return 0;

        const val = parseFloat(m[1]);
        const unit = m[2];
        if (isNaN(val)) return 0;

        return /km|kilometer/.test(unit) ? val / 1.609 : val;
    }

    getHTMLTableRow(rowNumber:number):string {
        const linkified = this.text.replace(
            /(https?:\/\/[^\s]+)/g,
            (u) => `<a href="${u}" target ="_blank" rel="noopener">${u}</a>`
        );
        const when = this.time.toLocaleString();
        const type = this.source === "completed_event" ? (this.activityType || "-") : "-";

        return `<tr><td>${rowNumber}</td><td>${type}</td><td>${when}</td><td>${linkified}</td></tr>`.trim();
    }
}