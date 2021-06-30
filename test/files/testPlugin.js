const { Plugin } = require("../../lib");

class TestPlugin extends Plugin {
    constructor(server) {
        super(server);

        this.hook("playerConnected", this.onPlayerConnect);
    }

    enable() {
        console.log("testplugin enabled!");
    }

    /// HOOKS
    onPlayerConnect(player) {
        console.log(player.username);
    }
}

module.exports = TestPlugin;