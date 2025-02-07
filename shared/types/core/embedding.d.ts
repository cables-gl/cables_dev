export namespace EMBED {
    /**
     * add patch into html element (will create canvas and set size to fill containerElement)
     * @name CABLES.EMBED#addPatch
     * @param {object|string} _element containerElement dom element or id of element
     * @param {object} options patch options
     * @function
     */
    function addPatch(_element: object | string, options: object): HTMLCanvasElement;
}
