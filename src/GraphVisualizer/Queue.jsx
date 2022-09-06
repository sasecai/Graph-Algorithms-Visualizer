export default class Queue {
    constructor(size) {
        this.fullSize = size
        this.q = new Array(size)
        this.b = -1
        this.a = 0
        this.pushes = 0
        this.pops = 0
    }
    push(val) {
        this.b ++
        if(this.b == this.fullSize)
            this.b = 0
        this.q[this.b] = val
        this.pushes ++
    }
    pop() {
        this.a ++
        if(this.a == this.fullSize)
            this.a = 0
        this.pops ++
    }
    front() {
        if(this.pops >= this.pushes)
            return null
        return this.q[this.a]
    }
    empty() {
        if(this.pushes > this.pops)
            return false
        return true
    }
    size() {
        return this.pushes - this.pops
    }
}