export class MatrixStack {
    _arr: any[];
    _index: number;
    stateCounter: number;
    /**
     * @param {mat4} m
     */
    push(m: mat4): any;
    pop(): any;
    length(): number;
}
