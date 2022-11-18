import { StringDecoder } from "string_decoder";
import { ErrorReply, SegmentCommandReply } from "../command";
import { Buf } from "../buf";
import { Cursor } from "../cursor";

enum Type {
    String = 36,
    Integer = 69,
    Array = 42,
    Boolean = 94,
    Null = 45,
    Map = 35,
    Double = 46,
    Error = 33,
}

enum Delimiter {
    CR = 13,
    LF = 10,
}

export interface DecoderConfig {
    onReply(reply: SegmentCommandReply): void;
    asBuffer(): boolean;
}

enum BufferDecoder {
    String,
    Buffer,
}

// Decoder is a state machine that keeps track of all the chunks that we get from the socket
// and builds replies for commands
export class Decoder {
    private buffer: Buf;
    private config: DecoderConfig;
    private stringDecoder: StringDecoder;
    private currentBufferDecoder = BufferDecoder.String;

    constructor(config: DecoderConfig) {
        this.buffer = new Buf(4096);
        this.config = config;
        this.stringDecoder = new StringDecoder();
    }

    write(data: Buffer): void {
        this.buffer.write(data);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.currentBufferDecoder = this.config.asBuffer()
                ? BufferDecoder.Buffer
                : BufferDecoder.String;
            const cursor = new Cursor(this.buffer.getRef());
            const reply = this.parseReply(cursor);
            if (reply === undefined) {
                break;
            }
            this.buffer.advance(cursor.position());
            this.config.onReply(reply);
        }
    }

    private parseReply(cursor: Cursor): SegmentCommandReply | undefined {
        let line = this.readLine(cursor);
        if (!line) {
            return undefined;
        }

        const type = line[0];
        line = line.subarray(1);
        switch (type) {
            case Type.String:
                return this.parseStringReply(line, cursor);
            case Type.Null:
                return null;
            case Type.Integer:
                return this.parseIntegerReply(line);
            case Type.Double:
                return this.parseDoubleReply(line);
            case Type.Boolean:
                return this.parseBooleanReply(line);
            case Type.Error:
                return this.parseErrorReply(line, cursor);
            case Type.Array:
                return this.parseArrayReply(line, cursor);
            case Type.Map:
                return this.parseMapReply(line, cursor);
            default:
                throw new Error("Unknown type received");
        }
    }

    private readLine(cursor: Cursor): Buffer | null {
        const line = cursor.readUntil(Delimiter.LF);
        if (!line) return null;
        return line.subarray(0, line.length - 2);
    }

    private parseStringReply(
        line: Buffer,
        cursor: Cursor
    ): SegmentCommandReply | undefined {
        const length = parseInt(line.toString());
        if (!length) {
            return undefined;
        }
        const data = cursor.read(length);
        if (!data) {
            return undefined;
        }

        if (!cursor.skip(2)) {
            return undefined;
        }

        if (this.currentBufferDecoder === BufferDecoder.String) {
            return this.stringDecoder.end(data);
        }

        return data;
    }

    private parseIntegerReply(buf: Buffer): SegmentCommandReply | undefined {
        return parseInt(buf.toString());
    }

    private parseDoubleReply(buf: Buffer): SegmentCommandReply | undefined {
        return parseFloat(buf.toString());
    }

    private parseBooleanReply(buf: Buffer): SegmentCommandReply | undefined {
        const num = parseInt(buf.toString());
        return num === 0 ? false : true;
    }

    private parseErrorReply(
        line: Buffer,
        cursor: Cursor
    ): SegmentCommandReply | undefined {
        const length = parseInt(line.toString());
        if (!length) {
            return undefined;
        }
        const data = cursor.read(length);
        if (!data) {
            return undefined;
        }

        if (!cursor.skip(2)) {
            return undefined;
        }

        return new ErrorReply(this.stringDecoder.end(data));
    }

    private parseArrayReply(
        line: Buffer,
        cursor: Cursor
    ): SegmentCommandReply | undefined {
        const arrayLength = parseInt(line.toString());
        const array: SegmentCommandReply[] = [];
        for (let i = 0; i < arrayLength; i++) {
            const reply = this.parseReply(cursor);
            if (!reply) {
                return undefined;
            }
            array.push(reply);
        }

        return array;
    }

    private parseMapReply(
        line: Buffer,
        cursor: Cursor
    ): SegmentCommandReply | undefined {
        const mapLength = parseInt(line.toString());
        const map: Record<string, unknown> = {};

        for (let i = 0; i < mapLength; i++) {
            const key = this.parseReply(cursor);
            if (!key) {
                return undefined;
            }
            const value = this.parseReply(cursor);
            if (!value) {
                return undefined;
            }

            map[key as string] = value;
        }

        return map;
    }
}
