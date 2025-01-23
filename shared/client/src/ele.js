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
     * @returns {Object} DOM element
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
     * @returns {Object} DOM element
     */
    byQuery(q)
    {
        return document.querySelector(q);
    }

    /**
     * shortcut for document.querySelectorAll(id)
     *
     * @param {String} q
     * @returns {Array} DOM elements
     */
    byQueryAll(q)
    {
        return document.querySelectorAll(q);
    }

    /**
     * returns the first element with class
     *
     * @param {String} name
     * @returns {Object|null} DOM element
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
     * @returns {Array} DOM elements
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
     * @param {function(Element)} cb
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
     * @param {Element} el
     * @return {*|undefined}
     */
    getSelectValue(el)
    {
        if (!el.options || !el.selectedIndex) return;
        return el.options[el.selectedIndex].value || el.options[el.selectedIndex].text;
    }

    /**
     * makes an element clickable and executes the callback, also add keyboard support, when hitting enter on the element is same as clicking
     *
     * @param {Object} element
     * @param {function(Event)} cb
     */
    asButton(element, cb)
    {
        this.clickable(element, cb);
    }

    /**
     * makes an element clickable and executes the callback, also add keyboard support, when hitting enter on the element is same as clicking
     *
     * @param {Object} element
     * @param {function(Event)} cb
     * @returns {Object|undefined} DOM element
     */
    clickable(element, cb)
    {
        if (!element)
        {
            return;
        }

        if (element.getAttribute("tabindex") == null)element.setAttribute("tabindex", 0);
        element.classList.add("eleAsButton");
        element.addEventListener("click", (e) => { cb(e); });
        element.addEventListener("keydown", (e) => { if (e.keyCode === 13 || e.keyCode === 32)cb(e); });
    }

    /**
     * @param {Element} parent
     * @param {String} query
     * @param {function(Event, DOMStringMap)} cb
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
     * can be used for making element keyboard usable and continue using inline onclick e.g. onkepress="ele.keyClick(event,this)"
     *
     * @param {Event} event
     * @param  {Object} element
     */
    keyClick(event, element)
    {
        if ((event.keyCode === 13 || event.keyCode === 32) && element.onclick) element.onclick();
    }

    /**
     * @param {Element} el
     */
    show(el)
    {
        if (el) el.classList.remove("hidden");
    }

    /**
     * @param {Element} el
     */
    hide(el)
    {
        if (el) el.classList.add("hidden");
    }

    /**
     * @param {Element} el
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
     * @param {String} n
     */
    create(n)
    {
        return document.createElement(n);
    }

    /**
     * @param {Element} el
     */
    hasFocus(el)
    {
        return document.activeElement == el;
    }

    /**
     * @param {Element} el
     */
    isVisible(el)
    {
        let style = window.getComputedStyle(el);
        return !(style.display === "none");
    }

    /**
     * @param {Element} element
     * @param {String} html
     */
    append(element, html)
    {
        element.innerHTML += html;
    }
}

export default new Ele();
