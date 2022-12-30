export class Buf {
    private _buffer: Buffer;
    private _capacity: number;
    private _length = 0;
    constructor(capacity: number) {
        this._capacity = capacity;
        this._buffer = Buffer.alloc(this._capacity);
    }

    write(chunk: Buffer): void {
        while (!this.canWriteChunk(chunk)) {
            this.resize();
        }

        this._buffer.fill(chunk, this._length, this._length + chunk.length);
        this._length += chunk.length;
    }

    private canWriteChunk(chunk: Buffer): boolean {
        if (chunk.length >= this._capacity - this._length) {
            return false;
        }
        return true;
    }

    private resize() {
        const buf = Buffer.alloc(this._capacity);
        this._buffer = Buffer.concat([this._buffer, buf]);
        this._capacity = 2 * this._capacity;
    }

    private shift(n: number): void {
        n = Math.min(n, this._buffer.length);
        this._buffer = Buffer.concat([
            this._buffer.subarray(n),
            Buffer.alloc(n),
        ]);
        this._length -= n;
    }

    advance(n: number): void {
        this.shift(n);
    }

    getRef(): Buffer {
        return this._buffer.subarray(0, this._length);
    }

    capacity(): number {
        return this._capacity;
    }
}
