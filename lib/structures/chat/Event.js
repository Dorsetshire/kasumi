/**
 * An event to a chat component.
 */
class Event {
    /**
     * @param {object} data The data to this event.
     */
    constructor(data) {
        /**
         * The action of this event.
         * @type {string}
         */
        this.action = data.action || null;
    }
}