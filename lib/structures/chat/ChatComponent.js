const { Color } = require("../../util/Constants");
const ComponentGroup = require("./ComponentGroup");

/**
 * Represents the JSON chat that Minecraft handles.
 * @see https://wiki.vg/Chat#Current_system_.28JSON_Chat.29
 */
class ChatComponent {
    /**
     * @param {object|ChatComponent} data The component to import.
     */
    constructor(data = {}) {
        /**
         * The text of this component.
         * @type {string?}
         */
        this.text = data.text || null;

        /**
         * Whether or not this component is bolded.
         * @type {boolean?}
         */
        this.bold = data.bold || false;

        /**
         * Whether or not this component is italicized.
         * @type {boolean?}
         */
        this.italic = data.italic || false;

        /**
         * Whether or not this component is underlined.
         * @type {boolean?}
         */
        this.underlined = data.underlined || false;

        /**
         * Whether or not this component is struck out.
         * @type {boolean?}
         */
        this.strikethrough = data.strikethrough || false;

        /**
         * Whether or not this component is obfuscated.
         * @type {boolean?}
         */
        this.obfuscate = data.obfuscate || false;

        /**
         * The color of this component.
         * @type {string|Color}
         */
        this.color = this._safelySetColor(data.color || null); // safely set the color

        /**
         * The translation key of this component.
         * SIDENOTE: If a translation key is provided, then the `text` property of the component is fully ignored.
         * @type {string?}
         */
        this.translate = data.translate || null;

        /**
         * The sub-components belonging to this component.
         * @type {ChatComponent[]}
         */
        this.components = []
    }

    /**
     * Sets the text of the component.
     * @param {string} string The string to set.
     * @returns {ChatComponent}
     */
    setText(string) {
        this.text = string;

        return this;
    }


    /**
     * Sets the localized translate key of the component.
     * @param {string} string The string to set.
     * @returns {ChatComponent}
     */
    setTranslate(key) {
        this.translate = key;

        return this;
    }

    /**
     * Sets the color of the component.
     * @param {string|Color} color The color to set, either in hexadecimal, or not.
     * @returns {ChatComponent}
     */
    setColor(col) {
        this.color = this._safelySetColor();
        return this;
    }

    /**
     * Adds a subcomponent to this component.
     * @param {ChatComponent|object} comp The component.
     * @returns {ChatComponent}
     */
    addComponent(comp) {
        this.components.push(comp);

        return this;
    }

    /**
     * Groups components together alongside this one.
     * @param {ChatComponent|ChatComponent[]} [components] The components to group together.
     */
    group(...components) {
        return new ComponentGroup([this, ...components]);
    }

    /**
     * Formats the component.
     * @param {boolean} [asObject=false] Whether or not to format the component as a string, or an object.
     * @returns {Object}
     */
    format(asObject = false) {
        let ret = {};

        // assign data
        for (let key of Object.keys(this)) {
            if (key == "components")
                continue;
            
            if (this[key])
                ret[key] = this[key];
        }

        // text is ignored if translate is provided
        if (ret.translate) {
            ret.text = null;
        }

        if (this.components.length > 0) {
            ret.extra = [];
            for (let component of this.components) {
                if (component instanceof ChatComponent) {
                    ret.extra.push(component.format());
                } else {
                    ret.extra.push(component);
                }
            }
        }

        if (asObject == true) {
            return ret;
        } else {
            return JSON.stringify(ret);
        }
    }

    /// PRIVATE METHODS

    /**
     * Safely parses a color string.
     * @param {string|Color} color The color to set, either in hexadecimal, or not.
     * @returns {Color?}
     */
    _safelySetColor(col) {
        let hexRegex = /^#([0-9a-fA-F]{2,}){1,3}$/g;
        let setColor = null;

        if (col == null)
            return null;

        // try hexadecimal
        if (hexRegex.test(col)) {
            if (col.length > 7)
                throw new RangeError("The length of the hexadecimal string is too long.")

            if (col.length !== 7 && (col.length % 2) == 1)
                throw new RangeError("The length of the hexadecimal string isn't a multiple of 2.");

            if (!col.startsWith("#"))
                col = `#${col}`;

            setColor = col;
        } else {
            // its probably a normal color string then
            if (Object.values(Color).includes(col)) {
                setColor = col
            } else if (col in Color) {
                setColor = Color[col];
            }
        }

        return setColor;
    }
}

module.exports = ChatComponent;