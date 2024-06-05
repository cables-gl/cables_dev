import fs from "fs";
import path from "path";
import moment from "moment";
import sizeOfImage from "image-size";
import sanitizeFileName from "sanitize-filename";
import { UtilProvider } from "./util_provider.js";
import SharedUtil from "./shared_util.js";

/**
 * @abstract
 */
export default class SharedFilesUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
        this.FILETYPES =
            {
                "image": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".jxl"],
                "binary": [".bin"],
                "audio": [".mp3", ".wav", ".ogg", ".aac", ".mid"],
                "video": [".m4a", ".mp4", ".mpg", ".webm"],
                "gltf": [".glb"],
                "3d raw": [".obj", ".fbx", ".3ds", ".ply", ".dae", ".blend", ".md2", ".md3", ".ase"],
                "JSON": [".json"],
                "CSS": [".css"],
                "textfile": [".txt"],
                "pointcloud": [".pc.txt"],
                "shader": [".frag", ".vert"],
                "SVG": [".svg"],
                "CSV": [".csv"],
                "XML": [".xml"],
                "font": [".otf", ".ttf", ".woff", ".woff2"],
                "mesh sequence": [".seq.zip"],
                "pointcloud json": [".pc.txt"],
                "3d json": [".3d.json"],
                "javascript": [".js"],
                "ar markers": [".iset", ".fset", ".fset3"]
            };
    }

    get utilName()
    {
        return UtilProvider.FILES_UTIL;
    }

    getFileAssetLocation(file)
    {
        let assetPath = file.projectId;
        let fileName = this.getAssetFileName(file);
        if (file.isLibraryFile)
        {
            assetPath = "library";
        }
        return path.join(this._cables.getAssetPath(), assetPath, fileName);
    }

    getFileInfo(fileDb)
    {
        let info = {};
        const fn = this.getFileAssetLocation(fileDb);

        if (fs.existsSync(fn))
        {
            const stats = fs.statSync(fn);
            const fileSizeInBytes = stats.size;
            const fileSizeInKb = fileSizeInBytes / 1024;
            info.sizeKb = Math.ceil(fileSizeInKb);

            info.sizeReadable = info.sizeKb + " kb";
            if (info.sizeKb > 1024)info.sizeReadable = Math.round(fileSizeInKb / 1024 * 100) / 100 + " mb";

            info.size = fileSizeInBytes;
            info.type = this.getFileType(fn);
        }

        info.fileDb = fileDb;
        info.fileDb.fileName = this.getAssetFileName(fileDb);
        info.cachebuster = fileDb.cachebuster;
        info.date = fileDb.updated;
        info.converters = [];

        info.converters = this.getConvertersForFile(this.getAssetFileName(fileDb) + "");

        if (fileDb.suffix && (fileDb.suffix.endsWith(".png") || fileDb.suffix.endsWith(".jpg") || fileDb.suffix.endsWith(".jpeg") || fileDb.suffix.endsWith(".svg") || fileDb.suffix.endsWith(".webp") || fileDb.suffix.endsWith(".avif")))
        {
            info.imgPreview = this.getFileAssetUrlPath(fileDb);
            if (info.cachebuster) info.imgPreview += "?rnd" + info.cachebuster;

            const dimensions = this.imageSize(fn);
            info.imgSizeWidth = dimensions.width;
            info.imgSizeHeight = dimensions.height;
            if (this.isPowerOfTwo(parseInt(dimensions.width)) && this.isPowerOfTwo(parseInt(dimensions.height))) info.imgSizePower = "is power of two";
            else info.imgSizePower = "is NOT power of two";
        }

        info.icon = this.getFileIconName(fileDb);
        info.path = this.getFileAssetUrlPath(fileDb);

        return info;
    }

    getFileType(filename)
    {
        let type = "unknown";
        for (const k in this.FILETYPES)
            for (let j = 0; j < this.FILETYPES[k].length; j++)
                if (filename.toLowerCase().endsWith(this.FILETYPES[k][j])) type = k;
        return type;
    }

    getAssetFileName(fileDb)
    {
        if (!fileDb) return "";
        return fileDb.fileName || fileDb.name;
    }

    getConvertersForFile(fileName)
    {
        const converters = [];
        for (const i in this.converters)
            for (const si in this.converters[i].suffix)
                if ((fileName + "").toLocaleLowerCase().endsWith(this.converters[i].suffix[si]))
                    converters.push(this.converters[i]);
        return converters;
    }

    getFileAssetUrlPath(file)
    {
        if (!file) return "";
        let assetDir = file.projectId;
        if (file.isLibraryFile) assetDir = "library";
        return path.join("/assets/", assetDir, this.getAssetFileName(file));
    }

    imageSize(fn)
    {
        const dimensions = {
            "width": 0,
            "height": 0
        };
        try
        {
            const size = sizeOfImage(fn);
            dimensions.height = size.height;
            dimensions.width = size.width;
        }
        catch (e)
        {
            this._log.warn("failed to get image dimensions on ", fn, e.message);
        }
        return dimensions;
    }

    isPowerOfTwo(x)
    {
        return (x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384);
    }

    getFileIconName(fileDb)
    {
        let icon = "file";

        if (fileDb.type === "image" || fileDb.type === "SVG") icon = "file-image";
        else if (fileDb.type === "gltf" || fileDb.type === "3d json") icon = "file-box";
        else if (fileDb.type === "video") icon = "file-video-2";
        else if (fileDb.type === "font") icon = "file-type";
        else if (fileDb.type === "JSON" || fileDb.type === "XML" || fileDb.type === "CSS") icon = "file-code";
        else if (fileDb.type === "javascript") icon = "file-json";
        else if (fileDb.type === "shader") icon = "file-text";
        else if (fileDb.type === "textfile") icon = "file-text";
        else if (fileDb.type === "CSV") icon = "file-spreadsheet";
        else if (fileDb.type === "audio") icon = "file-audio-2";

        return icon;
    }

    realSanitizeFilename(_filename)
    {
        let filename = sanitizeFileName(_filename);
        // eslint-disable-next-line no-control-regex
        filename = filename.replace(/[^\x00-\x7F]/g, "_");
        filename = filename.replace(/ /g, "_");
        filename = filename.replace(/&/g, "_");
        filename = filename.replace(/;/g, "_");
        filename = filename.replace(/'/g, "_");
        filename = filename.replace(/!/g, "_");
        filename = filename.replace(/#/g, "_");
        filename = filename.replace(/\$/g, "_");
        filename = filename.replace(/\(/g, "_");
        filename = filename.replace(/\)/g, "_");

        const suffix = this.getSuffix(filename);
        if (suffix) filename = filename.replace(suffix.toUpperCase(), suffix); // force lowercase file extensions

        return filename;
    }

    getSuffix(filename)
    {
        let suffix = null;

        if (!suffix)
            for (const k in this.FILETYPES)
                for (let j = 0; j < this.FILETYPES[k].length; j++)
                    if (filename.toLowerCase().endsWith(this.FILETYPES[k][j])) suffix = this.FILETYPES[k][j];

        return suffix;
    }
}
