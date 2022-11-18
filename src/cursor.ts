export class Cursor {
    private buffer: Buffer;
    private cursor = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    read(n: number): Buffer | null {
        if (this.cursor + n > this.buffer.length) {
            return null;
        }
        const buf = this.buffer.subarray(this.cursor, this.cursor + n);
        this.cursor += n;

        return buf;
    }

    readUntil(delim: number): Buffer | null {
        let i = this.cursor;
        while (i < this.buffer.length) {
            if (this.buffer[i] === delim) {
                const result = this.buffer.subarray(this.cursor, i + 1);
                this.cursor = i + 1;
                return result;
            }
            i++;
        }

        return null;
    }

    skip(n: number): number | null {
        if (this.cursor + n > this.buffer.length) {
            return null;
        }
        this.cursor += n;
        return n;
    }

    position(): number {
        return this.cursor;
    }
}
