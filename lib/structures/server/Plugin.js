/**
 * A basic, generic plugin.
 */
class Plugin {
    constructor(server) {
        /**
         * The server that instantiated this plugin.
         * @type {Server}
         */
        this.server = server;

        /**
         * The events that this plugin is hooked onto.
         * @type {Map}
         */
        this.hooks = new Map();
    }

    /**
     * Hooks onto a server event.
     * @param {string} event The event to hook onto.
     * @param {Function} callback A callback to run and execute the function with.
     */
    hook(event, callback) {
        this.hooks.set(event, callback);
    }

    /**
     * A function that gets ran upon plugin enable.
     * @returns {void}
     */
    enable() {
        return;
    }

    /**
     * A function that gets ran upon plugin disable..
     * @returns {void}
     */
    disable() {
        return;
    }
}

module.exports = Plugin;