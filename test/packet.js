const { Packet } = require("../lib/index");
const { PacketDataType } = require("../lib/util/Constants");

/// READ
let packet = new Packet(Buffer.concat([
    Buffer.from([ 0x18, 0x00, 0x16 ]),
    Buffer.from('{"text":"go away uwu"}')
]));

console.log(packet)

let string = packet.read(PacketDataType.String);

console.log(string)

/// WRITE
let writePacket = new Packet();

writePacket.write(PacketDataType.Boolean, false);
writePacket.write(PacketDataType.Boolean, "true");
writePacket.write(PacketDataType.Boolean, 0);
writePacket.write(PacketDataType.Boolean, "True");
writePacket.write(PacketDataType.Boolean, "0");

console.log(writePacket.format());

// write over data, owo?
writePacket.offset("write", 1).write(PacketDataType.Boolean, false)
writePacket.offset("write", 2).write(PacketDataType.Boolean, true)

console.log(writePacket.format());