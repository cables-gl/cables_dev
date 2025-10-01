/**
 * @callback whatever
 * @param {...any} param
 */

/**
  * @typedef myElement
  * @type {HTMLElement}
  * @extends {HTMLInputElement}
  */

/**
 * Ele - minimalistic html dom helper
 *
 * @class
 */
class Ele
{

    /**
     * shortcut for document.getElementById(id)
     *
     * @param {String} id
     * @returns {HTMLElement&any} DOM element
     */
    byId(id)
    {
        if (id && id[0] === "#") console.warn("ele.byId should not contain #");
        return document.getElementById(id);
    }

    /**
     * shortcut for document.querySelector(id)
     *
     * @param {String} q
     * @returns {any} DOM element
     */
    byQuery(q)
    {
        return document.querySelector(q);
    }

    /**
     * shortcut for document.querySelectorAll(id)
     *
     * @param {String} q
     * @returns {NodeListOf<HTMLElement>} DOM elements
     */
    byQueryAll(q)
    {
        return document.querySelectorAll(q);
    }

    /**
     * returns the first element with class
     *
     * @param {String} name
     * @returns {HTMLElement|null|Element} DOM element
     */
    byClass(name)
    {
        if (name && name[0] === ".") console.warn("ele.byClass should not contain .");
        const els = document.getElementsByClassName(name);
        if (els.length > 0) return els[0];
        return null;
    }

    /**
     * returns the all elements with class
     *
     * @param {String} name
     * @returns {HTMLCollectionOf<Element|HTMLElement>|Array} DOM elements
     */
    byClassAll(name)
    {
        if (name && name[0] === ".") console.warn("ele.byClassAll should not contain .");
        const els = document.getElementsByClassName(name);
        if (!els) return [];
        return els;
    }

    /**
     * runs the callback with all elements that have the given class as first argument
     *
     * @param {String} name
     */
    forEachClass(name, cb)
    {
        if (name && name[0] === ".") console.warn("ele.forEachClass should not contain .");

        const eles = document.getElementsByClassName(name);
        for (let i = 0; i < eles.length; i++) cb(eles[i]);
    }

    /**
     * returns the currently selected value for a <select>-element, or the text, if no value is set
     *
     * @param {HTMLElement|Element} el
     * @return {any}
     */
    getSelectValue(el)
    {
        if (!el.options) return;
        const selectedIndex = el.selectedIndex || 0;
        return el.options[selectedIndex].value || el.options[selectedIndex].text;
    }

    /**
     * makes an element clickable and executes the callback, also add keyboard support, when hitting enter on the element is same as clicking
     *
     * @param {Object} el
     * @param {whatever} cb
     */
    asButton(el, cb)
    {
        this.clickable(el, cb);
    }

    /**
     * makes an element clickable and executes the callback, also add keyboard support, when hitting enter on the element is same as clicking
     *
     * @param {Object} el
     * @param {whatever|function} cb
     */
    clickable(el, cb)
    {
        if (!el) return;

        if (el.getAttribute("tabindex") == null) el.setAttribute("tabindex", 0);
        el.classList.add("eleAsButton");
        if (cb)
        {
            el.addEventListener("click", (e) => { cb(e); });
            el.addEventListener("keydown", (e) => { if (e.keyCode === 13 || e.keyCode === 32)cb(e); });
        }
        else { console.warn("ele.clickable no callback given", el); }
    }

    /**
     * makes elements matching the query clickable and runs the callback on them when clicked
     *
     * @param {HTMLElement|Element} parent
     * @param {String} query
     * @param {Function} cb
     */
    clickables(parent, query, cb)
    {
        const clickEles = parent.querySelectorAll(query);
        for (let i = 0; i < clickEles.length; i++)
        {
            this.clickable(clickEles[i], (e) =>
            {
                cb(e, e.currentTarget.dataset);
            });
        }
    }

    /**
     * can be used for making element keyboard usable and continue using inline onclick e.g. onkeypress="ele.keyClick(event,this)"
     *
     * @param {KeyboardEvent} event
     * @param  {HTMLElement} el
     */
    keyClick(event, el)
    {
        if ((event.keyCode === 13 || event.keyCode === 32) && el.onclick) el.click();
    }

    /**
     * remove class "hidden" from element
     *
     * @param {HTMLElement|Element} el
     */
    show(el)
    {
        if (el) el.classList.remove("hidden");
    }

    /**
     * add class "hidden" to element
     *
     * @param {HTMLElement|Element} el
     */
    hide(el)
    {
        if (el) el.classList.add("hidden");
    }

    /**
     * remove or add class "hidden" from element
     *
     * @param {HTMLElement|Element} el
     */
    toggle(el)
    {
        if (el.classList.contains("hidden"))
        {
            if (el)el.classList.remove("hidden");
        }
        else
        {
            if (el)el.classList.add("hidden");
        }
    }

    /**
     * create element with given tagname
     *
     * @param {String} n
     * @return {HTMLElement}
     */
    create(n)
    {
        return document.createElement(n);
    }

    /**
     * checks if given element is "activeElement"
     *
     * @param {HTMLElement|Element} el
     * @return {boolean}
     */
    hasFocus(el)
    {
        return document.activeElement == el;
    }

}

export default new Ele();
