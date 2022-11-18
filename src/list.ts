export class ListNode<T> {
    private _data: T;
    prev: ListNode<T> | null;
    next: ListNode<T> | null;
    constructor(data: T) {
        this._data = data;
        this.prev = null;
        this.next = null;
    }

    data(): T {
        return this._data;
    }
}

export default class List<T> {
    private _head: ListNode<T> | null;
    private tail: ListNode<T> | null;
    private len: number;
    constructor() {
        this._head = null;
        this.tail = null;
        this.len = 0;
    }

    push(data: T): void {
        if (this._head === null) {
            this._head = new ListNode(data);
            this.tail = this._head;
            this.len = 1;
        } else {
            const node = new ListNode(data);
            if (!this.tail) {
                throw new Error("Failed to push the list, invalid tail");
            }

            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
            this.len++;
        }
    }

    pop(): T | null {
        if (!this._head) {
            return null;
        } else {
            const data = this._head.data();
            this.len--;
            // if the next ref is null that means head is the only element in the list
            // so we mark it as null and return the data
            if (this._head.next === null) {
                this._head = null;
                return data;
            }
            const newHead = this._head.next;
            newHead.prev = null;
            this._head.next = null;
            this._head = newHead;

            return data;
        }
    }

    head(): T | null {
        if (!this._head) {
            return null;
        }

        return this._head.data();
    }

    length(): number {
        return this.len;
    }
}
