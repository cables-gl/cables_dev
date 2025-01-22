/**
 * todo: old... remove this from ops...
 *
 * @class
 */
export function Variable(): void;
export class Variable {
    onChanged: (f: any) => void;
    getValue: () => any;
    setValue: (v: any) => void;
    emitChanged: () => void;
}
