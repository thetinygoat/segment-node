# Segment Node

A simple and modern [Segment](https://github.com/segment-dev/segment) client for Node.js

### Installation

```shell
npm i @segment-dev/segment
```

## Usage

### Basic Example

```javascript
import { SegmentClient } from "@segment-dev/segment";

const client = new SegmentClient({ host: "127.0.0.1", port: 1698 });

await client.connect();

const pong = await client.sendCommand(["PING"]); // PONG
const create = await client.sendCommand([
    "CREATE",
    "my_keyspace",
    "IF_NOT_EXISTS",
]);

const set = await client.sendCommand(["SET", "my_keyspace", "foo", "bar"]);

const get = await client.sendCommand(["GET", "my_keyspace", "foo"]);

// return result as buffer
const getBuffer = await client.sendCommand(["GET", "my_keyspace", "foo"], {
    asBuffer: true,
});

console.log({ pong, create, set, get, getBuffer });

/// output
{
  pong: 'PONG',
  create: true,
  set: true,
  get: 'bar',
  getBuffer: <Buffer 62 61 72>
}
```

## TODO

-   Add wrappers over `sendCommand` for all the commands
-   Add more tests
