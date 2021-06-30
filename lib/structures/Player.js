
const Base = require("./Base");
const { PlayerStatus } = require("../util/Constants");

/**
 * A normal, minecraft player.
 * @extends {Base}
 */
class Player extends Base {
    constructor(server, socket) {
        super(server);

        /**
         * The socket this player belongs to.
         * @type {Socket}
         */
        this.socket = socket;

        /**
         * The current status of this player.
         * @type {PlayerStatus}
         */
        this.status = PlayerStatus.AWAITING_HANDSHAKE;
    }

    /**
     * Sends a buffer to the player.
     * @param {Buffer} buffer The buffer to send.
     * @returns {Player}
     */
    send(buffer) {
        this.socket.write(buffer);

        return this;
    }

    /**
     * Ends the socket.
     * @returns {Player}
     */
    end() {
        this.socket.end();

        return this;
    }
}

module.exports = Player;