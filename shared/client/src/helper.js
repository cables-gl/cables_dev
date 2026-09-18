import CablesConstants from "../client_contstants.js";

/**
 * Shared helper methods for cables uis
 */
class Helper
{
    constructor()
    {
        this._simpleIdCounter = 0;
    }

    /**
     * generate a random v4 uuid
     *
     * @return {string}
     */
    uuid()
    {
        let d = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
        {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    /**
     * checks value for !isNan and isFinite
     *
     * @param {string|number} n
     * @return {boolean}
     */
    isNumeric(n)
    {
        // const nn = parseFloat(n);
        // return !isNaN(nn) && isFinite(nn);
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * generate a simple ID using an internal counter
     *
     * @return {Number} new id
     * @static
     */
    simpleId()
    {
        this._simpleIdCounter++;
        return this._simpleIdCounter;
    }

    pathLookup(obj, path)
    {
        const parts = path.split(".");
        if (parts.length == 1)
        {
            return obj[parts[0]];
        }
        return this.pathLookup(obj[parts[0]], parts.slice(1).join("."));
    }

    /**
     *
     * @param {string} str
     * @param {"logdate"|"displaydate"|"tooltipdate"|"displaydateNoTime"|"relativedate"} format
     * @param {boolean} [showFuture=false]
     * @returns {{date: string, displayDate: string}}
     */
    formatDate(str, format, showFuture = false)
    {
        let date = "";
        let displayDate = "";

        /** @type {string|number} */
        let parseableDate = str;
        if (this.isNumeric(str))
        {
            let timestamp = parseInt(str);
            if (String(str).length < 11)
            {
                timestamp *= 1000;
            }
            parseableDate = timestamp;
        }
        if (!parseableDate || !moment) return { "date": str, "displayDate": str };

        let momentDate = moment(parseableDate);
        switch (format)
        {
        case "logdate":
            date = momentDate.format(CablesConstants.DATE_FORMAT_LOGDATE);
            displayDate = date;
            break;
        case "displaydate":
            date = momentDate.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_DATE);
            displayDate = momentDate.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_DISPLAY);
            break;
        case "tooltipdate":
            date = momentDate.format(CablesConstants.DATE_FORMAT_TOOLTIPDATE);
            displayDate = date;
            break;
        case "displaydateNoTime":
            date = momentDate.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_NO_TIME_DISPLAY);
            displayDate = momentDate.format(CablesConstants.DATE_FORMAT_DISPLAYDATE_NO_TIME_DISPLAY);
            break;
        case "relativedate":
            const now = moment();
            if (!showFuture && now.isBefore(momentDate))
            {
                date = now.format(CablesConstants.DATE_FORMAT_RELATIVEDATE_FULL);
                displayDate = now.fromNow();
            }
            else
            {
                displayDate = momentDate.fromNow();
                if (momentDate.isBefore(now.subtract(CablesConstants.DATE_FORMAT_RELATIVEDATE_CUTOFF_DAYS, "days"))) displayDate = momentDate.format(CablesConstants.DATE_FORMAT_RELATIVEDATE_SHORT);
                date = momentDate.format(CablesConstants.DATE_FORMAT_RELATIVEDATE_FULL);
            }
            break;
        }

        return {
            "date": date,
            "displayDate": displayDate
        };
    }

}
export default new Helper();
