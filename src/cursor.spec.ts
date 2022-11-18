import { Cursor } from "./cursor";

test("readUntil CR should return a buffer with CR", () => {
    const cur = new Cursor(Buffer.from("$100\r\n"));
    expect(cur.readUntil(13)).toEqual(Buffer.from("$100\r"));
});

test("readUntil LF should return a buffer with LF", () => {
    const cur = new Cursor(Buffer.from("$100\r\n"));
    expect(cur.readUntil(10)).toEqual(Buffer.from("$100\r\n"));
});

test("readUntil LF with no LF should return null", () => {
    const cur = new Cursor(Buffer.from("$100\r"));
    expect(cur.readUntil(10)).toBe(null);
});

test("read given buffer with complete string frame reads string", () => {
    const cur = new Cursor(Buffer.from("$3\r\nfoo\r\n"));
    expect(cur.readUntil(10)).toEqual(Buffer.from("$3\r\n"));
    expect(cur.read(5)).toEqual(Buffer.from("foo\r\n"));
});
