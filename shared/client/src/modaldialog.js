
import { hideToolTip } from "../../../cables_ui/src/ui/elements/tooltips.js";
import ele from "./ele.js";
import Events from "./eventtarget.js";
import Logger from "./logger.js";
import ModalBackground from "./modalbg.js";

/**
 * configuration object for loading a patch
 * @typedef {Object} ModalDialogOptions
 * @hideconstructor
 * @property {String} [html=''] html content
 * @property {String} [tite=''] a title of the dialog
 * @property {Boolean} [nopadding=false] remove padding around the window
 * @property {Boolean} [warning=false] show a warning triangle
 * @property {Boolean} [showOkButton=false] show a ok button to close the dialog
 * @property {Boolean} [prompt=false] show an input field to enter a value
 * @property {Boolean} [choice=false] show ok/cancel buttons with onSubmit and onClosed callbacks
 */

/**
 * ModalDialog opens a modal dialog overlay
 *
 * @param {ModalDialogOptions} options The option object.
 * @class
 * @example
 * new ModalDialog(
 * {
 *     "title":"Title",
 *     "html":"hello world",
 * });
 */
export default class ModalDialog extends Events
{
    constructor(options, autoOpen = true)
    {
        super();
        this._log = new Logger("ModalDialog");

        if (window.gui && gui.currentModal) gui.currentModal.close();
        this._options = options;
        this._options.okButton = this._options.okButton || {};
        if (!this._options.okButton.text) this._options.okButton.text = "Ok";
        if (!this._options.okButton.cssClasses) this._options.okButton.cssClasses = "bluebutton";

        this._options.cancelButton = this._options.cancelButton || {};
        if (!this._options.cancelButton.text) this._options.cancelButton.text = "Cancel";
        if (!this._options.cancelButton.cssClasses) this._options.cancelButton.cssClasses = "button";
        if (!this._options.cancelButton.callback) this._options.cancelButton.callback = null;

        this._checkboxGroups = this._options.checkboxGroups || [];

        this._ele = null;
        this._eleContent = null;
        this._bg = new ModalBackground();

        if (autoOpen) this.show();

        ele.byId("modalclose").style.display = "block";
        if (window.gui) gui.currentModal = this;
    }

    close()
    {
        this._ele.remove();
        this._bg.hide();
        if (window.gui) gui.currentModal = null;
        this.emitEvent("onClose", this);
    }

    html()
    {
        let html = "";

        if (this._options.title) html += "<h2>";
        if (this._options.warning) html += "<span class=\"icon icon-2x icon-alert-triangle\" style=\"vertical-align:bottom;\"></span>&nbsp;&nbsp;";
        if (this._options.title) html += this._options.title + "</h2>";

        if (this._options.text)html += this._options.text;
        if (this._options.html)html += this._options.html;

        if (this._options.prompt)
        {
            html += "<br/><br/>";
            html += "<input id=\"modalpromptinput\" class=\"medium\" value=\"" + (this._options.promptValue || "") + "\"/>";
            html += "<br/>";
        }

        if (this._checkboxGroups.length > 0)
        {
            this._checkboxGroups.forEach((group) =>
            {
                html += "<div class=\"checkbox_group_title\">" + group.title + "</div>";
                group.checkboxes.forEach((checkbox) =>
                {
                    const id = "modal_checkbox_" + checkbox.name;
                    const checkboxContainer = document.createElement("div");
                    checkboxContainer.style.display = "flex";
                    checkboxContainer.style.alignItems = "center";

                    const checkboxEle = document.createElement("input");
                    checkboxEle.classList.add("modalcheckbox");
                    checkboxEle.setAttribute("id", id);
                    checkboxEle.setAttribute("type", "checkbox");
                    if (checkbox.name) checkboxEle.setAttribute("name", checkbox.name);
                    if (checkbox.value) checkboxEle.setAttribute("value", checkbox.value);
                    if (checkbox.checked) checkboxEle.setAttribute("checked", "checked");
                    if (checkbox.disabled) checkboxEle.setAttribute("disabled", "disabled");
                    if (checkbox.tooltip)
                    {
                        checkboxEle.classList.add("tt", "tt-info");
                        checkboxEle.dataset.tt = checkbox.tooltip;
                    }
                    checkboxContainer.appendChild(checkboxEle);
                    if (checkbox.title)
                    {
                        checkboxContainer.innerHTML += "<label for=\"" + id + "\">" + checkbox.title + "</label>";
                    }
                    html += checkboxContainer.outerHTML;
                });
            });
        }

        if (this._options.notices && this._options.notices.length > 0)
        {
            html += "<div class=\"modallist notices\">";
            html += "<ul>";
            for (let i = 0; i < this._options.notices.length; i++)
            {
                const item = this._options.notices[i];
                html += "<li>" + item + "</li>";
            }
            html += "</ul></div>";
        }

        if (this._options.prompt)
        {
            html += "<br/>";
            html += "<a class=\"" + this._options.okButton.cssClasses + "\" id=\"prompt_ok\">&nbsp;&nbsp;&nbsp;" + this._options.okButton.text + "&nbsp;&nbsp;&nbsp;</a>";
            html += "&nbsp;&nbsp;<a class=\"button\" id=\"prompt_cancel\">&nbsp;&nbsp;&nbsp;" + this._options.cancelButton.text + "&nbsp;&nbsp;&nbsp;</a>";
        }

        if (this._options.choice)
        {
            html += "<br/><br/>";
            html += "<a class=\"" + this._options.okButton.cssClasses + "\" id=\"choice_ok\">&nbsp;&nbsp;&nbsp;" + this._options.okButton.text + "&nbsp;&nbsp;&nbsp;</a>";
            html += "&nbsp;&nbsp;<a class=\"" + this._options.cancelButton.cssClasses + "\" id=\"choice_cancel\">&nbsp;&nbsp;&nbsp;" + this._options.cancelButton.text + "&nbsp;&nbsp;&nbsp;</a>";
        }

        if (this._options.showOkButton)
        {
            html += "<br/><br/><a class=\"" + this._options.okButton.cssClasses + "\" id=\"modalClose\">&nbsp;&nbsp;&nbsp;" + this._options.okButton.text + "&nbsp;&nbsp;&nbsp;</a>";
        }

        return html;
    }

    _addListeners()
    {
        this._eleClose.addEventListener("pointerdown", this.close.bind(this));

        const elePromptInput = ele.byId("modalpromptinput");
        if (elePromptInput)
        {
            elePromptInput.focus();
            elePromptInput.addEventListener("keydown", (e) =>
            {
                if (e.code == "Enter") this._promptSubmit();
            });
        }

        const elePromptOk = ele.byId("prompt_ok");
        if (elePromptOk)
        {
            elePromptOk.addEventListener("pointerdown", () =>
            {
                this._promptSubmit();
            });
        }

        const elePromptCancel = ele.byId("prompt_cancel");
        if (elePromptCancel) elePromptCancel.addEventListener("pointerdown", this.close.bind(this));

        const eleChoiceOk = ele.byId("choice_ok");
        if (eleChoiceOk)
        {
            eleChoiceOk.addEventListener("pointerdown", () =>
            {
                this._choiceSubmit();
            });
        }

        const eleChoiceCancel = ele.byId("choice_cancel");
        if (eleChoiceCancel)
        {
            eleChoiceCancel.addEventListener("pointerdown", () =>
            {
                this.close();
                if (this._options.cancelButton.callback) this._options.cancelButton.callback();
            });
        }

        const eleModalOk = ele.byId("modalClose");
        if (eleModalOk)
        {
            eleModalOk.addEventListener("pointerdown", () =>
            {
                this.close();
            });
        }
    }

    updateHtml(h)
    {
        this._options.html = h;
        this._eleContent.innerHTML = this.html();
    }

    show()
    {
        this._bg.show();

        this._ele = document.createElement("div");
        this._eleContent = document.createElement("div");

        this._eleCloseIcon = document.createElement("span");
        this._eleCloseIcon.classList.add("icon-x", "icon", "icon-2x");
        this._eleClose = document.createElement("div");
        this._eleClose.classList.add("modalclose");
        this._eleClose.appendChild(this._eleCloseIcon);
        this._eleClose.style.display = "block";

        this._ele.classList.add("modalcontainer");
        this._ele.classList.add("cablesCssUi");
        this._ele.appendChild(this._eleClose);
        this._ele.appendChild(this._eleContent);

        document.body.appendChild(this._ele);

        if (!this._options.nopadding) this._eleContent.style.padding = "15px";
        if (this._options.nopadding) this._ele.style.padding = "0px";

        this._eleContent.innerHTML = this.html();

        Array.from(document.querySelectorAll("pre code")).forEach(function (block)
        {
            hljs.highlightElement(block);
        });

        this._addListeners();

        if (CABLES && CABLES.UI) hideToolTip();

        this.emitEvent("onShow", this);
    }

    getElement()
    {
        return this._ele;
    }

    _choiceSubmit()
    {
        const states = this._getCheckboxStates();
        this.close();
        this.emitEvent("onSubmit", null, states);
    }

    _promptSubmit()
    {
        const elePromptInput = ele.byId("modalpromptinput");

        if (!elePromptInput) return this._log.warn("modal prompt but no input...?!");
        if (!this._options.promptOk) return this._log.warn("modal prompt but no promptOk callback!");

        const states = this._getCheckboxStates();
        this.close();
        this._options.promptOk(elePromptInput.value, states);
        this.emitEvent("onSubmit", elePromptInput.value, states);
    }

    persistInIdleMode()
    {
        return this._options.persistInIdleMode;
    }

    _getCheckboxStates()
    {
        const checkboxes = ele.byQueryAll(".modalcheckbox");
        const checkboxStates = {};
        checkboxes.forEach((checkbox) =>
        {
            let state = checkbox.checked;
            if (state)
            {
                if (checkbox.value && (checkbox.value !== "on"))
                {
                    state = checkbox.value;
                }
            }
            checkboxStates[checkbox.getAttribute("name")] = state;
        });
        return checkboxStates;
    }
}
