const ServerProperties = require("../lib/util/ServerProperties");

let properties = ServerProperties.read(__dirname + "/files/server.properties");

console.log(ServerProperties.default())