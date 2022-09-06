class Node {
    constructor(data) {
        this.data = data
        this.next = null
    }
}

export default class LinkedList {
    constructor() {
        this.head = null
    }
    add(elem) {
        var node = new Node(elem)
        if(this.head == null) {
            this.head = node
        }
        else {
            node.next = this.head
            this.head = node
        }
    }
}
