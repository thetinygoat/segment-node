import {
    CommandWaitingForReply,
    CommandWaitingToBeSent,
    ErrorReply,
    SegmentCommand,
    SegmentCommandOptions,
    SegmentCommandReply,
} from "./command";
import { SegmentConnection } from "./connection";
import List from "./list";
import { Decoder } from "./protocol/decoder";
import { encodeCommand } from "./protocol/encoder";

export class EventLoop {
    private commandsWaitingToBeSent: List<CommandWaitingToBeSent>;
    private commandsWaitingForReply: List<CommandWaitingForReply>;
    private connection: SegmentConnection;
    private decoder: Decoder;

    constructor(connection: SegmentConnection) {
        this.commandsWaitingToBeSent = new List();
        this.commandsWaitingForReply = new List();
        this.connection = connection;
        this.connection
            .on("data", (data) => this.onData(data))
            .on("drain", () => this.tick());
        this.decoder = new Decoder({
            // as buffer tells the decoder if the response should be sent as a buffer instead of a string.
            // this is a dynamic function which will look the the head of commandsWaitingForReply queue
            // to figure out if the reply needs to be sent as buffer
            asBuffer: (): boolean => {
                const command = this.commandsWaitingForReply.head();
                if (!command) {
                    return false;
                }

                return command.options.asBuffer || false;
            },
            // onReply is a dynamic function which will be called when the decoder has built up
            // a reply. this will pop the command from commandsWaitingForReply and call it's
            // resolve or reject handlers based on the reply
            onReply: (reply): void => {
                const command = this.commandsWaitingForReply.pop();
                // if the onReply is called but there is no command to be executed
                // we messed up and we need to throw an error
                if (!command) {
                    throw new Error(
                        "Unwanted reply received from segment server"
                    );
                }

                const { resolve, reject } = command;
                if (reply instanceof ErrorReply) {
                    return reject(reply);
                }
                resolve(reply);
            },
        });
    }

    // queues a command to be sent to the server
    queueCommand(
        command: SegmentCommand,
        options: SegmentCommandOptions
    ): Promise<SegmentCommandReply> {
        return new Promise((resolve, reject) => {
            this.commandsWaitingToBeSent.push({
                resolve,
                reject,
                command,
                options,
            });
        });
    }

    // returns the next command from the queue to be executed
    // it also pushes the command to the list of commands waiting for reply
    private getNextCommand(): CommandWaitingToBeSent | null {
        const command = this.commandsWaitingToBeSent.pop();
        if (!command) {
            return null;
        }

        this.commandsWaitingForReply.push({
            options: command.options,
            reject: command.reject,
            resolve: command.resolve,
        });

        return command;
    }

    tick(): void {
        // if the stream needs to drain, avoid processing any commands
        if (this.connection.needsDrain()) {
            return;
        }

        // keep processing commands until the connection needs to drain
        // or until all the commands have been sent
        while (!this.connection.needsDrain()) {
            const command = this.getNextCommand();
            // if there are no more commands, stop the loop
            if (!command) {
                break;
            }

            this.connection.writeCommand(encodeCommand(command.command));
        }
    }

    private onData(data: Buffer): void {
        this.decoder.write(data);
    }
}
