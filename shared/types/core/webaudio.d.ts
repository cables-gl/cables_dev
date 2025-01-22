export namespace WEBAUDIO {
    let toneJsInitialized: boolean;
    /**
     * Part of the Web Audio API, the AudioBuffer interface represents a short audio asset residing in memory.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer}
     */
    /**
     * Part of the Web Audio API, the AudioNode interface is a generic interface for representing an audio processing module.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode}
     */
    /**
     * The AudioContext interface represents an audio-processing graph built from audio modules linked together
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext}
     */
    /**
     * Checks if a global audio context has been created and creates
     * it if necessary. This audio context can be used for native Web Audio as well as Tone.js ops.
     * Associates the audio context with Tone.js if it is being used
     * @param {CABLES.Op} op - The operator which needs the Audio Context
     */
    function createAudioContext(op: typeof import("./core_op.js").Op): any;
    /**
     * Returns the audio context.
     * Before `createAudioContext` must have been called at least once.
     * It most cases you should use `createAudioContext`, which just returns the audio context
     * when it has been created already.
     */
    function getAudioContext(): any;
    /**
     * Creates an audio in port for the op with name `portName`
     * When disconnected it will disconnect the previous connected audio node
     * from the op's audio node.
     * @param {CABLES.Op} op - The operator to create the audio port in
     * @param {string} portName - The name of the port
     * @param {AudioNode} audioNode - The audionode incoming connections should connect to
     * @param {number} [inputChannelIndex=0] - If the audio node has multiple inputs, this is the index of the input channel to connect to
     * @returns {CABLES.Port|undefined} - The newly created audio in port or `undefined` if there was an error
     */
    function createAudioInPort(op: typeof import("./core_op.js").Op, portName: string, audioNode: AudioNode, inputChannelIndex?: number): typeof import("./core_port.js").Port;
    /**
     * Sometimes it is necessary to replace a node of a port, if so all
     * connections to this node must be disconnected and connections to the new
     * node must be made.
     * Can be used for both Audio ports as well as AudioParam ports
     * if used with an AudioParam pass e.g. `synth.frequency` as newNode
     * @param {CABLES.Port} port - The port where the audio node needs to be replaced
     * @param oldNode
     * @param newNode
     */
    function replaceNodeInPort(port: typeof import("./core_port.js").Port, oldNode: any, newNode: any): void;
    /**
     * Creates an audio out port which takes care of (dis-)connecting on it’s own
     * @param {CABLES.op} op - The op to create an audio out port for
     * @param {string} portName - The name of the port to be created
     * @param {AudioNode} audioNode - The audio node to link to the port
     * @returns {(CABLES.Port|undefined)} - The newly created audio out port or `undefined` if there was an error
     */
    function createAudioOutPort(op: CABLES.op, portName: string, audioNode: AudioNode): typeof import("./core_port.js").Port;
    /**
     * Creates an audio param in port for the op with name portName.
     * The port accepts other audio nodes as signals as well as values (numbers)
     * When the port is disconnected it will disconnect the previous connected audio node
     * from the op's audio node and restore the number value set before.
     * @param {CABLES.Op} op - The operator to create an audio param input port for
     * @param {string} portName - The name of the port to create
     * @param audioNode
     * @param options
     * @param defaultValue
     * @returns {(CABLES.Port|undefined)} - The newly created port, which takes care of (dis-)connecting on its own, or `undefined` if there was an error
     */
    function createAudioParamInPort(op: typeof import("./core_op.js").Op, portName: string, audioNode: any, options: any, defaultValue: any): typeof import("./core_port.js").Port;
    /**
     * Loads an audio file and updates the loading indicators when cables is run in the editor.
     * @param {CABLES.Patch} patch - The cables patch, when called from inside an op this is `op.patch`
     * @param {string} url - The url of the audio file to load
     * @param {function} onFinished - The callback to be called when the loading is finished, passes the AudioBuffer
     * @param {function} onError - The callback when there was an error loading the file, the rror message is passed
     * @param loadingTask
     * @see {@link https://developer.mozilla.org/de/docs/Web/API/AudioContext/decodeAudioData}
     */
    function loadAudioFile(patch: typeof import("./core_patch.js").default, url: string, onFinished: Function, onError: Function, loadingTask: any): void;
    /**
     * Checks if the passed time is a valid time to be used in any of the Tone.js ops.
     * @param {(string|number)} t - The time to check
     * @returns {boolean} - True if time is valid, false if not
     */
    function isValidToneTime(t: string | number): boolean;
    /**
     * Checks if the passed note is a valid note to be used with Tone.js
     * @param {string} note - The note to be checked, e.g. `"C4"`
     * @returns {boolean} - True if the note is a valid note, false otherwise
     */
    function isValidToneNote(note: string): boolean;
}
