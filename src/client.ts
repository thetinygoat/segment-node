import {
    CreateCommandOptions,
    DropCommandOptions,
    Evictor,
    SegmentCommand,
    SegmentCommandOptions,
    SegmentCommandReply,
    SetCommandOptions,
} from "./command";
import { SegmentConnection, SegmentConnectionOptions } from "./connection";
import { EventLoop } from "./event-loop";

export class SegmentClient {
    private connection: SegmentConnection;
    private eventLoop: EventLoop;

    constructor(options: SegmentConnectionOptions) {
        this.connection = new SegmentConnection(options);
        this.eventLoop = new EventLoop(this.connection);
    }

    async connect(): Promise<void> {
        await this.connection.open();
    }

    sendCommand(
        command: SegmentCommand,
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        if (!options) {
            options = {
                asBuffer: false,
            };
        }

        // queue the command for execution
        const commandPromise = this.eventLoop.queueCommand(command, options);
        // start and event loop tick
        this.eventLoop.tick();

        return commandPromise;
    }

    async create(
        keyspace: string | Buffer,
        options?: CreateCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["CREATE", keyspace];
        if (options) {
            if (options.evictor) {
                switch (options.evictor) {
                    case Evictor.Lru:
                        cmd.push(Evictor.Lru);
                        break;
                    case Evictor.Nop:
                        cmd.push(Evictor.Nop);
                        break;
                    case Evictor.Random:
                        cmd.push(Evictor.Random);
                        break;
                }
            }
            if (options.ifNotExists) {
                cmd.push("IF", "NOT", "EXISTS");
            }
        }

        return this.sendCommand(cmd, options);
    }

    async drop(
        keyspace: string | Buffer,
        options: DropCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["DROP", keyspace];
        if (options && options.ifExists) {
            cmd.push("IF", "EXISTS");
        }

        return this.sendCommand(cmd, options);
    }

    async set(
        keyspace: string | Buffer,
        key: string | Buffer,
        value: string | Buffer,
        options: SetCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["SET", keyspace, key, value];
        if (options) {
            if (options.expireAfter) {
                cmd.push("EXPIRE", "AFTER", options.expireAfter.toString());
            } else if (options.expireAt) {
                cmd.push("EXPIRE", "AT", options.expireAt.toString());
            }

            if (options.ifExists) {
                cmd.push("IF", "EXISTS");
            } else if (options.ifNotExists) {
                cmd.push("IF", "NOT", "EXISTS");
            }
        }

        return this.sendCommand(cmd, options);
    }

    async get(
        keyspace: string | Buffer,
        key: string | Buffer,
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["GET", keyspace, key];

        return this.sendCommand(cmd, options);
    }

    async del(
        keyspace: string | Buffer,
        key: string | Buffer,
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["DEL", keyspace, key];

        return this.sendCommand(cmd, options);
    }

    async ttl(
        keyspace: string | Buffer,
        key: string | Buffer,
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["TTL", keyspace, key];

        return this.sendCommand(cmd, options);
    }

    async count(
        keyspace: string | Buffer,
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["COUNT", keyspace];

        return this.sendCommand(cmd, options);
    }

    async keyspaces(
        options?: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        const cmd = ["KEYSPACES"];

        return this.sendCommand(cmd, options);
    }

    async ping(options?: SegmentCommandOptions): Promise<SegmentCommandReply> {
        const cmd = ["PING"];

        return this.sendCommand(cmd, options);
    }
}
