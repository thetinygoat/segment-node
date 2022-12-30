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
    asBuffer?: boolean;
}

export enum Evictor {
    Lru = "LRU",
    Random = "RANDOM",
    Nop = "NOP",
}

export interface CreateCommandOptions extends SegmentCommandOptions {
    evictor?: Evictor;
    ifNotExists?: boolean;
}

export interface DropCommandOptions extends SegmentCommandOptions {
    ifExists: boolean;
}

export interface SetCommandOptionsWithIfExistsAndExpireAt
    extends SegmentCommandOptions {
    ifExists?: boolean;
    ifNotExists?: never;
    expireAt?: number;
    expireAfter?: never;
}

export interface SetCommandOptionsWithIfExistsAndExpireAfter
    extends SegmentCommandOptions {
    ifExists?: boolean;
    ifNotExists?: never;
    expireAt?: never;
    expireAfter?: number;
}

export interface SetCommandOptionsWithIfNotExistsAndExpireAt
    extends SegmentCommandOptions {
    ifExists?: never;
    ifNotExists?: boolean;
    expireAt?: number;
    expireAfter?: never;
}

export interface SetCommandOptionsWithIfNotExistsAndExpireAfter
    extends SegmentCommandOptions {
    ifExists?: never;
    ifNotExists?: boolean;
    expireAt?: never;
    expireAfter?: number;
}

export type SetCommandOptions =
    | SetCommandOptionsWithIfExistsAndExpireAt
    | SetCommandOptionsWithIfExistsAndExpireAfter
    | SetCommandOptionsWithIfNotExistsAndExpireAt
    | SetCommandOptionsWithIfNotExistsAndExpireAfter;
