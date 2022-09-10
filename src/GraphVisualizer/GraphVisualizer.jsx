import React from "react";
import './GraphVisualizer.css'
import Canvas from './Canvas'

function ifSafari() {
    let ua = navigator.userAgent
    if(ua.includes("Safari/") && !ua.includes("Chrome/") && !ua.includes("Chromium/"))
        return true
    return false
}

function RandomRange(low, high) {
    let x = Math.floor(Math.random() * 10000)
    x = x % (high - low + 1)
    return x + low
}
function CoinFlip() {
    let x = Math.random()
    if(x < 0.5)
        return true
    else return false
}

function PathSelect(props) {
    if(props.drawType == 2)
    return (
        <>
            <div>
                Start Node:&nbsp;<textarea type="text" rows="1" cols="5" 
                            defaultValue = {props.grvis.state.startNode}
                            onChange={(val) => props.grvis.setStartNode(val)}
                            />
                &nbsp;&nbsp;End Node:&nbsp;<textarea type="text" rows="1" cols="5" 
                            defaultValue = {props.grvis.state.endNode}
                            onChange={(val) => props.grvis.setEndNode(val)}
                             />
            </div>
        </>
    );
    
}

function MSTInfo(props) {
    if(props.drawType == 1 && props.directed == true)
    return (
        <>
            <div>
                Graph is considered to be undirected for this algorithm.
            </div>
        </>
    )
}

function HamiltonianInfo(props) {
    if(props.drawType == 3)
    return (
        <>
            <div>
                The hamiltonian circuit shown does not necessarily have the lowest cost.
            </div>
        </>
    )
}

export default class GraphVisualizer extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            n: 5,
            list: [[1, 2], [1, 3], [1, 4], [4, 5]],
            drawType: 0,
            startNode: 5, endNode: 5,
            directed: false,
        };
    }
    setNodes(val) {
        for(let i = 0; i < val.target.value.length; i ++) {
            if(!(val.target.value[i] >= '0' && val.target.value[i] <= '9'))
                return
        }
        this.setState({ n: val.target.value });
    }
    setEdges(val) {
        let Edges = val.split("\n");
        let arr = new Array();
        Edges.forEach(element => {
            for(let i = 0; i < element.length; i ++) {
                if(!(element[i] == ' ' || (element[i] >= '0' && element[i] <= '9')))
                    return
            }
            let nodes = element.split(" ");
            let vertex = new Array(3)
            vertex[0] = nodes[0];
            vertex[1] = nodes[1];
            vertex[2] = (nodes.length == 2 || nodes[2] == undefined || nodes[2] == '' || nodes[2] == NaN) ? '' : nodes[2];
            arr.push(vertex)
        });
        this.setState({list: arr});
    }
    makeUndirected() {
        this.setState({directed: false})
        document.getElementById('btn-directed').classList.remove('active')
        document.getElementById('btn-undirected').classList.add('active')
    }
    makeDirected() {
        this.setState({directed: true})
        document.getElementById('btn-directed').classList.add('active')
        document.getElementById('btn-undirected').classList.remove('active')
    }
    deactivateAllButtons() {
        document.getElementById('btn-draw').classList.remove('active')
        document.getElementById('btn-mst').classList.remove('active')
        document.getElementById('btn-dij').classList.remove('active')
        document.getElementById('btn-hamilton').classList.remove('active')
    }
    drawGraph() {
        this.setState({drawType: 0})
        this.deactivateAllButtons()
        document.getElementById('btn-draw').classList.add('active')
    }
    drawMst() {
        this.setState({drawType: 1})
        this.deactivateAllButtons()
        document.getElementById('btn-mst').classList.add('active')
    }
    drawShortestPath() {
        this.setState({drawType: 2, startNode: 1, endNode: this.state.n})
        this.deactivateAllButtons()
        document.getElementById('btn-dij').classList.add('active')
    }
    drawHamiltonianCircuit() {
        this.setState({drawType: 3})
        this.deactivateAllButtons()
        document.getElementById('btn-hamilton').classList.add('active')
    }
    setStartNode(val) {
        this.setState({startNode: val.target.value})
    }
    setEndNode(val) {
        this.setState({endNode: val.target.value})
    }
    generateRandomGraph() {
        let n, m, x, y, z, str = ""
        let used

        if(CoinFlip()) {
            n = 9
            m = RandomRange(4, 9)
        } else {
            n = 25
            m = RandomRange(8, 15)
        }
        used = new Array(n + 1)
        for(let i = 1; i <= n; i ++) {
            used[i] = new Array(n + 1)
            for(let j = 1; j <= n; j ++)
                used[i][j] = 0
        }
        for(let i = 0; i < m; i ++) {
            x = RandomRange(1, n)
            y = RandomRange(1, n-1)
            if(y >= x)
                y ++
            z = RandomRange(0, 20)
            if(used[x][y] == 0 && used[y][x] == 0) {
                used[x][y] = 1
                str = str + x + " " + y + " " + z + "\n"
                document.getElementById("EdgesInput").value = str
                this.setEdges(document.getElementById("EdgesInput").value)
            }// else m ++
        }

        if(CoinFlip())
            this.makeDirected()
        else this.makeUndirected()
        
        
        document.getElementById("nodeInput").value = n
        this.setState({n: n})
    }
    render() {
        return (
            <>
                <div class="topbar">
                    <h1>Graph Algorithms Visualizer</h1>
                </div>
                <div class="content">
                    <div class="left">
                        <div align="left">
                            <button class="smallButtons active" type="button" id='btn-undirected' onClick={() => this.makeUndirected()}>Undirected</button>
                            <button class="smallButtons" type="button" id='btn-directed' onClick={() => this.makeDirected()}>Directed</button>
                            <button class="smallButtons generateRandomGraph" type="button" onClick={() => this.generateRandomGraph()}>Generate Random Graph</button>
                        </div>
                        <div align="left">
                            Node Count:<br/> <textarea type="text" maxLength="2" rows="1" cols={ifSafari() ? "57" : "50"} defaultValue={this.state.n} onChange={(val) => this.setNodes(val)}
                                             placeholder={"Enter node count (max. 99)"} id = "nodeInput"/>
                        </div><br/>
                        <div align="left">
                            {this.state.directed == false ? "Edges:" : "Arcs:"}<br/> <textarea type="text" rows="15" cols={ifSafari() ? "57" : "50"}
                                    placeholder={this.state.directed == false ? "Enter edges in following format: \nNode1 Node2 (Weight)" :
                                                                                "Enter arcs in following format: \nNode1 Node2 (Weight)"}
                                    defaultValue = {"1 2\n1 3\n1 4\n4 5"}
                                    onChange={(val) => this.setEdges(val.target.value)}
                                    id="EdgesInput"
                                    />
                        </div><br/>

                        <div class="buttonsLeft">
                            Task:<br/>
                            <button class="buttons active" type="button" id='btn-draw' onClick={() => this.drawGraph()}>Draw Graph</button>
                            <button class="buttons" type="button" id='btn-mst' onClick={() => this.drawMst()}>Minimum Spanning Tree</button>
                            <button class="buttons" type="button" id='btn-dij' onClick={() => this.drawShortestPath()}>Shortest Path</button>
                            <button class="buttons" type="button" id='btn-hamilton' onClick={() => this.drawHamiltonianCircuit()}>Hamiltonian Circuit</button>
                        </div><br/>
                        <div class="bonusInfo">
                            <PathSelect drawType={this.state.drawType} grvis = {this}/>
                        </div>
                        <div class="bonusInfo">
                            <MSTInfo drawType={this.state.drawType} directed={this.state.directed}/>
                        </div>
                        <div class="bonusInfo">
                            <HamiltonianInfo drawType={this.state.drawType}/>
                        </div>
                        <br/>
                    </div>
                    
                    <div class="right" id="canvasDiv">
                        <Canvas data = {this.state}/>
                    </div>
                    
                </div>
            </>
        );
    }
}