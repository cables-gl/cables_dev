/**
 * Ele - minimalistic html dom helper
 *
 * @class
 */
class Ele
{
    /**
     * shortcut for document.getElementById(id)
     * @param  {String} id
     * @returns {Object} DOM element
     */
    byId(id)
    {
        if (id && id[0] === "#") console.warn("ele.byId should not contain #");
        return document.getElementById(id);
    }

    /**
     * shortcut for document.querySelector(id)
     * @param  {String} q
     * @returns {Object} DOM element
     */
    byQuery(q)
    {
        return document.querySelector(q);
    }

    /**
     * shortcut for document.querySelectorAll(id)
     * @param  {String} q
     * @returns {Array} DOM elements
     */
    byQueryAll(q)
    {
        return document.querySelectorAll(q);
    }

    /**
     * returns the first element with class
     * @param  {String} name
     * @returns {Object} DOM element
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
     * @param  {String} name
     * @returns {Array} DOM elements
     */
    byClassAll(name)
    {
        if (name && name[0] === ".") console.warn("ele.byClassAll should not contain .");
        const els = document.getElementsByClassName(name);
        if (!els) return [];
        return els;
    }

    forEachClass(name, cb)
    {
        if (name && name[0] === ".") console.warn("ele.forEachClass should not contain .");

        const eles = document.getElementsByClassName(name);
        for (let i = 0; i < eles.length; i++) cb(eles[i]);
    }

    getSelectValue(el)
    {
        return el.options[el.selectedIndex].value || el.options[el.selectedIndex].text;
    }


    /**
     * makes an element clickable and executes the callback, also add keyboard support, when hitting enter on the element is same as clicking
     * @param  {Object} element
     * @returns {Object} DOM element
     */
    asButton(ele, cb)
    {
        if (!ele)
        {
            console.log((new Error()).stack);
            return console.log("no ele as button");
        }


        if (ele.getAttribute("tabindex") == null)ele.setAttribute("tabindex", 0);
        ele.addEventListener("click", cb);
        ele.addEventListener("keydown", (e) => { if (e.keyCode == 13)cb(); });
    }


    show(el)
    {
        if (el)el.classList.remove("hidden");
    }

    hide(el)
    {
        if (el)el.classList.add("hidden");
    }

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

    create(n)
    {
        return document.createElement(n);
    }

    hasFocus(el)
    {
        return document.activeElement == el;
    }

    isVisible(el)
    {
        let style = window.getComputedStyle(el);
        return !(style.display === "none");
    }

    append(ele, html)
    {
        ele.innerHTML += html;
    }
}

export default new Ele();
