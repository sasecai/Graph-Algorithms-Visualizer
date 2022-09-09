import React, { useEffect, useRef, useState } from 'react'
import LinkedList from './LinkedLists'
import Queue from './Queue'

// Given line AB, A(x1, y1), B(x2, y2), gets point at distance sz from B towards A, on the line AB
function getPointAtDistance(x1, y1, x2, y2, sz) {
    let m = (x2 == x1) ? 0 : ((y2 - y1) / (x2 - x1))
    let n = y1 - x1 * m
    let x, y
    let r = sz
    if(x2 == x1) {
        x = x1
        if(y2 > y1)
            y = y2 - r
        else
            y = y2 + r
    } else {
        x = x2 - (r / (Math.sqrt(m * m + 1))) * (x2 > x1 ? 1 : -1)
        y = m * x + n
    }
    return [x, y]
}
function getRightTrianglePoint(pb, p1, r) {
    let x, y
    if(p1[0] == pb[0]) {
        x = pb[0] + r
        y = pb[1]
    } else if(p1[1] == pb[1]) {
        x = pb[0]
        y = pb[1] + r
    } else {
        let m = ((p1[1] - pb[1]) / (p1[0] - pb[0]))
        let mr = -1 / m
        let nr = pb[1] - pb[0] * mr
        x = pb[0] + (r / (Math.sqrt(mr * mr + 1)))
        y = mr * x + nr
    }
    return [x, y]
}
function getWeightPos(x1, y1, x2, y2, mid, m, r) {
    let x, y
    if(x1 == x2) {
        x = mid[0] + r
        y = mid[1] - r * 0.2
    } else if(y1 == y2) {
        x = mid[0] + r * 0.4
        y = mid[1] + r
    } else {
        let mr = -1 / m
        let nr = mid[1] - mid[0] * mr
        x = mid[0] + (r / (Math.sqrt(mr * mr + 1)))
        y = mr * x + nr
    }
    return [x, y]
}
function getPointAtDistanceBezier(p0, p1, p2, r) {
    let dist = Math.sqrt((p2[1] - p0[1]) * (p2[1] - p0[1]) + (p2[0] - p0[0]) * (p2[0] - p0[0]))
    let t = (dist - r) / dist
    return [(((1 - t) * (1 - t) * p0[0]) + 2 * (1 - t) * t * p1[0] + t * t * p2[0]), 
            (((1 - t) * (1 - t) * p0[1]) + 2 * (1 - t) * t * p1[1] + t * t * p2[1])]
}

function getLeftTrianglePoint(pb, p1, r) {
    let x, y
    if(p1[0] == pb[0]) {
        x = pb[0] - r
        y = pb[1]
    } else if(p1[1] == pb[1]) {
        x = pb[0]
        y = pb[1] - r
    } else {
        let m = ((p1[1] - pb[1]) / (p1[0] - pb[0]))
        let mr = -1 / m
        let nr = pb[1] - pb[0] * mr
        x = pb[0] - (r / (Math.sqrt(mr * mr + 1)))
        y = mr * x + nr
    }
    return [x, y]
}

const Canvas = props => {
    const canvasRef = useRef(null)
    const { data } = props
    
    var unit
    var accentEdges, accentNodes

    const drawCircle = (ctx, x, y, r, col) => {
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2*Math.PI)
        ctx.fill()
    }

    const drawText = (ctx, x, y, text, size, col, align = "center") => {
        ctx.font = size + "px arial";
        ctx.textAlign = align
        ctx.fillStyle = col
        ctx.fillText(text, x, y);
    }

    const drawNode = (ctx, number, x, y, size, col) => {
        drawCircle(ctx, x, y, size * 1.15, col)
        drawCircle(ctx, x, y, size, '#FFF')
        drawText(ctx, x, y+(size * (7/20)), number, size, col)
    }

    const displayErrorMessage = (ctx, midx, midy, canvasSize, errorMessage, textCol, bgCol) => {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, canvasSize)
        ctx.lineTo(canvasSize, canvasSize)
        ctx.lineTo(canvasSize, 0)
        ctx.fillStyle = bgCol
        ctx.fill()
        drawText(ctx, midx, midy, errorMessage, canvasSize / 540 * 30, textCol)
    }

    function isBezier(a, b) {
        let t = a % b
        let ok = false
        if(t >= -0.001 && t <= 0.001)
            ok = true
        if(t - b >= -0.001 && t - b <= 0.001)
            ok = true
        if(ok == true && a - 2 * b > -0.001)
            return true
        return false
    }

    const drawVertex = (ctx, x1, y1, x2, y2, size, col, directed, weight) => {
        ctx.strokeStyle = col
        ctx.beginPath()
        let m = (x2 == x1) ? 0 : ((y2 - y1) / (x2 - x1))
        let n = y1 - x1 * m

        ctx.moveTo(x1, y1)
        
        let bezier = false, highDistance = false, mpx, mpy, arrowMultiplier = 0.85, middlex, middley
        
        let dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
        if( (isBezier(dist, 4 * unit)) ||
            (isBezier(dist, 2 * Math.sqrt(2) * unit))
            )
            bezier = true
        if(bezier == false && dist > 10 * unit) {
            bezier = true
            highDistance = true
        }
        if(bezier == true) {
            let midx = (x1 + x2) / 2, midy = (y1 + y2) / 2
            let totalManhattan  = Math.abs(y2 - y1) + Math.abs(x2 - x1)
            let anglex = Math.abs(x2 - x1) / totalManhattan
            let angley = Math.abs(y2 - y1) / totalManhattan
            if((x1 > x2 && y1 > y2) || (x1 < x2 && y1 < y2))
                { anglex *= -1; angley *= 1 }
            if(x1 > x2 && y1 == y2)
                { anglex *= 1; angley *= 1 }
            
            let degree = 0.4 * dist
            if(highDistance == true) {
                degree *= 0.3
                arrowMultiplier = 1
            }
            ctx.bezierCurveTo(
                x1, y1, 
                midx + degree * angley, midy + degree * anglex, 
                x2,  y2
                );
            mpx = midx + degree * angley
            mpy = midy + degree * anglex
            middlex = (((x1 + x2) / 2) + mpx) / 2
            middley = (((y1 + y2) / 2) + mpy) / 2
        } else {
            ctx.lineTo(x2, y2)
            middlex = (x1 + x2) / 2
            middley = (y1 + y2) / 2
        }
        
        ctx.lineWidth = size * 0.15
        ctx.stroke()


        if(directed == true) {
            if(bezier == false) {
                let p1, pb, p2, p3
                p1 = getPointAtDistance(x1, y1, x2, y2, size)
                pb = getPointAtDistance(x1, y1, x2, y2, size * 1.5)
                p2 = getRightTrianglePoint(pb, p1, size * 0.3)
                p3 = getLeftTrianglePoint(pb, p1, size * 0.3)
                ctx.beginPath()
                ctx.moveTo(p1[0], p1[1])
                ctx.lineTo(p2[0], p2[1])
                ctx.lineTo(p3[0], p3[1])
                ctx.fillStyle = col
                ctx.fill()
            } else {
                let p1, pb, p2, p3
                // P0(x1, y1), P1(mpx, mpy), P2(x2, y2)
                p1 = getPointAtDistanceBezier([x1, y1], [mpx, mpy], [x2, y2], size * arrowMultiplier)
                pb = getPointAtDistanceBezier([x1, y1], [mpx, mpy], [x2, y2], size * 1.5 * arrowMultiplier)
                p2 = getRightTrianglePoint(pb, p1, size * 0.3)
                p3 = getLeftTrianglePoint(pb, p1, size * 0.3)
                ctx.beginPath()
                ctx.moveTo(p1[0], p1[1])
                ctx.lineTo(p2[0], p2[1])
                ctx.lineTo(p3[0], p3[1])
                ctx.fillStyle = col
                ctx.fill()
            }
        }
        // Draw weights
        let weightPos
        weightPos = getWeightPos(x1, y1, x2, y2, [middlex, middley], m, size * 0.7)
        drawText(ctx, weightPos[0], weightPos[1], weight == undefined ? '' : weight, size * 0.6, col, (y1 == y2) ? "left" : "center")
    }
    
    function goodVert(vert) {
        if(vert[0] != '' && vert[0] != null && vert[1] != '' && vert[1] != null &&
        parseInt(vert[0]) >= 1 && parseInt(vert[0]) <= parseInt(data.n) && 
        parseInt(vert[1]) >= 1 && parseInt(vert[1]) <= parseInt(data.n)
        )
            return true;
        return false;
    }
    const updateCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        context.canvas.width = window.innerWidth
        context.canvas.height = window.innerHeight
        
        context.clearRect(0, 0, canvas.width, canvas.height)

        /**
         * 1. Set node positions
         * 2. Draw Edges
         * 3. Draw nodes
         */

        let nodeSize
        
        if(data.n <= 9)
            nodeSize = 25
        else if(data.n <= 25)
            nodeSize = 18
        else if(data.n <= 49)
            nodeSize = 13
        else if(data.n <= 81)
            nodeSize = 10
        else
            nodeSize = 8.5
        
        var canvasDiv = document.getElementById('canvasDiv')
        let canvasWidth = canvasDiv.clientWidth
        if(window.innerWidth > 1140) {
            canvasWidth = 540
            canvasDiv.setAttribute("style", "width: 540px; height: 540px;")
        } else
        if(window.innerWidth > 900 && window.innerWidth <= 1140) {
            canvasWidth = 540 - (1140 - window.innerWidth)
            let attributes = "width: " + canvasWidth + "px; height: " + canvasWidth
            + "px; top: " + ((1140 - window.innerWidth) * 0.225) + "px;"
            canvasDiv.setAttribute("style", attributes)
        } else if(window.innerWidth <= 900) {
            canvasWidth = 440
            canvasDiv.setAttribute("style", "width: 440px; height: 440px;")
        }
        nodeSize *= canvasWidth / 540
        let midx = canvasWidth / 2, midy = canvasWidth / 2
        
        let nodePos = new Array(data.n+1)
        unit = nodeSize
        
        if(data.n <= 9)
            unit *= 2
        else if(data.n <= 25)
            unit *= 1.7
        else if(data.n <= 49)
            unit *= 1.6
        else if(data.n <= 81)
            unit *= 1.6
        else 
            unit *= 1.5

        let totalSteps, dir, steps
        let go = [[-1, -1], [-1, 1], [1, 1], [1, -1]]
        for(let i = 1; i <= data.n; i ++) {
            nodePos[i] = [0, 0]
            if(i == 1)
                nodePos[i] = [0, 0]
            else if([1, 9, 25, 49, 81].includes(i-1)) {
                nodePos[i] = [(Math.floor((Math.sqrt(i-1) / 2)) + 1) * (4 * unit), 0]
                totalSteps = Math.sqrt(i-1) + 1
                steps = 0
                dir = 0
            } else {
                nodePos[i] = [nodePos[i-1][0] + go[dir][0] * (2 * unit), nodePos[i-1][1] + go[dir][1] * (2 * unit)]
                steps ++
                if(steps == totalSteps) {
                    steps = 0
                    dir ++
                }
            }
        }

        for(let i = 1; i <= data.n; i ++) {
            nodePos[i] = [nodePos[i][0] + midx, nodePos[i][1] + midy]
        }
        
        let defColor = '#000', accentColor = '#ff0000';
        if(data.drawType == 0 || data.n == '') {

        } else
        if(data.drawType == 1) {
            defColor = '#CCCCCC';
            accentColor = '#bf0d00';
            [accentEdges, accentNodes] = getMST()
        } else if(data.drawType == 2) {
            defColor = '#121212';
            accentColor = '#32a852';
            [accentEdges, accentNodes] = bellmanford()
        } else if(data.drawType == 3) {
            defColor = '#121212';
            accentColor = '#4287f5';
            [accentEdges, accentNodes] = hamiltonianCircuit()
        }

        data.list.forEach(vert => {
            if(goodVert(vert))
                drawVertex(context, nodePos[vert[0]][0], nodePos[vert[0]][1],
                    nodePos[vert[1]][0], nodePos[vert[1]][1], nodeSize, defColor, data.directed, vert[2])
        });
        
        let errorMessage = ''
        if(data.drawType != 0 && data.n != '' && accentEdges.length > 0) {
            accentEdges.every(vert => {
                if(vert[0] == -1) {
                    errorMessage = "Found negative cycle!"
                    return false
                } else if(vert[0] == -2) {
                    errorMessage = "No hamiltonian circuit found!"
                    return false
                } else if(vert[0] == -3) {
                    errorMessage = "Only works on undirected graphs!"
                    return false
                } else if(vert[0] == -4) {
                    errorMessage = "Did not find any path!"
                    return false
                }
                let directed = data.directed
                if(data.drawType == 2 || data.drawType == 3)
                    directed = true
                else if(data.drawType == 1)
                    directed = false
                drawVertex(context, nodePos[vert[0]][0], nodePos[vert[0]][1],
                nodePos[vert[1]][0], nodePos[vert[1]][1], nodeSize, accentColor, directed, vert[2])
                return true
            });
        }
        for(let i = 1; i <= data.n; i ++) {
            if(data.drawType != 0 && accentNodes[i] == 1)
                drawNode(context, i, nodePos[i][0], nodePos[i][1], nodeSize, accentColor)
            else
                drawNode(context, i, nodePos[i][0], nodePos[i][1], nodeSize, defColor)
        }
        
        if(errorMessage != '') {
            displayErrorMessage(context, midx, midy, canvasWidth, errorMessage, '#000', '#CCCCCCCC')
        }
    }
    useEffect(() => {
        window.addEventListener('resize', updateCanvas)

        updateCanvas()
        
        return () => { window.removeEventListener('resize', updateCanvas) }
    }, [data])
    
    // <Minimum Spanning Tree
    function cmp(a, b) {
        if(a[2] == '' || parseInt(a[2]) < parseInt(b[2]))
            return -1
        else 
            if(b[2] == '' || parseInt(a[2]) == parseInt(b[2]))
                return 0
        else 
            return 1
    }
    var tt
    function root(x) {
        let r, y
        for(r = x; tt[r] != r; r = tt[r]);
        while(tt[x] != x) {
            y = tt[x]
            tt[x] = r
            x = y
        }
        return r
    }
    function unite(x, y) {
        tt[y] = x
    }

    function getMST() {
        let list = data.list;
        let mstList = new Array(data.n - 1)
        let k = -1
        let m = list.length
        let totalCost = 0
        let mstNodes = new Array(data.n + 1)
        tt = new Array(data.n + 1)

        for(let i = 1; i <= data.n; i ++) {
            tt[i] = i
            mstNodes[i] = 0
        }

        list.sort(cmp)

        for(let i = 0; i < m; i ++) {
            let x = list[i][0]
            let y = list[i][1]
            let cost = list[i][2]
            if(goodVert(list[i]) == false)
                continue;
            if(root(x) != root(y)) {
                unite(root(x), root(y)) 
                totalCost += cost
                mstList[++k] = new Array(3)
                mstList[k] = [x, y, cost]
                mstNodes[x] = 1
                mstNodes[y] = 1
            }
        }
        return [mstList, mstNodes]
    }
    // Minimum Spanning Tree>

    // <Shortest Path
    function bellmanford() {
        var q = new Queue(data.n)
        var v = new Array(data.n + 1)
        var done = new Array(data.n + 1), is = new Array(data.n + 1), best = new Array(data.n + 1),
                    last = new Array(data.n + 1), lastCost = new Array(data.n + 1)

        var pathEdges = new Array(), pathNodes = new Array(data.n + 1)

        if(data.startNode == '' || data.endNode == '' || data.startNode > data.n || data.endNode > data.n) {
            return [pathEdges, pathNodes]
        }

        for(let i = 1; i <= data.n; i ++) {
            v[i] = new LinkedList()
            done[i] = 0
            is[i] = 0
            best[i] = (1 << 30)
            last[i] = -1
            lastCost[i] = - 1
            pathNodes[i] = 0
        }
        data.list.forEach(vert => {
            if(goodVert(vert)) {
                v[parseInt(vert[0])].add([parseInt(vert[1]), (vert.length == 2 || vert[2] == undefined || vert[2] == '' || vert[2] == NaN) ? 0 : parseInt(vert[2]) ])
                if(data.directed == false)
                v[parseInt(vert[1])].add([parseInt(vert[0]), (vert.length == 2 || vert[2] == undefined || vert[2] == '' || vert[2] == NaN) ? 0 : parseInt(vert[2]) ])
            }
        })

        q.push(data.startNode)
        best[data.startNode] = 0
        done[data.startNode] = 1
        is[data.startNode] = 1
        while(!q.empty()) {
            let x = q.front()
            
            is[x] = 0
            q.pop()
            for(let p = v[x].head; p != null; p = p.next) {
                
                if(best[x] + p.data[1] < best[p.data[0]]) {
                    if(done[x] >= data.n) {
                        // negative cycle
                        pathEdges.push([-1, -1, -1])
                        return [pathEdges, pathNodes]
                    }
                    best[p.data[0]] = best[x] + p.data[1]
                    last[p.data[0]] = x
                    lastCost[p.data[0]] = p.data[1]
                    if(is[p.data[0]] == 0) {
                        is[p.data[0]] = 1
                        done[p.data[0]] ++
                        q.push(p.data[0])
                    }
                }
            }
        }
        let to = data.endNode
        let from = last[to]
        if(from == -1) {
            pathEdges.push([-4, -4, -4])
            return [pathEdges, pathNodes]
        }
        pathNodes[to] = 1
        while(from != -1) {
            let vert = new Array(3)
            vert = [from, to, lastCost[to]]
            pathEdges.push(vert)
            pathNodes[from] = 1

            from = last[from]
            to = last[to]
        }
        
        return [pathEdges, pathNodes]   
    }
    // Shortest Path>

    // <Hamiltonian Circuit
    function hamiltonianCircuit() {
        var pathEdges = new Array(data.n), pathNodes = new Array(data.n + 1)
        var v = new Array(data.n + 1)
        var done = new Array(data.n + 1)
        var k = -1, foundAns = false
        for(let i = 1; i <= data.n; i ++) {
            v[i] = new Array()
            pathNodes[i] = 0
            done[i] = 0
        }
        data.list.forEach(vert => {
            if(goodVert(vert)) {
                v[parseInt(vert[0])].push([parseInt(vert[1]), (vert.length == 2 || vert[2] == undefined || vert[2] == '' || vert[2] == NaN) ? 0 : parseInt(vert[2]) ])
                if(data.directed == false) 
                v[parseInt(vert[1])].push([parseInt(vert[0]), (vert.length == 2 || vert[2] == undefined || vert[2] == '' || vert[2] == NaN) ? 0 : parseInt(vert[2]) ])
            }
        })
        function dfs(x) {
            if(k == data.n - 2) {
                for(let i = 0; i < v[x].length; i ++) {
                    if(v[x][i][0] == 1) {
                        foundAns = true
                        pathEdges[++k] = [x, v[x][i][0], v[x][i][1]]
                        break;
                    }
                }
                return
            }
            for(let i = 0; i < v[x].length && foundAns == false; i ++) {
                if(done[v[x][i][0]] == 0) {
                    done[v[x][i][0]] = 1
                    pathEdges[++k] = [x, v[x][i][0], v[x][i][1]]
                    dfs(v[x][i][0])
                    done[v[x][i][0]] = 0
                    k --
                }
            }
        }
        
        done[1] = 1
        dfs(1)

        if(foundAns == true) {
            for(let j = 1; j <= data.n; j ++) {
                pathNodes[j] = 1
            }
            return [pathEdges, pathNodes]
        }
        else {
            pathEdges[0] = [-2, -2, -2]
            return [pathEdges, pathNodes]
        }
    }
    // Hamiltonian Circuit>

    return <canvas ref = {canvasRef} {...props}/>
}

export default Canvas