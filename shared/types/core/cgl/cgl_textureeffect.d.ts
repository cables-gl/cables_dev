export class TextureEffect {
    constructor(cgl: any, options: any);
    _cgl: any;
    _log: Logger;
    _textureSource: any;
    _options: any;
    name: any;
    imgCompVer: number;
    aspectRatio: number;
    _textureTarget: any;
    _frameBuf: any;
    _frameBuf2: any;
    _renderbuffer: any;
    _renderbuffer2: any;
    switched: boolean;
    depth: boolean;
    dispose(): void;
    getWidth(): any;
    getHeight(): any;
    setSourceTexture(tex: any): void;
    continueEffect(): void;
    startEffect(bgTex: any): void;
    _bgTex: any;
    _countEffects: number;
    endEffect(): void;
    bind(): void;
    finish(): void;
    getCurrentTargetTexture(): any;
    getCurrentSourceTexture(): any;
    delete(): void;
    createMesh(): void;
}
export namespace TextureEffect {
    function checkOpNotInTextureEffect(op: any): boolean;
    function checkOpInEffect(op: any, minver: any): boolean;
    function getBlendCode(ver: any): any;
    function onChangeBlendSelect(shader: any, blendName: any, maskAlpha?: boolean): void;
    function AddBlendSelect(op: any, name: any, defaultMode: any): any;
    function AddBlendAlphaMask(op: any, name: any, defaultMode: any): any;
    function setupBlending(op: any, shader: any, blendPort: any, amountPort: any, alphaMaskPort: any): void;
}
import { Logger } from "cables-shared-client";
