import Events from "./eventtarget.js";

export default class ModalBackground extends Events
{
    constructor(options = {})
    {
        super();
        this._eleBg = document.getElementById("modalbg");
        this.showing = false;

        this._eleBg.addEventListener("pointerdown", () =>
        {
            this.hide();
        });
        this._eleBg.addEventListener("click", () =>
        {
            this.hide();
        });

        if (options.listenToEsc)
            document.body.addEventListener("keydown",
                (event) =>
                {
                    if (this.showing && event.key === "Escape") this.hide();
                });
    }

    show(transparent)
    {
        if (!this.showing)
        {
            this.showing = true;
            this.emitEvent("show");
        }
        this._eleBg.style.display = "block";

        if (transparent) this._eleBg.classList.add("modalbgtransparent");
        else this._eleBg.classList.remove("modalbgtransparent");
    }

    hide()
    {
        if (this.showing)
        {
            this.showing = false;
            this.emitEvent("hide");
        }
        this._eleBg.style.display = "none";
    }
}
