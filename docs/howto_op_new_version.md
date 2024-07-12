# How to create a new version of an Op

- Make sure that the version characters are added correctly. e.g.  `Ops.Array.Array` becomes  `Ops.Array.Array_v2` the next version would be  `Ops.Array.Array_v3`. This removes all previous versions from the op creation menu for users. Old versions can only be found again on the op documentation page.
- Make sure to copy over all relevant documentation from the previous version as the new op will have none.
- Make sure that the op has a new example patch, it won't reference the old one.
- If a port type has to be changed e.g. `op.inValueString` to `op.inString` then a new version of an op must be created, or it will break all patches that use that op.
- A port name cannot be changed without breaking all patches that use it. Make a new version of the op if the port name must be changed.
- Make sure the author name is correct from the user that made the previous version.
