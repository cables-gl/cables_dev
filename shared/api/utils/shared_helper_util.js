import fs from "fs";
import uuid from "uuid-v4";
import moment from "moment";
import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";
import CablesConstants from "../constants.js";

/**
 * @abstract
 */
export default class SharedHelperUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
        this.MAX_NAME_LENGTH = 128;
        this._validShortIdChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    }

    formatDate(date, format = null)
    {
        if (format === "logdate")
        {
            if (this.isNumeric(date) && String(date).length < 11) date *= 1000;
            return moment(date).format(CablesConstants.DATE_FORMAT_LOGDATE);
        }
        else if (format === "relativedate")
        {
            if (this.isNumeric(date) && String(date).length < 11) date *= 1000;
            const m = moment(date);
            if (m.isBefore(moment().subtract(7, "days"))) return moment(date).format(CablesConstants.DATE_FORMAT_RELATIVEDATE_FULL);
            return m.fromNow();
        }
        else if (format === "displaydate")
        {
            if (this.isNumeric(date) && String(date).length < 11) date *= 1000;
            return moment(date).format(CablesConstants.DATE_FORMAT_DISPLAYDATE_DISPLAY);
        }
        else if (format === "displaydateNoTime")
        {
            if (this.isNumeric(date) && String(date).length < 11) date *= 100;
            return moment(date).format(CablesConstants.DATE_FORMAT_DISPLAYDATE_NO_TIME_DISPLAY);
        }
        else if (format === "tooltipdate")
        {
            if (this.isNumeric(date) && String(date).length < 11) date *= 100;
            return moment(date).format(CablesConstants.DATE_FORMAT_TOOLTIPDATE);
        }
        else
        {
            const monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
            ];

            const day = date.getDate();
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            return day + " " + monthNames[monthIndex] + " " + year;
        }
    }

    get utilName()
    {
        return UtilProvider.HELPER_UTIL;
    }

    endl(str)
    {
        return str + "\n";
    }

    capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    removeTrailingSpaces(input)
    {
        if (!input) return "";
        return input.split("\n").map(function (x)
        {
            return x.trimRight();
        }).join("\n");
    }

    isNumeric(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    uniqueArray(arr)
    {
        const u = {};
        const a = [];
        for (let i = 0, l = arr.length; i < l; ++i)
        {
            if (!u.hasOwnProperty(arr[i]))
            {
                a.push(arr[i]);
                u[arr[i]] = 1;
            }
        }
        return a;
    }

    sanitizeUsername(name)
    {
        name = name || "";
        name = name.toLowerCase();
        name = name.split(" ").join("_");
        name = name.replace(/\./g, "_");
        if (name.match(/^\d/))name = "u_" + name;
        return name;
    }

    /**
     * Shuffles an array, returns the same array with shuffles elements
     * @param {Array} array
     */
    shuffle(array)
    {
        let counter = array.length;
        // While there are elements in the array
        while (counter > 0)
        {
            // Pick a random index
            const index = Math.floor(Math.random() * counter);
            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            const temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }

    getPaginationInfo(items = [], limit = 0, offset = 0, fullCount = null)
    {
        let count = items.length;
        if (fullCount !== null) count = fullCount;
        let theLimit = Number(limit);
        let theOffset = Number(offset);

        if (!theLimit) theLimit = 0;
        if (!theOffset) theOffset = 0;

        let pages = 1;
        let currentPage = 1;
        let itemsOnPage = theLimit;

        if (theLimit > 0)
        {
            pages = Math.ceil(count / theLimit);

            if (offset > 0)
            {
                currentPage = (theOffset / theLimit) + 1;
            }

            if ((theOffset + theLimit) > count)
            {
                itemsOnPage = (count - theOffset);
            }
        }
        else
        {
            itemsOnPage = (count - theOffset);
            theLimit = 0;
        }

        itemsOnPage = Math.max(itemsOnPage, 0);

        return {
            "count": count,
            "offset": theOffset,
            "limit": theLimit,
            "pages": pages,
            "currentPage": currentPage,
            "itemsOnPage": itemsOnPage,
            "nextPage": Math.min(pages, currentPage + 1),
            "prevPage": Math.max(1, currentPage - 1)
        };
    }

    leven(first, second)
    {
        if (first === second)
        {
            return 0;
        }

        const swap = first;

        // Swapping the strings if `a` is longer than `b` so we know which one is the
        // shortest & which one is the longest
        if (first.length > second.length)
        {
            first = second;
            second = swap;
        }

        let firstLength = first.length;
        let secondLength = second.length;

        // Performing suffix trimming:
        // We can linearly drop suffix common to both strings since they
        // don't increase distance at all
        // Note: `~-` is the bitwise way to perform a `- 1` operation
        while (firstLength > 0 && (first.charCodeAt(~-firstLength) === second.charCodeAt(~-secondLength)))
        {
            firstLength--;
            secondLength--;
        }

        // Performing prefix trimming
        // We can linearly drop prefix common to both strings since they
        // don't increase distance at all
        let start = 0;

        while (start < firstLength && (first.charCodeAt(start) === second.charCodeAt(start)))
        {
            start++;
        }

        firstLength -= start;
        secondLength -= start;

        if (firstLength === 0)
        {
            return secondLength;
        }

        let bCharacterCode;
        let result;
        let temporary;
        let temporary2;
        let index = 0;
        let index2 = 0;

        const array = [];
        const characterCodeCache = [];

        while (index < firstLength)
        {
            characterCodeCache[index] = first.charCodeAt(start + index);
            array[index] = ++index;
        }

        while (index2 < secondLength)
        {
            bCharacterCode = second.charCodeAt(start + index2);
            temporary = index2++;
            result = index2;

            for (index = 0; index < firstLength; index++)
            {
                temporary2 = bCharacterCode === characterCodeCache[index] ? temporary : temporary + 1;
                temporary = array[index];
                // eslint-disable-next-line no-multi-assign,no-nested-ternary
                result = array[index] = temporary > result ? (temporary2 > result ? result + 1 : temporary2) : (temporary2 > temporary ? temporary + 1 : temporary2);
            }
        }

        return result;
    }

    copy(aObject)
    {
        // Prevent undefined objects
        // if (!aObject) return aObject;

        let bObject = Array.isArray(aObject) ? [] : {};

        let value;
        for (const key in aObject)
        {
            // Prevent self-references to parent object
            // if (Object.is(aObject[key], aObject)) continue;

            value = aObject[key];

            bObject[key] = (typeof value === "object") ? this.copy(value) : value;
        }

        return bObject;
    }

    getLogEntry(key, text, date = null)
    {
        if (!date) date = Date.now();
        return { "created": date, "key": key, "text": text };
    }

    generateRandomId()
    {
        // https://gist.github.com/solenoid/1372386
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + "xxxxxxxxxxxxxxxx".replace(/[x]/g, function ()
        {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }

    // https://github.com/treygriffith/short-mongo-id
    // but modified valid characters, see this._validShortIdChars
    generateShortId(longId, creationTimestamp)
    {
        let newId = "";

        // creation date
        // time in milliseconds (with precision in seconds)
        let time = creationTimestamp;

        // hexadecimal counter converted to a decimal
        let counter = parseInt(longId.slice(-6), 16);

        // only use the last 3 digits of the counter to serve as our "milliseconds"
        counter = parseInt(counter.toString().slice(-3), 10);

        // add counter as our millisecond precision to our time
        time += counter;

        // convert to 64 base string (not strict base64)
        newId = this._shortIdBase(time, 62);

        // slice off the first, least variating, character
        // this lowers the entropy, but brings us to 6 characters, which is nice.
        // This will cause a roll-over once every two years, but the counter and the rest of the timestamp should make it unique (enough)
        newId = newId.slice(1);

        // reverse the string so that the first characters have the most variation
        newId = newId.split("").reverse().join("");

        return newId;
    }

    getFilesRecursive(baseDir, fileName = null, dir = null)
    {
        if (!dir) dir = baseDir;
        let results = {};
        let list = fs.readdirSync(dir);
        list.forEach((file) =>
        {
            file = dir + "/" + file;
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory())
            {
                // recurse into subdirectory
                results = { ...results, ...this.getFilesRecursive(baseDir, fileName, file) };
            }
            else
            {
                // is a file
                const fileBaseName = file.replace(baseDir, "");
                if (fileName)
                {
                    if (fileBaseName.endsWith(fileName)) results[fileBaseName] = fs.readFileSync(file);
                }
                else
                {
                    results[fileBaseName] = fs.readFileSync(file);
                }
            }
        });
        return results;
    }

    getFileNamesRecursive(baseDir, fileName = null, dir = null)
    {
        if (!dir) dir = baseDir;
        let results = [];
        let list = fs.readdirSync(dir);
        list.forEach((file) =>
        {
            file = dir + "/" + file;
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory())
            {
                // recurse into subdirectory
                results = [...results, ...this.getFileNamesRecursive(baseDir, fileName, file)];
            }
            else
            {
                // is a file
                const fileBaseName = file.replace(baseDir, "");
                if (fileName)
                {
                    if (fileBaseName.endsWith(fileName)) results.push(fileBaseName);
                }
                else
                {
                    results.push(fileBaseName);
                }
            }
        });
        return results;
    }

    cleanJson(obj)
    {
        for (const i in obj)
        {
            if (obj[i] && typeof obj[i] === "object" && obj[i].constructor === Object) obj[i] = this.cleanJson(obj[i]);
            if (obj[i] === null || obj[i] === undefined) delete obj[i];
            if (obj[i] === "") delete obj[i];
            else if (Array.isArray(obj[i]) && obj[i].length === 0) delete obj[i];
        }

        return obj;
    }

    _shortIdBase(num, base)
    {
        let decimal = num;
        let temp;
        let conversion = "";

        const symbols = this._validShortIdChars;
        if (base > symbols.length || base <= 1)
        {
            throw new RangeError("Radix must be less than " + symbols.length + " and greater than 1");
        }

        while (decimal > 0)
        {
            temp = Math.floor(decimal / base);
            conversion = symbols[(decimal - (base * temp))] + conversion;
            decimal = temp;
        }

        return conversion;
    }

    generateUUID()
    {
        return uuid();
    }

    sortAndReduce(arr)
    {
        const uniq = arr.slice() // slice makes copy of array before sorting it
            .sort()
            .reduce(function (a, b)
            {
                if (a.slice(-1)[0] !== b) a.push(b); // slice(-1)[0] means last item in array without removing it (like .pop())
                return a;
            }, []); // this empty array becomes the starting value for a

        arr = uniq.sort(function (a, b)
        {
            return a.length - b.length;
        });

        return arr;
    }
}
