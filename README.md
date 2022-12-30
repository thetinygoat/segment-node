# Segment Node

A simple and modern [Segment](https://github.com/segment-dev/segment) client for Node.js with 0 dependencies.

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

const ping = await client.ping();
const create = await client.create("test", { ifNotExists: true });
const set = await client.set("test", "foo", "bar", { ifNotExists: true });
const get = await client.get("test", "foo");

// get value as buffer
const getBuffer = await client.get("test", "foo", { asBuffer: true });
const keyspaces = await client.keyspaces();
console.log({ ping, set, get, getBuffer, create, keyspaces });

/// output
{
  ping: 'PONG',
  set: false,
  get: 'bar',
  getBuffer: <Buffer 62 61 72>,
  create: false,
  keyspaces: [ { name: 'test', evictor: 'NOP' } ]
}
```

### All Commands

-   `async create(keyspace: string | Buffer, options?: CreateCommandOptions)`
-   `async drop(keyspace: string | Buffer, options?: DropCommandOptions)`
-   `async set(keyspace: string | Buffer, key: string | Buffer, value:string | Buffer, options?: SetCommandOptions)`
-   `async get(keyspace: string | Buffer, key: string | Buffer, options?: SegmentCommandOptions)`
-   `async del(keyspace: string | Buffer, key: string | Buffer, options?: SegmentCommandOptions)`
-   `async ttl(keyspace: string | Buffer, key: string | Buffer, options?: SegmentCommandOptions)`
-   `async count(keyspace: string | Buffer, options?: SegmentCommandOptions)`
-   `async keyspaces(options?: SegmentCommandOptions)`
-   `async ping(options?: SegmentCommandOptions)`
