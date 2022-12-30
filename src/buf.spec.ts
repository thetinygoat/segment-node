import { Buf } from "./buf";

test("write should write data into the buffer", () => {
    const buf = new Buf(100);
    buf.write(Buffer.from("hello"));
    expect(buf.getRef()).toEqual(Buffer.from("hello"));
    expect(buf.capacity()).toBe(100);
});

test("advance should advance the buffer", () => {
    const buf = new Buf(100);
    buf.write(Buffer.from("hello"));
    buf.advance(3);
    expect(buf.getRef()).toEqual(Buffer.from("lo"));
});

test("write greater than capacity should resize the buffer", () => {
    const buf = new Buf(4);
    buf.write(Buffer.from("hello"));
    expect(buf.getRef()).toEqual(Buffer.from("hello"));
    expect(buf.capacity()).toBe(8);
});
