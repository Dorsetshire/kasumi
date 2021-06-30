module.exports = {
    // KASUMI SERVER
    Server: require("./server/Server"),

    // STRUCTURES
    /// SERVER STRUCTURES
    Packet: require("./structures/server/Packet"),
    Plugin: require("./structures/server/Plugin"),

    // CHAT STRUCTURES
    ComponentGroup: require("./structures/chat/ComponentGroup"),
    ChatComponent: require("./structures/chat/ChatComponent"),

    /// GENERAL STRUCTURES

    // UTILITIES
    ServerProperties: require("./util/ServerProperties"),
    Util: require("./util/Util")
}