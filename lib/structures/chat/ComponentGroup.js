/**
 * A group of components.
 */
class ComponentGroup {
    constructor(components) {
        /**
         * The components within this group.
         * @type {ChatComponent[]}
         */
        this.components = components || [];
    }

    /**
     * Adds a subcomponent to this group.
     * @param {ChatComponent|object} comp The component.
     * @returns {ChatComponent}
     */
    component(comp) {
        this.components.push(comp);

        return this;
    }
    /**
     * Formats the group of components.
     * @param {boolean} [asObject=false] Whether or not to format the group as a string, or an object.
     * @returns {string|Object}
     */
    format(asObject = false) {
        let ret = [];

        for (let component of this.components) {
            // we can provide true anyways, as it'll all be nicely stringified anyways
            ret.push(component.format(true));
        }

        if (asObject == true) {
            return ret;
        } else {
            return JSON.stringify(ret);
        }
    }

    /**
     * Statically creates a component group.
     */
    static create(...components) {
        return new ComponentGroup(...components);
    }
}

module.exports = ComponentGroup;