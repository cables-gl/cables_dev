import fs from "fs";
import path from "path";
import sizeOfImage from "image-size";
import sanitizeFileName from "sanitize-filename";
import { UtilProvider } from "./util_provider.js";
import SharedUtil from "./shared_util.js";
import { CablesConstants } from "../index.js";

/**
 * @abstract
 */
export default class SharedFilesUtil extends SharedUtil
{
    constructor(utilProvider)
    {
        super(utilProvider);
        this.converters = [];
        this.FILETYPES = CablesConstants.FILETYPES;
    }

    get utilName()
    {
        return UtilProvider.FILES_UTIL;
    }

    isAssetLibraryLocation(filePath)
    {
        if (!filePath) return false;
        return filePath.toLowerCase().includes("/library/");
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
        if (!fileDb) return {};
        const fn = this.getFileAssetLocation(fileDb);

        let info = this.getFileInfoFromFile(fn);
        info.fileDb = fileDb;
        info.fileDb.fileName = this.getAssetFileName(fileDb);
        info.isReference = info.fileDb.referenceTo;
        info.cachebuster = fileDb.cachebuster;
        info.date = fileDb.updated;
        info.converters = [];

        if (info.isImage)
        {
            info.imgPreview = this.getFileAssetUrlPath(fileDb);
            if (info.cachebuster) info.imgPreview += "?rnd" + info.cachebuster;
        }

        info.converters = this.getConvertersForFile(this.getAssetFileName(fileDb), info);

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

    getConvertersForFile(fileName, fileInfo)
    {
        const converters = [];
        for (const i in this.converters)
        {
            const converter = this.converters[i];
            for (const si in converter.suffix)
            {
                if ((fileName + "").toLocaleLowerCase().endsWith(converter.suffix[si]))
                {
                    if (converter.hidden) continue;
                    if (fileInfo.isReference)
                    {
                        if (converter.referencesOnly) converters.push(converter);
                    }
                    else
                    {
                        if (!converter.referencesOnly) converters.push(converter);
                    }
                }
            }
        }
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

    getFileInfoFromFile(absolutePath)
    {
        const info = {};
        if (!absolutePath) return info;
        if (absolutePath)
        {
            try
            {
                const stats = fs.statSync(absolutePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInKb = fileSizeInBytes / 1024;
                info.sizeKb = Math.ceil(fileSizeInKb);

                info.fileUpdated = stats.mtime;
                info.fileCreated = stats.ctime;

                info.sizeReadable = info.sizeKb + " kb";
                if (info.sizeKb > 1024) info.sizeReadable = Math.round(fileSizeInKb / 1024 * 100) / 100 + " mb";

                info.size = fileSizeInBytes;
                info.type = this.getFileType(absolutePath);

                const parts = path.parse(absolutePath);
                if (parts.ext && (parts.ext.endsWith(".png") || parts.ext.endsWith(".jpg") || parts.ext.endsWith(".jpeg") || parts.ext.endsWith(".svg") || parts.ext.endsWith(".webp") || parts.ext.endsWith(".avif")))
                {
                    info.isImage = true;
                    const dimensions = this.imageSize(absolutePath);
                    info.imgSizeWidth = dimensions.width;
                    info.imgSizeHeight = dimensions.height;
                    if (this.isPowerOfTwo(parseInt(dimensions.width)) && this.isPowerOfTwo(parseInt(dimensions.height))) info.imgSizePower = "is power of two";
                    else info.imgSizePower = "is NOT power of two";
                }
            }
            catch (e) {}

        }

        return info;
    }
}
