export default class FpsCounter extends Events {
    _timeStartFrame: number;
    _timeStartSecond: number;
    _fpsCounter: number;
    _msCounter: number;
    _frameCount: number;
    stats: {
        ms: number;
        fps: number;
    };
    get frameCount(): number;
    startFrame(): void;
    endFrame(): void;
    endSecond(): void;
}
import { Events } from "cables-shared-client";
