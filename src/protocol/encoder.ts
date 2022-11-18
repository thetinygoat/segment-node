import { SegmentCommand } from "../command";

const CRLF = "\r\n";

export const encodeCommand = (args: SegmentCommand): SegmentCommand => {
    const buffer: SegmentCommand = [];

    let arrayHeader = "*" + args.length + CRLF;

    for (const arg of args) {
        if (typeof arg === "string") {
            arrayHeader += "$" + Buffer.byteLength(arg) + CRLF + arg + CRLF;
        } else if (arg instanceof Buffer) {
            buffer.push(arrayHeader + "$" + arg.length.toString() + CRLF, arg);
            arrayHeader = CRLF;
        } else {
            throw new Error("Invalid command argument type");
        }
    }

    buffer.push(arrayHeader);

    return buffer;
};
