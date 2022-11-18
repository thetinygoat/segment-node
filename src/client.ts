import {
    SegmentCommand,
    SegmentCommandOptions,
    SegmentCommandReply,
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
}
