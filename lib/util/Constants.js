/// GENERAL CONSTANTS
exports.Color = {
    Black: "black",
    DarkBlue: "dark_blue",
    DarkGreen: "dark_green",
    DarkCyan: "dark_aqua",
    DarkRed: "dark_red",
    DarkPurple: "dark_purple",
    Gold: "gold",
    Gray: "gray",
    DarkGray: "dark_gray",
    Blue: "blue",
    Green: "green",
    Cyan: "aqua",
    Red: "red",
    Pink: "light_purple",
    Yellow: "yellow",
    White: "white"
}

/// PACKET CONSTANTS

exports.ClientboundID = {
    // LOGIN IDS
    DisconnectLogin: 0x00,
    EncryptionRequest: 0x01,
    LoginSuccess: 0x02,

    // STATUS IDS
    StatusRequest: 0x00,
    Ping: 0x01,

    // IN-GAME IDS
};

exports.ServerboundID = {
    // LOGIN IDS
    LoginStart: 0x00,
    EncryptionResponse: 0x01,

    // STATUS IDS
    StatusResponse: 0x00,
    Pong: 0x01

    // IN-GAME IDS
}

exports.PacketDataType = {
    // boolean
    Boolean: 0,

    // INTEGER VALUES
    Byte: 1,
    UnsignedByte: 2,
    Short: 3,
    UnsignedShort: 4,
    Int: 5,
    Long: 6,

    // DECIMAL VALUES
    Float: 7,
    Double: 8,

    // RAW VALUES
    Raw: 9,

    // STRING-BASED VALUES
    String: 10,

    // VARIABLE VALUES
    VarInt: 11,
    VarLong: 12,
};

/// PLAYER CONSTANTS

exports.PlayerStatus = {
    AWAITING_STATUS: -1,
    AWAITING_HANDSHAKE: 0,
    CONNECTING: 1,
    CONNECTED: 2
};

exports.HandshakeState = {
    Status: 1,
    Login: 2
}

/// SERVER CONSTANTS

exports.ServerStatus = {
    STARTING: 0,
    LOADING_PLUGINS: 1,
    OPEN: 2,
};

exports.MinecraftVersion = "1.17";
exports.ProtocolVersion = 755;
exports.APIVersion = 1;

exports.Events = {
    // server events
    START: "start",

    // generic events
    ERROR: "error",
    WARN: "warn",
    DEBUG: "debug",
    RAW: "raw"
};