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
        let opsInBlueprints = [];
        if (!subPatch || !subPatch.ops) return opsInBlueprints;
        const v2Bps = subPatch.ops.filter((op) => { return op.storage && op.storage.blueprintVer > 1; });
        opsInBlueprints = opsInBlueprints.concat(this._getOpsUsedInSubPatch({ "ops": v2Bps }));
        opsInBlueprints = opsInBlueprints.filter((obj, index) => { return opsInBlueprints.findIndex((item) => { return item.opId === obj.opId; }) === index; });
        return opsInBlueprints;
    }

    _getOpsUsedInSubPatch(subPatch)
    {
        let opsInBlueprint = [];
        if (!subPatch) return [];
        if (subPatch && subPatch.ops) opsInBlueprint = opsInBlueprint.concat(subPatch.ops);

        const blueprints = subPatch.ops.filter((op) => { return op.storage && op.storage.blueprintVer > 1; });

        if (blueprints.length > 0)
        {
            blueprints.forEach((blueprint) =>
            {
                const attachmentOps = this._opsUtil.getSubPatchOpAttachment(this._opsUtil.getOpNameById(blueprint.opId));
                opsInBlueprint = opsInBlueprint.concat(this._getOpsUsedInSubPatch(attachmentOps));
            });

            opsInBlueprint = opsInBlueprint.filter((obj, index) => { return opsInBlueprint.findIndex((item) => { return item.opId === obj.opId; }) === index; });
        }
        return opsInBlueprint;
    }
}

