const fs = require("fs");
const Util = require("./Util");

/**
 * A Java-edition Server properties parser class.
 * NOTE: Bedrock edition is not supported as of writing this message!
 */
class ServerProperties {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated, as all the methods are static.`);
    }

    /**
     * Reads and parses the text of a server.properties file
     * @param {string} path The path of the file.
     * @returns {Object}
     */
    static read(path) {
        return ServerProperties.parse(fs.readFileSync(path, "utf-8"));
    }

    /**
     * The properties of a Minecraft server.
     * @typedef {Object} ServerOptions
     */

    /**
     * Parses a server.properties string into a readable JavaScript object.
     * @param {string} string The UTF-8 text of a server.properties file.
     * @returns {Object}
     */
    static parse(string) {
        let properties = {};
        let values = string.split(/(\n|\r\n)/g);

        for (let line of values) {
            if (line.startsWith("#") || line == "" || line.length == 0) {
                // ignore all comments, and empty lines
                continue;
            }

            // split the line in half
            let [ key, value ] = line.split("=");

            // as of writing this, keys should not have spaces, only dashes
            key = key.replace(/\s/g, "-");

            // add the property
            if (Util.toBool(value) !== null) {
                // add as bool
                properties[key] = Util.toBool(value);
            } else  {
                // add as number, or string if NaN
                properties[key] = parseInt(value) || value;
            }
        }

        // remove all undefined properties
        let parsedProperties = {};
        for (let key of Object.keys(properties)) {
            if (properties[key] !== undefined)
                parsedProperties[key] = properties[key];
        }

        return parsedProperties;
    }

    /**
     * Gets the default server properties based off the internal server.properties provided.
     * This is the default as of 21w15a.
     * @returns {object}
     */

    static default() {
        return ServerProperties.read(__dirname + "/internal/server.properties");
    }
}

module.exports = ServerProperties;