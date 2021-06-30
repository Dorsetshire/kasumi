class Base {
    constructor(server) {
        /**
         * The serrve that instantiated this object.
         * @name Base#server
         * @type {Server}
         * @readonly
         */
        Object.defineProperty(this, 'server', { value: server });
    }
}

module.exports = Base;