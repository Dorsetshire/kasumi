
/**
 * A generic packet handler.
 */
class Handler {
    /**
     * @param {Server} server The server that instantiated this handler.
     * @param {number} id The packet ID that this handler will accept.
     */
    constructor(server, id) {
        /**
         * The server that instantiated this handler.
         * @type {Server}
         */
        this.server = server;
        /**
         * The packet ID that this handler will accept.
         * @type {number}
         */
        this.id = id ?? -1;
    }

    /**
     * Handles a packet provided by the client.
     * @type {PLayer} The player that sent the packet.
     * @type {Packet} packet The packet to handle.
     */
    handle(player, packet) {
        return packet;
    }
}

module.exports = Handler;