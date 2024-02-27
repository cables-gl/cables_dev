import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedTeamsUtil extends SharedUtil
{
    get utilName()
    {
        return UtilProvider.TEAMS_UTIL;
    }

    isPublic(team)
    {
        if (!team) return false;
        return team.visibility === "public";
    }


    isOwner(user, team)
    {
        if (!user) return false;
        if (!team) return false;
        return team.owner._id == user._id;
    }

    isMember(user, team)
    {
        if (!user) return false;
        if (!team) return false;
        if (!team.members) return false;
        if (this.isOwner(user, team))
        {
            return true;
        }
        else
        {
            return team.members.some((m) => { return String(m._id) === String(user._id); }) || team.membersReadOnly.some((m) => { return String(m._id) === String(user._id); });
        }
    }


    userHasWriteAccess(user, team)
    {
        if (!user) return false;
        if (!team) return false;
        if (user.isAdmin) return true;
        if (this.isOwner(user, team))
        {
            return true;
        }
        else
        {
            return team.members.some((m) => { return String(m._id) === String(user._id); });
        }
    }

    getFullExtensionName(shortName)
    {
        let name = shortName;
        if (!name.endsWith(".")) name += ".";
        if (!name.startsWith("Ops.Extension."))
        {
            return "Ops.Extension." + name;
        }
        return name;
    }

    makeReadable(teams)
    {
        if (!teams) return {};
        if (!(teams instanceof Array)) return this._makeTeamReadable(teams);

        const readables = [];
        teams.forEach((p) =>
        {
            const readable = this._makeTeamReadable(p);
            readables.push(readable);
        });
        return readables;
    }

    _makeTeamReadable(team)
    {
        if (!team) return {};
        const readable = {
            "_id": team._id,
            "link": team.link,
            "name": team.name,
            "description": team.description,
            "visibility": team.visibility,
            "created": team.created,
            "updated": team.updated,
            "published": team.published
        };
        if (team.isMember) readable.isMember = team.isMember;
        return readable;
    }

    sanitizeShortNameForNamespace(teamName)
    {
        let name = teamName || "";
        name = name.replace(/[^\x00-\x7F]/g, "");
        name = name.split(" ").join("");
        name = name.replaceAll(/\./g, "");
        name = name.replaceAll("_", "");
        name = name.replaceAll("-", "");
        if (name.match(/^\d/))name = "T" + name;
        name = name.substring(0, 16);
        return this._helperUtil.capitalizeFirstLetter(name);
    }
}
