import webpack from "webpack";
import CablesWebpackHelper from "./webpack.helper.js";

export class CablesWebpackPatchJsonPlugin
{
    constructor(data, filename, assetPath)
    {
        this._filename = filename;
        this._data = data;
        this._assetPath = assetPath;

        this._log = console;
    }

    apply(compiler)
    {
        compiler.hooks.thisCompilation.tap("CablesWebpackPatchJsonPlugin", compilation =>
        {
            compilation.hooks.processAssets.tap({
                    name: "CablesWebpackPatchJsonPlugin",
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                }, () =>
                {
                    const original = this._data;
                    const exportable = CablesWebpackHelper.makeExportable(original, [], this._assetPath)
                    compilation.emitAsset(
                        this._filename,
                        new webpack.sources.RawSource(JSON.stringify(exportable, null, 4)),
                    );
                },
            );
        });
    }
}


