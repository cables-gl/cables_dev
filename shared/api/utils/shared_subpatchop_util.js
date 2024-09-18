import SharedUtil from "./shared_util.js";
import { UtilProvider } from "./util_provider.js";

/**
 * @abstract
 */
export default class SharedSubPatchOpUtil extends SharedUtil
{
    get utilName()
    {
        return UtilProvider.SUBPATCH_OP_UTIL;
    }

    getSaveSubPatchOpProblems(opName, subPatch)
    {
        if (!opName) return null;
        if (!subPatch || !subPatch.ops) return null;
        let problem = null;
        for (let i = 0; i < subPatch.ops.length; i++)
        {
            const subPatchOp = subPatch.ops[i];
            const subPatchOpName = this._opsUtil.getOpNameById(subPatchOp.opId);
            const outerNamespace = this._opsUtil.getNamespace(opName);
            const opId = this._opsUtil.getOpIdByObjName(opName);

            const opProblem = {
                "outerNamespace": outerNamespace,
                "outerOpName": opName,
                "outerOpId": opId,
                "innerOpName": subPatchOpName,
                "innerOpId": subPatchOp.opId,
                "innerOpInstanceId": subPatchOp.id,
                "subPatch": subPatch
            };
            const hierarchyProblem = this._opsUtil.getNamespaceHierarchyProblem(opName, subPatchOpName);
            if (hierarchyProblem)
            {
                opProblem.msg = hierarchyProblem;
            }
            if (opProblem.msg)
            {
                problem = opProblem;
                break;
            }
        }
        return problem;
    }

    getOpsUsedInSubPatches(subPatch)
    {
        let opsInSubPatches = [];
        if (!subPatch || !subPatch.ops) return opsInSubPatches;
        const v2Bps = subPatch.ops.filter((op) => { return op.storage && op.storage.blueprintVer > 1; });
        opsInSubPatches = opsInSubPatches.concat(this._getOpsUsedInSubPatch({ "ops": v2Bps }));
        opsInSubPatches = opsInSubPatches.filter((obj, index) => { return opsInSubPatches.findIndex((item) => { return item.opId === obj.opId; }) === index; });
        return opsInSubPatches;
    }

    _getOpsUsedInSubPatch(subPatch, currentOp = null)
    {
        let opsInSubPatch = [];
        if (!subPatch) return [];
        if (subPatch && subPatch.ops) opsInSubPatch = opsInSubPatch.concat(subPatch.ops);

        const subPatchOps = subPatch.ops.filter((op) => { return op.storage && op.storage.blueprintVer > 1; });

        if (subPatchOps.length > 0)
        {
            try
            {
                subPatchOps.forEach((subPatchOp) =>
                {
                    if (!currentOp || (currentOp.opId !== subPatchOp.opId))
                    {
                        const attachmentOps = this._opsUtil.getSubPatchOpAttachment(this._opsUtil.getOpNameById(subPatchOp.opId));
                        opsInSubPatch = opsInSubPatch.concat(this._getOpsUsedInSubPatch(attachmentOps, subPatchOp));
                    }
                    else
                    {
                        this._log.warn("skipping recursive subpatches", subPatchOp.opId, currentOp.opId);
                    }
                });
            }
            catch (e)
            {
                this._log.error(e);
            }

            opsInSubPatch = opsInSubPatch.filter((obj, index) => { return opsInSubPatch.findIndex((item) => { return item.opId === obj.opId; }) === index; });
        }
        return opsInSubPatch;
    }
}

