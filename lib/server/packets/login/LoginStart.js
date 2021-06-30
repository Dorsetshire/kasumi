const crypto = require("crypto");
const UUID = require("uuid-1345")

const Packet = require("../../../structures/server/Packet");
const { ServerboundID, PacketDataType, ClientboundID, PlayerStatus } = require("../../../util/Constants");
const Handler = require("../Handler");

class LoginStart extends Handler {
    constructor(server) {
        super(server, ServerboundID.LoginStart);
        
    }

    handle(player, packet) {
        let username = packet.read(PacketDataType.String);
        // no encryption request if the server is in offline-mode
        if (this.server.options["online-mode"] == false) {
            // directly send login success to the client
            let successPacket = new Packet({
                id: ClientboundID.LoginSuccess
            });

            // write a random uuid
            let uuid = LoginStart.createOfflineUUID(username);
            successPacket.write(PacketDataType.Raw, uuid.toBuffer());

            // write the username
            successPacket.write(PacketDataType.String, username);

            // set player data
            player.username = username;
            player.uuid = uuid;

            // send packet to player
            player.send(successPacket.format());

            // player is connected uwu
            player.status = PlayerStatus.CONNECTED;

            // execute player connect hook
            this.server.executeHook("playerConnected", player);
            return;
        }
    }

    /**
     * Creates a UUID buffer based off the native OpenJDK7 UUID utility.
     * @param {string} string The string to assign.
     * @returns {Buffer}
     */
    static createUUIDBuffer(string) {
        let md5hash = crypto.createHash("md5").update(string, "utf8");
        let buffer = md5hash.digest(); // create a buffer out of it
        
        // assign values to the uuid
        buffer[6] = (buffer[6] & 0x0F) | 0x30; // clear version & set it to uuid v3
        buffer[8] = (buffer[8] & 0x3F) | 0x80; // set uuid to ietf variation

        // return the buffer
        return buffer;
    }

    /**
     * Creates a UUID for offline players, based off a set namespace.
     * @param {string} username The username.
     */
    static createOfflineUUID(username) {
        return new UUID(LoginStart.createUUIDBuffer(`OfflinePlayer:${username}`));
    }
}

module.exports = LoginStart;