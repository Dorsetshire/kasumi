const { Server, ComponentGroup, ChatComponent } = require("../lib/index.js");
const TestPlugin = require("./files/testPlugin.js");

const server = new Server({
    "server-port": "10101",
    "online-mode": false,
    motd: ComponentGroup.create([
        new ChatComponent({
            text: "A Kasumi-made Server:"
        }),
        new ChatComponent({
            text: " only in 1.17!",
            bold: true,
            color: "#74A7ED"
        })
    ])
});

// listeners
server.on("start", () => {
    console.log("Server started!")
});

server.on("debug", (debug) => {
    console.log(debug.message);
    if (debug.packet) {
        console.log(debug.packet);
    }
});

// add plugins
server.addPlugin({
    name: "TestPlugin",
}, TestPlugin);

// start
server.start();