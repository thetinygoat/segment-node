import { Socket } from "net";
import { EventEmitter } from "stream";
import { SegmentCommand } from "./command";

export interface SegmentConnectionOptions {
    host: string;
    port: number;
}

export class SegmentConnection extends EventEmitter {
    private sock: Socket;
    private options: SegmentConnectionOptions;
    private isOpen: boolean;
    private _needsDrain: boolean;
    constructor(options: SegmentConnectionOptions) {
        super();
        this.sock = new Socket();
        this.options = options;
        this.isOpen = false;
        this._needsDrain = false;
        this.sock
            .on("data", (data) => {
                this.emit("data", data);
            })
            .on("drain", () => {
                this._needsDrain = false;
                this.emit("drain");
            });
    }

    open(): Promise<void> {
        if (this.isOpen) {
            throw new Error("Connection is already open");
        }
        return new Promise((resolve) => {
            this.sock.connect(this.options.port, this.options.host, () => {
                this.isOpen = true;
                return resolve();
            });
        });
    }

    writeCommand(command: SegmentCommand): void {
        if (!this.isOpen) {
            throw new Error("Connection with the segment server is not open");
        }
        for (const argument of command) {
            // sock.write returns false when the stream needs to drain
            // if we get false we mark the _needsDrain as true so that
            // subsequent event loop ticks don't process any commands until
            // the stream as drained. When the stream has drained it will
            // emit a 'drain' event that's when we can start processing
            // commands again
            this._needsDrain = !this.sock.write(argument);
        }
    }

    needsDrain(): boolean {
        return this._needsDrain;
    }
}
