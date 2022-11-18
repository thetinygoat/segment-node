import List from "./list";

test("empty list should return 0 length", () => {
    const list = new List<number>();
    expect(list.length()).toBe(0);
});

test("pop from empty list should return null", () => {
    const list = new List<number>();
    expect(list.pop()).toBe(null);
});

test("push should push into the list", () => {
    const list = new List<number>();
    list.push(100);
    expect(list.length()).toBe(1);
});

test("pop should pop from the front of the list", () => {
    const list = new List<number>();
    list.push(100);
    list.push(200);
    list.push(300);
    expect(list.length()).toBe(3);
    expect(list.pop()).toBe(100);
    expect(list.pop()).toBe(200);
    expect(list.pop()).toBe(300);
    expect(list.pop()).toBe(null);
    expect(list.pop()).toBe(null);
    expect(list.length()).toBe(0);
});
