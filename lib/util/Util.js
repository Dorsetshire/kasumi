const { PacketDataType } = require("./Constants");

/**
 * A bunch of generic utilities.
 */
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated, as all the methods are static.`);
    }
    
    /**
     * Function to merge two objects with eachother, and replace the values of the first with the second.
     * @param {Object} object The base object.
     * @param {Object} merge The object to merge with the base object.
     */
    static mergeObjects(object, merge) {
        let keys = Object.keys(object);

        keys.forEach((key) => {
            if ((object[key] instanceof Array) && merge[key]) {
                merge[key].forEach((data) => object[key].push(data));
            } else if ((object[key] instanceof Object) && merge[key]) {
                object[key] = Util.mergeObjects(object[key], merge[key]);
            } else if (merge[key] !== undefined) {
                object[key] = merge[key];
            }
        });

        return object;
    }
    
    /**
     * Validates that an object contains all the keys from an array.
     * @param {string[]} against The keys.
     * @param {Object} object The object to read.
     */
    static validate(against = [], object) {
        object.__missing = [];

        for (let key of against) {
            if (!object[key])
                object.__missing.push(key);
        }

        return object.__missing.length === 0;
    }

    /**
     * Converts a string or number to a proper boolean.
     * @param {string|number|boolean} bool The boolean to parse.
     */
    static toBool(bool) {
        if (typeof bool == "string")
            bool = bool.toLowerCase();
            
        switch (bool) {
            case 0:
            case "0":
            case "false":
            case false:
                return false;

            case 1:
            case "1":
            case "true":
            case true:
                return true;

            default:
                return null;
        }
    }

    static isJSON(obj) {
        try {
            JSON.parse(obj);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    static *range(start, end) {
        for (let i = start; i <= end; i++) {
            yield i;
        }
    }

    static getDataTypeSize(type) {
        switch (type) {
            case PacketDataType.Boolean:
            case PacketDataType.Byte:
            case PacketDataType.UnsignedByte:
                return 1;

            case PacketDataType.Short:
            case PacketDataType.UnsignedShort:
                return 2;

            case PacketDataType.Int:
            case PacketDataType.Float:
                return 4;

            case PacketDataType.Long:
            case PacketDataType.Double:
                return 8;
        }
    }
}

module.exports = Util;