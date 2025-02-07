export class MatrixStack {
    _arr: any[];
    _index: number;
    stateCounter: number;
    push(m: any): any;
    pop(): any;
    length(): number;
}
