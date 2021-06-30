const { PacketDataType } = require("../../util/Constants");
const Util = require("../../util/Util");

/**
 * A packet, either from the server or to the client.
 */
class Packet {
    /**
     * @param {Object|Buffer} data The data of the client.
     */
    constructor(data = {}) {
        /**
         * The current numerical offset of reading data
         * @type {number}
         */
        this.readOffset = 0;

        /**
         * The current numerical offset of writing data
         * @type {number}
         */
        this.writeOffset = 0;

        // read data
        if (data instanceof Buffer) {
            // decode the packet (or try to at least lmao)
            /**
             * The packet associated with this data.
             * @type {Buffer}
             */
            this.data = data;

            /**
             * The length of the packet.
             * @type {number}
             */
            this.length = this.read(PacketDataType.VarInt);

            /**
             * The ID of the packet
             * @type {number}
             */
            this.id = this.read(PacketDataType.VarInt); // ids are varints

            /**
             * The raw data of the packet.
             * @type {Buffer?}
             */
            this.raw = data;

            // set data
            this.length = this.length - (this.readOffset - 1);
            this.data = this.data.slice(this.readOffset);
            this.readOffset = 0;
        } else {
            /**
             * The ID of the packet
             * @type {number}
             */
            this.id = data.id || 0x00;

            /**
             * The packet associated with this data.
             * @type {Buffer}
             */
            this.data = data.data || Buffer.alloc(0);

            /**
             * The length of the apcket
             * @type {number}
             */
            this.length = 0;

            /**
             * The raw data of the packet.
             * @type {Buffer?}
             */
            this.raw = null;
        }
    }

    /**
     * Sets an offet, of `write` or `read`.
     * @param {string} type The type of offset to assign, only accepting `write`, or `read.`
     * @param {number} num The number to assign.
     * @returns {Packet}
     */
    offset(type, num) {
        if (!this[`${type}Offset`])
            return this;

        // set the offset
        this[`${type}Offset`] = num;

        return this;
    }

    /**
     * Reads a portion of a Minecraft packet.
     * @param {PacketDataType} type The datatype to read.
     * @param {number?} [rawLength=0] The length of the bytes to read, if raw.
     * @returns {string|number} 
     */
    read(type, rawLength = 0) {
        let data = null;

        // nothing to read
        if (this.data[this.readOffset] === undefined)
            return null;

        if (type > PacketDataType.Raw) {
            // handle types above raw differently
            if (type == PacketDataType.VarInt) {
                // variable ints
                let varint = readVarNum(this.data, this.readOffset, 35); // 5 bytes is the maximum bitoffset a varint can have

                // assign values
                data = varint.value; // the int is the return value
                this.readOffset = varint.offset; // the offset is what we're placed at upon read
            } else if (type == PacketDataType.VarLong) {
                // variable longs
                let varlong = readVarNum(this.data, this.readOffset, 70); // 10 bytes is the maximum bitoffset a varlong can have

                // assign values
                data = varlong.value; // the int is the return value
                this.readOffset = varint.offset; // the offset is what we're placed at upon read
            } else if (type == PacketDataType.String) {
                let strlen = this.read(PacketDataType.VarInt); // string length is varint

                // set data
                data = this.data.slice(this.readOffset, this.readOffset + strlen).toString("utf8");
                this.readOffset += strlen;
            }
        } else {
            if (type == PacketDataType.Raw) {
                // TODO: make this xd
            } else {
                // get the length of the type
                let len = Util.getDataTypeSize(type);

                if (type == PacketDataType.Long) {
                    this.data.readBigInt64BE()
                } else {
                    data = parseInt(this.data.slice(this.readOffset, this.readOffset + len).toString("hex"), 16);

                    // increment read offset
                    this.readOffset += len;
                }

            }
        }

        return data;
    }

    /**
     * Writes a specific type of data to the packet.
     * @param {PacketDataType} type The datatype to write as.
     * @param {number|string|Buffer} data The data to write.
     * @returns {Packet}
     */
    write(type, data) {
        if (data === null || data === undefined)
            return this;

        if (type > PacketDataType.Raw) {
            // handle types above raw differently
            if (type == PacketDataType.VarInt || type == PacketDataType.VarLong) {
                // fun fact, there's no real fundamental difference between using a long
                // and or using an int here
                // thanks javascript!

                // the write function already neatly handles it
                let val = writeVarNum(this.data, data, this.writeOffset);

                // it provides all the values to set too
                this.data = val.data;
                this.offset = val.offset;
            } else if (type == PacketDataType.String) {
                // strings suck, honestly
                let numlen = writeVarNum(this.data, data.length, this.writeOffset);

                // set offset back
                this.writeOffset = numlen.offset;

                // write data length
                this.data = numlen.data;
                let len = this.data.length;

                // extend the array if necessary
                if ((data.length + this.writeOffset) > len)
                    this.data = Buffer.concat([
                        this.data,
                        Buffer.alloc(((data.length + this.writeOffset) - this.data.length))
                    ]);

                // write the data
                this.data.write(data, this.writeOffset);

                // set offset and length
                this.writeOffset += data.length;
                this.length = this.data.length;
            }
        } else {
            if (type == PacketDataType.Raw) {
                // we can just concatenate raw data tbh
                if ((this.writeOffset + data.length) > this.data.length)
                    this.data = Buffer.concat([this.data, Buffer.alloc((this.writeOffset + data.length) - this.data.length)]);

                this.data = Buffer.concat([
                    this.data.slice(0, this.writeOffset),
                    data,
                    this.data.slice(this.writeOffset + data.length)
                ]);

                // set offset and length
                this.writeOffset += data.length;
                this.length = this.data.length;
            } else {
                // the rest
                let len = Util.getDataTypeSize(type);
                let write = null;

                // set the data to write 
                if (type == PacketDataType.Boolean) {
                    let bool = Util.toBool(data);
                    if (bool == null) {
                        // oopsie
                    } else {
                        write = Buffer.from([ +bool ]);
                    }
                }

                // if it ends up being null then its an absolute waste of time
                if (write == null)
                    return this;

                // automatically free up space just incase~
                if ((this.writeOffset + len) > this.data.length)
                    this.data = Buffer.concat([this.data, Buffer.alloc((this.writeOffset + len) - this.data.length)]);


                // then write it to the buffer
                this.data = Buffer.concat([
                    this.data.slice(0, this.writeOffset),
                    write,
                    this.data.slice(this.writeOffset + len)
                ]);

                // set the packet stuff or whatever
                this.writeOffset += len;
                this.length = this.data.length;
            }
        }

        return this;
    }

    /**
     * Formats the packet into a buffer.
     * @returns {Buffer}
     */
    format() {
        let id = writeVarNum(Buffer.alloc(0), this.id);
        let len = writeVarNum(Buffer.alloc(0), id.data.length + this.length);

        return Buffer.concat([len.data, id.data, this.data]);
    }
}

function readVarNum(buffer, offset, totalLength = 7 * 5) {
    let value = 0;
    let length = 0;
    let bitOffset = 0;

    // read
    let currentByte = 0;
    do {
        currentByte = buffer[offset];

        // increment the vallue
        value |= (currentByte & 127) << bitOffset;

        // increment length of value
        length += 1;

        // break the loop after 5 recursions
        if (bitOffset == totalLength)
            throw new RangeError("Variable-length value is larger than maximum read length.")

        // increment offsets
        bitOffset += 7;
        offset += 1;
    } while ((currentByte & 128) !== 0);

    return {
        value,
        length,
        offset
    };
}

function writeVarNum(buffer, value, offset = 0) {
    let valueBuffer = [];
    let length = 0;

    do {
        let currentByte = (value & 127);

        // bitshift by 1 byte;
        value >>>= 7;
        length++;

        if (value != 0)
            currentByte |= 128;

        // write byte
        valueBuffer.push(currentByte);
    } while (value != 0);

    // write to buffer
    if ((offset + length) > buffer.length)
        buffer = Buffer.concat([buffer, Buffer.alloc((offset + length) - buffer.length)]);

    return {
        data: Buffer.concat([
            buffer.slice(0, offset),
            Buffer.from(valueBuffer),
            buffer.slice(offset + length)
        ]),
        offset: offset + length
    }
}

module.exports = Packet;