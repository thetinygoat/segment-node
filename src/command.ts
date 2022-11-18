export type SegmentCommandArgument = string | Buffer;
export type SegmentCommand = Array<SegmentCommandArgument>;

export type SegmentCommandReply =
    | string
    | Buffer
    | number
    | boolean
    | null
    | ArrayReply
    | ErrorReply
    | MapReply;

export type ArrayReply = Array<SegmentCommandReply>;
export type MapReply = Record<string, unknown>;

export class ErrorReply extends Error {
    constructor(message: string) {
        super(message);
    }
}

export interface CommandWaitingForReply {
    resolve(reply: unknown): void;
    reject(err: unknown): void;
    options: SegmentCommandOptions;
}

export interface CommandWaitingToBeSent extends CommandWaitingForReply {
    command: SegmentCommand;
}

export interface SegmentCommandOptions {
    asBuffer: boolean;
}
