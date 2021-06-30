const fs = require("fs");

const Handler = require("./Handler");

const IGNORE = [
    "LoginStart"
];

/**
 * A manager for all packet handlers.
 */
class HandlerManager {
    /**
     * @param {Server} server The server that created this manager.
     */
    constructor(server) {
        /**
         * The server that created this manager.
         * @type {Server}
         */
        this.server = server;

        this.login = {};
        this.play = {};

        // register all login handlers
        for (let file of fs.readdirSync(__dirname + "/login")) {
            // register
            this.register(require(`./login/` + file), "login");
        }

        // register all play handlers
        for (let file of fs.readdirSync(__dirname + "/play")) {
            // register
            this.register(require(`./play/` + file), "play");
        }
    }

    /** 
     * Registeres a handler to the manager.
     * @param {Handler} [Handler] The handler to register.
     */
    register(Handler, type) {
        let handler = new Handler(this.server);

        this[type][handler.id] = handler;
    }
}

module.exports = HandlerManager;