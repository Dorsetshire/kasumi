/// DEFAULT DATA
let array = [0x80, 0x02];

/// BUFFER
let start = process.hrtime.bigint();
let buffer = Buffer.alloc(0);

if (array.length > buffer.length)
  buffer = Buffer.concat([ buffer, Buffer.alloc(array.length) ]);

(Buffer.from(array)).copy(buffer, 0);
let end = process.hrtime.bigint()
console.log("Buffer: Time taken: " +`${(end - start) / 1000000n}ms`);

/// FROM CHARCODE
start = process.hrtime.bigint();
buffer = Buffer.alloc(0);

let string = String.fromCharCode(...array);

if (string.length > buffer.length)
  buffer = Buffer.concat([ buffer, Buffer.alloc(string.length) ]);

buffer.write(string, 0)

end = process.hrtime.bigint();
console.log("fromCharCode: Time taken: " +`${(end - start) / 1000000n}ms`);

/// USING JUST CONCAT
start = process.hrtime.bigint();
buffer = Buffer.alloc(0);

if (string.length > buffer.length)
  buffer = Buffer.concat([ buffer, Buffer.alloc(string.length) ]);

buffer = Buffer.concat([
    buffer.slice(0),
    Buffer.from(array),
    buffer.slice(array.length)
])

end = process.hrtime.bigint();
console.log("just concat lmao: Time taken: " +`${(end - start) / 1000000n}ms`);
console.log((end - start))