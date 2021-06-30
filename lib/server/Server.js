const net = require("net");
const EventEmitter = require("events");

const Util = require("../util/Util");
const ServerProperties = require("../util/ServerProperties");
const Packet = require("../structures/server/Packet");
const ChatComponent = require("../structures/chat/ChatComponent");
const Player = require("../structures/Player");
const HandlerManager = require("./packets/HandlerManager");
const Collection = require("../util/Collection");

// Constants
const { Events, ServerStatus, ClientboundID, PacketDataType, PlayerStatus, ServerboundID, HandshakeState, MinecraftVersion, ProtocolVersion } = require("../util/Constants");
const ComponentGroup = require("../structures/chat/ComponentGroup");

/**
 * A basic minecraft server.
 * @extends {EventEmitter}
 */
class Server extends EventEmitter {
    /**
     * @params {ServerOptions} options The main options for a server.
     */
    constructor(options = {}) {
        super();

        /**
         * The options of a Kasumi Server.
         * @type {ServerOptions}
         */
        this.options = Util.mergeObjects({
            // our own properties
            "autoload-plugins": true,

            // drag in default server properties
            ...ServerProperties.default()
        }, options);

        /**
         * The backend TCP server.
         * @type {Server}
         */
        this.server = net.createServer();

        /**
         * The status of the server.
         * @type {ServerStatus}
         */
        this.status = ServerStatus.STARTING;

        /**
         * The handler manager for this server.
         * @type {HandlerManager}
         */
        this.handlers = new HandlerManager(this);

        /**
         * The plugins of this server.
         * @type {Collection}
         */
        this.plugins = new Collection();

        /**
         * The players online this server.
         * @type {Collection}
         */
        this.players = new Collection();
    }

    /**
     * Starts the Kasumi Server, with the options provided.
     */
    start() {
        // set events
        this.server.on("connection", (socket) => {
            this.onConnect(socket)
        });

        /**
         * Emitted whenever the server encounters an error.
         * @event Server#error
         * @param {Error} error The error.
         */
        this.server.on("error", (error) => {
            this.emit("error", error);
        });

        /**
         * Emitted whenever the server is successfully started.
         * @event Server#start
         * @param {ServerOptions} options The options provided to the server upon construction
         */
        this.server.listen(this.options["server-port"], () => {
            this.onOpen();
        })
    }

    /// PLUGIN METHODS

    /**
     * A plugin's properties, and assigned data.
     * @typedef {Object} Plugin
     * @property {string} name The name of the plugin.
     */

    /**
     * Adds a plugin to the server.
     * Ideally, this should be ran before the start function.
     * @param {PluginData} data The data to assign to the plugin.
     * @param {Plugin} pluginClass A class that implements the Plugin instance.
     */
    addPlugin(data, pluginClass) {
        this.plugins.set(data.name, new pluginClass(this));
    }

    /**
     * Loads all the plugins.
     */
    loadPlugins() {
        for (let Plugin of this.plugins.values()) {
            // run the plugin's enable event
            Plugin.enable();
        }
    }

    /// PRIVATE METHODS

    // What the fuck is *[]
    /**
     * Executes all the plugins hooked onto a certain event.
     * @param {string} name The name of the hook to execute.
     * @param {*[]} data The data to assign.
     */
    executeHook(name, ...data) {
        let plugins = this.plugins.filter((plugin) => plugin.hooks.get(name));

        for (let plugin of plugins) {
            plugin.hooks.get(name)(...data);
        }
    }

    /**
     * Handled when the srver is started.
     * @private
     */
    onOpen() {
        // assign the server to a global object
        // makes it easier for plugins to interact with the server itself
        global.__KASUMI_SERVER = this;

        /// load plugins, if necessary
        if (this.options["autoload-plugins"] == true) {
            this.status = ServerStatus.LOADING_PLUGINS;
            this.loadPlugins();
        }

        // render the server started
        this.status = ServerStatus.OPEN;

        /**
         * Emitted whenever the server is successfully started.
         * @event Server#start
         * @param {ServerOptions} options The options provided to the server upon construction
         */
        this.emit(Events.START, this.options);
    }

    /**
     * Handles a new connection.
     * @private
     */
    onConnect(socket) {
        // check whether or not the server is started or not
        if (this.status !== ServerStatus.OPEN) {
            // create a login disconnect message
            let packet = new Packet({
                id: ClientboundID.DisconnectLogin
            });

            packet.write(PacketDataType.String, new ChatComponent({
                text: "This server is still starting!"
            }).format());

            socket.write(packet.format());

            // disconnect the socket
            socket.end();
            return;
        }

        // create a player
        let player = new Player(this, socket);

        // begin recieving messages
        socket.on("data", (raw) => {
            if (player.status == PlayerStatus.AWAITING_HANDSHAKE) {
                // assume first message is a handshake
                let packet = new Packet(raw);

                if (packet.id !== 0x00) { // handshake is 0x00
                    // disconnect the user
                    let disconnectPacket = new Packet({
                        id: ClientboundID.DisconnectLogin
                    });

                    disconnectPacket.write(PacketDataType.String, new ChatComponent({
                        text: "Invalid login sequence."
                    }).format());

                    player.send(disconnectPacket.format());

                    // disconnect the socket
                    player.end();
                    return;
                } else {
                    // handshake
                    let protocolVersion = packet.read(PacketDataType.VarInt);
                    let serverAddress = packet.read(PacketDataType.String);
                    let serverPort = packet.read(PacketDataType.UnsignedShort);
                    let nextState = packet.read(PacketDataType.UnsignedByte);

                    if (nextState == HandshakeState.Status) {
                        // status ping
                        player.status = PlayerStatus.AWAITING_STATUS;
                    } else if (nextState == HandshakeState.Login) {
                        // reject versions that dont fit our protocol version
                        if (protocolVersion !== ProtocolVersion) {
                            // disconnect the user
                            let disconnectPacket = new Packet({
                                id: ClientboundID.DisconnectLogin
                            });

                            disconnectPacket.write(PacketDataType.String, new ChatComponent({
                                text: `Unsupported protocol version! (Server on ${MinecraftVersion} (${ProtocolVersion})`
                            }).format());

                            player.send(disconnectPacket.format());

                            // disconnect the socket
                            return player.end();
                        }

                        // set status
                        player.status = PlayerStatus.CONNECTING;
                    }
                }
            } else {
                this.onMessage(player, new Packet(raw));
            }
            
            /**
             * Emitted whenever a packet is sent.
             * @event Server#raw
             * @param {Buffer} raw The raw data of the packet.
             */
            this.emit(Events.RAW, raw);
        });
    }

    onMessage(player, packet) {
        if (player.status == PlayerStatus.AWAITING_STATUS) {
            // this is a request packet
            if (packet.id == ClientboundID.Ping) {
                // ...can't we just resend the packet back to them?
                player.send(packet.raw);

                // disconnect the socket
                player.end();
            } else if (packet.id == ClientboundID.StatusRequest) {
                let responsePacket = new Packet({
                    id: ServerboundID.StatusResponse
                });

                let description = new ChatComponent();

                // motd can be a ChatComponent instance
                if (this.options["motd"] instanceof ChatComponent || this.options["motd"] instanceof ComponentGroup) {
                    description = this.options["motd"];
                } else {
                    // assume its a string
                    description.setText(this.options["motd"]);
                }

                let connected = this.players.map((player) => {
                    if (player.status == PlayerStatus.CONNECTED) {

                    } else {
                        return undefined;
                    }
                }).filter(x => x !== undefined);

                responsePacket.write(PacketDataType.String, JSON.stringify({
                    version: {
                        name: MinecraftVersion,
                        protocol: ProtocolVersion
                    },
                    players: {
                        max: this.options["max-players"],
                        online: connected.length,
                        sample: connected
                    },
                    description: description.format(true),
                }));

                player.send(responsePacket.format());
            }
        } else if (player.status == PlayerStatus.CONNECTING) {
            // pre connect, so its login packets
            if (!this.handlers.login[packet.id]) {
                return this.emit(Events.DEBUG, {
                    message: "A login packet (id: " + packet.id + ") from a client went unhandled, as it has no associated handler.",
                    type: "login",
                    player,
                    packet
                });
            }

            return this.handlers.login[packet.id].handle(player, packet);
        } else {
            // play packets
            if (!this.handlers[packet.id]) {
                return this.emit(Events.DEBUG, {
                    message: "A normal packet (id: " + packet.id + ") from a client went unhandled, as it has no associated handler.",
                    type: "play",
                    player,
                    packet
                });
            }

            return this.handlers[packet.id].handle(player, packet);
        }
    }
}

module.exports = Server;